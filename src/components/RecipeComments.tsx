'use client';

import React, { useEffect, useMemo, useState } from 'react';
import usePublic from '@/hooks/useApiPublic';
import { useAuth } from '@/hooks/useAuth';
import notify from '@/utils/notify';
import { useSecure } from '@/hooks/useApiSecure';
import Image from 'next/image';

type Props = {
  recipeId: string | number;
};

type CommentItem = {
  id: number;
  content: string;
  star: number;
  created_at: string;
  post_by: {
    id: number;
    username: string;
    full_name: string;
    avatar: string;
    email: string;
  };
  recipe: {
    id: number;
    title: string;
    image_url: string;
  };
};

export default function RecipeComments({ recipeId }: Props) {
  const apiSecure = useSecure();
  const { auth } = useAuth();

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!recipeId) return;
    let mounted = true;
    setLoading(true);
    apiSecure
      .get(`/comments/recipe/${recipeId}`)
      .then((res) => {
        if (!mounted) return;
        const data = Array.isArray(res?.data.data) ? res.data.data : [];
        setComments(data);
      })
      .catch((err) => {
        console.error('fetch comments error', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [recipeId]);

  const avgRating = useMemo(() => {
    if (!comments.length) return 0;
    const sum = comments.reduce((s, c) => s + (c.star || 0), 0);
    return Math.round((sum / comments.length) * 10) / 10;
  }, [comments]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!auth) {
      notify('error', 'Vui lòng đăng nhập để bình luận');
      return;
    }
    if (!text.trim()) {
      notify('error', 'Vui lòng nhập nội dung bình luận');
      return;
    }

    const newComment: any = {
      content: text.trim(),
      star: rating,
    };

    // optimistic update
    setSubmitting(true);

    try {
      const res = await apiSecure.post(`/comments/recipe/${recipeId}`, newComment);
      // replace temp comment with server response if provided
      const saved = res?.data;
      setComments((prev) => {
        const filtered = prev.filter((c) => c !== newComment);
        if (saved) return [saved, ...filtered];
        return [newComment, ...filtered];
      });
      setText('');
      setRating(5);
      notify('success', 'Bình luận đã được đăng');
    } catch (err) {
      // rollback optimistic
      console.error('post comment error', err);
      notify('error', 'Không thể gửi bình luận ngay bây giờ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold">Comments</h4>
        <div className="text-sm text-zinc-600">
          {comments.length} comment(s) • {avgRating || '—'} ★
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                aria-label={`Rate ${s}`}
                onClick={() => setRating(s)}
                className={`h-8 w-8 rounded ${
                  s <= rating ? 'bg-yellow-400' : 'bg-zinc-200 dark:bg-zinc-700'
                } flex items-center justify-center`}
              >
                ★
              </button>
            ))}
          </div>
          <div className="text-sm text-zinc-600">Your rating: {rating}</div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder={auth ? 'Write your comment...' : 'Please login to comment'}
          className="w-full p-3 border rounded-md bg-white dark:bg-[#071018] text-sm resize-none"
          disabled={!auth || submitting}
        />

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || !auth}
            className="px-4 py-2 bg-sky-600 text-white rounded disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post comment'}
          </button>
          {!auth && <div className="text-sm text-zinc-500">Bạn cần đăng nhập để gửi bình luận.</div>}
        </div>
      </form>

      <div className="space-y-4">
        {loading ? (
          <div className="text-sm text-zinc-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-sm text-zinc-500">Chưa có bình luận nào.</div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="p-3 bg-slate-50 dark:bg-[#071018] rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <Image
                  src={c.post_by.avatar || '/default-avatar.png'}
                  alt={c.post_by.full_name ?? 'Anonymous'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="w-full flex flex-col items-start justify-center mb-2">
                  <div className="w-full flex items-center justify-between mb-1">
                    <div className="text-sm font-medium">{c.post_by.full_name ?? 'Anonymous'}</div>
                    <div className="text-sm text-zinc-500">
                      {c.created_at ? new Date(c.created_at).toLocaleString() : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 text-yellow-400">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span key={idx} className={idx < (c.star || 0) ? '' : 'opacity-30'}>
                          ★
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-zinc-600">{c.star || 0}</div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-zinc-700 dark:text-zinc-300">{c.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
