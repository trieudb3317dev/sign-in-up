'use client';

import React from 'react';
import BlogCard from './BlogCard';
import Link from 'next/link';

export default function BlogSection({
  posts,
}: {
  posts?: { id: number; image: string; caption?: string; likes?: number; date?: string }[];
}) {
  const defaultPosts = [
    {
      id: 1,
      image: '/images/blog/1.jpg',
      caption: 'Fresh salad with seasonal greens',
      likes: 44486,
      date: 'September 10',
    },
    {
      id: 2,
      image: '/images/blog/2.jpg',
      caption: 'Stack of pancakes with berries',
      likes: 44486,
      date: 'September 10',
    },
    {
      id: 3,
      image: '/images/blog/3.jpg',
      caption: 'Chopped onions and herbs prep',
      likes: 44486,
      date: 'September 10',
    },
    { id: 4, image: '/images/blog/4.jpg', caption: 'Grilled steak with potatoes', likes: 44486, date: 'September 10' },
  ];

  const list = posts && posts.length ? posts : defaultPosts;

  return (
    <section className="w-full py-12">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">Check out @foodieland on Instagram</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliquot enim ad minim
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {list.map((p) => (
            <BlogCard key={p.id} image={p.image} caption={p.caption} likes={p.likes} date={p.date} />
          ))}
        </div>

        <div className="flex justify-center">
          <Link
            href="#"
            className="inline-flex items-center gap-3 bg-black text-white px-6 py-3 rounded-full shadow hover:opacity-95"
          >
            Visit Our Instagram
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a5 5 0 00-5 5v10a5 5 0 005 5h0a5 5 0 005-5V7a5 5 0 00-5-5zM12 7a5 5 0 110 10 5 5 0 010-10z" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
