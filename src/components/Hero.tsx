"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Hero({
  title = "Everyone can be a\nchef in their own kitchen",
  subtitle = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliquot enim ad minim",
  image = "/images/portrait-happy-male-chef-dressed-uniform-1.png",
}: {
  title?: string;
  subtitle?: string;
  image?: string;
}) {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
          {/* left text */}
          <div className="py-12 md:py-20">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-zinc-900 dark:text-zinc-50">
              {title.split("\n").map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-xl text-zinc-600 dark:text-zinc-300">
              {subtitle}
            </p>

            <div className="mt-8">
              <Link href="#" className="inline-block rounded-full bg-black text-white px-6 py-3 text-sm shadow hover:opacity-95">
                Learn More
              </Link>
            </div>
          </div>

          {/* right visual */}
          <div className="relative flex items-center justify-center py-12 md:py-20">
            <div className="w-full max-w-md md:max-w-lg lg:max-w-xl aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-b from-white/60 to-white/40 dark:from-black/40 dark:to-black/30 relative">
              {/* main image - use fill */}
              <Image
                src={image}
                alt="Hero"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />

              {/* floating ingredients */}
              <Image src="/images/ingredient-meat.png" alt="meat" width={64} height={64}
                className="absolute -left-6 -top-6 z-10 animate-float" />
              <Image src="/images/ingredient-onion.png" alt="onion" width={48} height={48}
                className="absolute right-8 -top-6 z-10 animate-float-small" />
              <Image src="/images/ingredient-tomato.png" alt="tomato" width={44} height={44}
                className="absolute left-8 bottom-6 z-10 animate-float-small" />
              <Image src="/images/ingredient-leaf.png" alt="leaf" width={56} height={56}
                className="absolute -right-8 bottom-8 z-10 animate-float" />
            </div>
          </div>
        </div>
      </div>
      {/* small animations - add simple keyframes via Tailwind utilities (if configured) or global css */}
      <style jsx>{`
        .animate-float {
          transform-origin: center;
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-small {
          transform-origin: center;
          animation: float 3.2s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </section>
  );
}
