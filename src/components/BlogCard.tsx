"use client";

import React from "react";
import Image from "next/image";
import { AiOutlineHeart, AiOutlineComment, AiOutlineFacebook, AiOutlineInstagram } from "react-icons/ai";

export default function BlogCard({
  image = "/images/blog/1.jpg",
  caption = "Sample caption for this post",
  likes = 44486,
  date = "September 10",
}: {
  image?: string;
  caption?: string;
  likes?: number;
  date?: string;
}) {
  // normalize image path (ensure starts with "/")
  const src = image.startsWith("/") ? image : `/${image.replace(/^(\.\/|(\.\.\/)+|public\/)/, "")}`;

  return (
    <article className="bg-white dark:bg-[#071018] rounded-xl shadow-sm overflow-hidden">
      <div className="relative w-full h-72">
        <Image src={src} alt={caption} fill className="object-cover" />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-sm">F</div>
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Foodieland.</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Tokyo, Japan</div>
            </div>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">{/* optional menu */}...</div>
        </div>

        <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3 line-clamp-3">
          {caption}
        </p>

        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <AiOutlineHeart size={16} />
              <span>{likes.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <AiOutlineComment size={16} />
              <span>0</span>
            </div>
          </div>

          <div className="text-[11px]">{date}</div>
        </div>
      </div>
    </article>
  );
}
