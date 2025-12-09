'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { IoShareOutline, IoPrintOutline } from 'react-icons/io5';
import Link from 'next/link';
import usePublic from '@/hooks/useApiPublic';
import { useRecipes } from '@/hooks/useRecipes';

type IRecipeDetail = {
  id: number;
  recipe_video: string;
  time_preparation: string;
  time_cooking: string;
  recipe_type: string;
  ingredients: { main: string; sauce: string }[];
  steps: { step: string; image?: string }[];
  nutrition_info: string[];
  notes: string;
  nutrition_facts: boolean;
};

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

export default function RecipeDetail({ recipe }: { recipe: Recipe }) {
  const apiPublic = usePublic();
  const { recipes } = useRecipes();
  const [otherRecipes, setOtherRecipes] = React.useState<Recipe[]>([]);
  const [r, setR] = React.useState<IRecipeDetail>({
    id: 0,
    recipe_video: '',
    time_preparation: '',
    time_cooking: '',
    recipe_type: '',
    ingredients: [],
    steps: [],
    nutrition_info: [],
    notes: '',
    nutrition_facts: false,
  });
  const i = recipe;

  // new: video ref + play state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // new: detect youtube and control iframe display
  const [showIframe, setShowIframe] = useState(false);
  const isYouTube = React.useMemo(() => {
    const url = (r.recipe_video || '').toString();
    return /youtube\.com|youtu\.be/.test(url);
  }, [r.recipe_video]);

  function toYouTubeEmbed(url: string) {
    try {
      if (!url) return '';
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.slice(1);
        return `https://www.youtube.com/embed/${id}`;
      }
      if (u.hostname.includes('youtube.com')) {
        const params = new URLSearchParams(u.search);
        const v = params.get('v');
        if (v) return `https://www.youtube.com/embed/${v}`;
        // sometimes URL already is /embed/...
        if (u.pathname.includes('/embed/')) return url;
      }
      return url;
    } catch {
      return url;
    }
  }

  // attach play/pause listeners to keep isPlaying in sync (only for <video>)
  useEffect(() => {
    if (isYouTube) {
      // do not attach listeners for iframe mode
      setIsPlaying(false);
      return;
    }
    const v = videoRef.current;
    if (!v) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('ended', onEnded);

    // set initial state
    setIsPlaying(!v.paused && !v.ended);

    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEnded);
    };
    // re-run if the video source or recipe changes
  }, [r.recipe_video, i.id, isYouTube]);

  React.useEffect(() => {
    const otherRecipes = recipes.filter((rec: Recipe) => rec.id !== i.id);
    setOtherRecipes(otherRecipes);
  }, [recipes, i.id]);

  React.useEffect(() => {
    // fetch recipe detail from API
    async function fetchDetail() {
      try {
        // simulate fetch
        const res = await apiPublic.get(`/recipes/${i.id}/details`);
        const data = res.data as IRecipeDetail;
        setR(data);
      } catch (e) {
        console.error('fetch recipe detail error', e);
      }
    }

    fetchDetail();
  }, [i.id]);

  return (
    <article className="w-full max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-6">{i.title}</h1>

      {/* meta row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-200 overflow-hidden">
              <Image src="/images/avatar.png" alt={i.admin.username ?? 'Author'} width={40} height={40} />
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {i.admin.username ?? 'John Smith'}
              </div>
              <div className="text-xs">{'15 March 2022'}</div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
              <span className="text-xs">{r.time_preparation ?? 'Prep 10m'}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
              <span className="text-xs">{r.time_cooking ?? 'Cook 15m'}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 6h18v12H3z" />
              </svg>
              <span className="text-xs">{i.category.name ?? 'Fried Rice'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-3">
            <IoPrintOutline />
          </button>
          <button className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-3">
            <IoShareOutline />
          </button>
        </div>
      </div>

      {/* main area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* large hero image with play button */}
          <div className="relative rounded-2xl overflow-hidden mb-6 shadow-md">
            {isYouTube ? (
              // YouTube embed mode: render poster + overlay until user clicks Play
              <>
                {!showIframe ? (
                  <div
                    className="w-full h-[420px] bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center cursor-pointer"
                    onClick={() => setShowIframe(true)}
                  >
                    {/* optional poster or play placeholder */}
                    <div className="text-center">
                      <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">Watch on YouTube</div>
                      <div className="h-16 w-16 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center text-2xl shadow-lg">
                        ▶
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-[420px] bg-black">
                    <iframe
                      src={`${toYouTubeEmbed(r.recipe_video ?? '')}?autoplay=1&rel=0`}
                      title={i.title}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media; fullscreen"
                      frameBorder="0"
                    />
                  </div>
                )}
              </>
            ) : (
              // native video mode
              <div
                className="w-full h-[420px] relative bg-zinc-100 dark:bg-zinc-900 cursor-pointer"
                onClick={async () => {
                  const v = videoRef.current;
                  if (!v) return;
                  try {
                    if (v.paused) await v.play();
                    else v.pause();
                  } catch (err) {
                    // ignore play errors (autoplay blocked, unsupported source)
                    console.warn('video play/pause error', err);
                  }
                }}
              >
                <video
                  ref={videoRef}
                  src={r?.recipe_video ?? '#'}
                  controls
                  className="w-full h-full object-cover bg-black"
                />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <button
                    type="button"
                    aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    onClick={async (e) => {
                      e.stopPropagation();
                      const v = videoRef.current;
                      if (!v) return;
                      try {
                        if (v.paused) await v.play();
                        else v.pause();
                      } catch (err) {
                        console.warn('video play/pause error', err);
                      }
                    }}
                    className="pointer-events-auto h-16 w-16 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center text-2xl shadow-lg"
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* description */}
          <p className="text-zinc-700 dark:text-zinc-300 mb-8 leading-relaxed">
            {r.notes ??
              'A quick and tasty fried rice recipe perfect for weeknights. Combine cooled rice with scrambled eggs and stir-fried vegetables, seasoning to taste.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Ingredients */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Ingredients</h4>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">For main dish</div>
              <ul className="space-y-3 mb-4">
                {r.ingredients[0]?.main.split(',').map((it, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <input type="checkbox" className="mt-1" />
                    <span className="text-sm text-zinc-800 dark:text-zinc-100">{it}</span>
                  </li>
                ))}
              </ul>

              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">For the sauce</div>
              <ul className="space-y-3">
                {r.ingredients[0]?.sauce.split(',').map((it, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <input type="checkbox" className="mt-1" />
                    <span className="text-sm text-zinc-800 dark:text-zinc-100">{it}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Other recipes */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Other Recipes</h4>
              <div className="space-y-3">
                {otherRecipes.map((o) => (
                  <Link
                    key={o.id}
                    href={`/recipes/${o.id}`}
                    className="flex items-center gap-3 bg-white dark:bg-[#071018] p-3 rounded-lg shadow-sm hover:shadow-md"
                  >
                    <div className="w-16 h-12 relative rounded overflow-hidden flex-shrink-0 ">
                      {o.image_url ? (
                        <Image src={o.image_url} alt={o.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-zinc-200 dark:bg-zinc-700" />
                      )}
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{o.title}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">By Foodieland</div>
                    </div>
                  </Link>
                ))}
              </div>     

              <div className="mt-6 hidden md:block">
                <div className="rounded-lg overflow-hidden">
                  <Image
                    src="/images/recipes/8.jpg"
                    alt="promo"
                    width={300}
                    height={180}
                    className="object-cover w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Directions with numbered steps and images */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Directions</h4>
            <ol className="space-y-8">
              {r.steps.map((d, index) => (
                <li key={index} className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-medium text-zinc-900 dark:text-zinc-100">
                        {index + 1}
                      </div>
                    </div>
                    <div className="prose prose-sm dark:prose-invert text-zinc-700 dark:text-zinc-300">
                      <p>{d.step}</p>
                    </div>
                  </div>

                  {d.image && (
                    <div className="rounded overflow-hidden">
                      <Image
                        src={d.image}
                        alt={`step ${index + 1}`}
                        width={1200}
                        height={600}
                        className="object-cover w-full rounded-lg"
                      />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Sidebar (sticky) */}
        <aside className="lg:col-span-1">
          <div className="sticky top-28 space-y-6">
            <div className="bg-[#eaf9fb] dark:bg-[#072026] rounded-2xl p-6 shadow-sm">
              <h4 className="font-semibold mb-4">Nutrition Information</h4>
              <ul className="text-sm text-zinc-700 dark:text-zinc-300 space-y-2">
                {r.nutrition_info.length > 0 ? (
                  r.nutrition_info.map((n, idx) => <li key={idx}>{n}</li>)
                ) : (
                  <li>Calories: 219.9 kcal</li>
                )}
              </ul>

              <p className="text-xs text-zinc-500 mt-4">Easy to make at home — perfect for a quick family dinner.</p>
            </div>

            {/* small promo card */}
            <div className="hidden md:block">
              <div className="rounded-2xl overflow-hidden">
                <Image src="/images/promo.jpg" alt="promo" width={380} height={220} className="object-cover w-full" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
