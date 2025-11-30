import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';

type Recipe = {
  id: string | number;
  title: string;
  slug: string;
  image_url: string;
  category: {
    id: number;
    name: string;
  };
  admin: {
    id: number;
    username: string;
    role: string;
  };
  detail: {
    recipe_video: string;
    time_preparation: string;
    time_cooking: string;
    recipe_type: string;
  };
  liked?: boolean;
};

export default function RecipeCard({ item, onLike }: { item: Recipe; onLike?: (id: string | number) => void }) {
  const [liked, setLiked] = React.useState<boolean>(!!item.liked);

  const toggleLike = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    setLiked((s) => !s);
    if (onLike) onLike(item.id);
  };

  return (
    <article className="group bg-white dark:bg-[#071018] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
      {/* clickable area: image + title -> link to recipe detail */}
      <Link href={`/recipes/${item.id}`} className="block">
        <div className="relative w-full h-44 md:h-48 lg:h-56">
          <Image src={item.image_url} alt={item.title} fill className="object-cover" />
          {/* like button stays clickable without navigating */}
          <button
            type="button"
            aria-label="like"
            onClick={toggleLike}
            className="absolute top-3 right-3 z-10 rounded-full bg-white/80 dark:bg-black/60 p-2 shadow backdrop-blur-sm"
          >
            {liked ? (
              <AiFillHeart className="text-red-500" size={18} />
            ) : (
              <AiOutlineHeart className="text-zinc-700" size={18} />
            )}
          </button>
        </div>

        <div className="p-4">
          <h3 className="text-sm md:text-base font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
            {item.title}
          </h3>

          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
                <span>{item?.detail?.time_cooking ?? '30 Minutes'}</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 6h18v12H3z" />
                </svg>
                <span>{item?.detail?.recipe_type ?? 'Snack'}</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
