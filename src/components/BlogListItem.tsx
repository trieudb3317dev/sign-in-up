import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function BlogListItem({
  post,
}: {
  post: {
    id: number | string;
    image: string;
    title: string;
    excerpt: string;
    author: string;
    date: string;
  };
}) {
  return (
    <article className="flex items-start gap-6 py-6 border-b border-black/5 dark:border-white/6">
      <Link href={`/blog/${post.id}`} className="flex-shrink-0 w-36 h-24 md:w-48 md:h-32 rounded-lg overflow-hidden">
        <Image src={post.image} alt={post.title} width={192} height={128} className="object-cover w-full h-full" />
      </Link>

      <div className="flex-1">
        <Link
          href={`/blog/${post.id}`}
          className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
        >
          {post.title}
        </Link>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>

        <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-zinc-200 overflow-hidden" />
            <span className="text-sm text-zinc-700 dark:text-zinc-200">{post.author}</span>
          </div>
          <span>{post.date}</span>
        </div>
      </div>
    </article>
  );
}
