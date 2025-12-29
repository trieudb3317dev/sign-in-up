'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { IoShareOutline, IoPrintOutline, IoTelescope } from 'react-icons/io5';
import Link from 'next/link';
import usePublic from '@/hooks/useApiPublic';
import { useRecipes } from '@/hooks/useRecipes';
import notify from '@/utils/notify';
import { openGmailCompose, buildRecipeEmailBody, openTelegramShare, openZaloShare } from '@/utils/sharing';
import { useAuth } from '@/hooks/useAuth';
import RecipeComments from './RecipeComments';

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
  const { auth } = useAuth();
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

  // new: print preview modal state + ref for printable area
  const [showPrintModal, setShowPrintModal] = React.useState(false);
  const printableRef = React.useRef<HTMLDivElement | null>(null);

  const openPrintPreview = () => {
    setShowPrintModal(true);
  };

  const closePrintPreview = () => {
    setShowPrintModal(false);
  };

  // inject print-only CSS to show only .printable content
  const doPrint = () => {
    if (typeof window === 'undefined') return;
    const contentHtml = printableRef.current ? printableRef.current.innerHTML : '';

    // Build a minimal printable document with inline styles for reliable printing
    const styles = `
      html,body{margin:0;padding:20px;font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial;}
      h1{font-size:20px;margin-bottom:8px;}
      h2{font-size:16px;margin-top:12px;margin-bottom:6px;}
      p, li{color:#111;line-height:1.4;}
      img{max-width:100%;height:auto;}
      .ingredients, .directions{margin-bottom:12px;}
      @media print {
        @page { margin: 20mm; }
        body { -webkit-print-color-adjust: exact; color-adjust: exact; }
      }
    `;

    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) {
      // fallback to current window print if popup blocked
      window.print();
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>${i.title} - Print</title>
          <style>${styles}</style>
        </head>
        <body>
          <div class="printable">
            ${contentHtml}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();

    // Wait until images/fonts load, then print
    const tryPrint = () => {
      try {
        printWindow.focus();
        // call print; if fails due to blocked popup, it will throw
        printWindow.print();
      } catch (e) {
        // fallback: open native print
        window.print();
      }
    };

    // Use load event where possible
    printWindow.onload = () => {
      // small timeout to ensure rendering complete
      setTimeout(tryPrint, 250);
    };
    // Also schedule a fallback print after 1s in case onload doesn't fire
    setTimeout(tryPrint, 1000);
  };

  // Share recipe (uses Web Share API when available; falls back to Gmail compose / clipboard / mailto)
  const shareRecipe = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const summary = (r.notes && String(r.notes).trim()) || 'Check out this recipe.';
    const subject = `Recipe: ${i.title}`;

    const body = buildRecipeEmailBody({
      title: i.title,
      summary,
      url,
      mainIngredients,
      senderName: auth?.email,
    });

    try {
      // Prefer native Web Share when available (mobile)
      if (typeof navigator !== 'undefined' && (navigator as any).share) {
        await (navigator as any).share({ title: i.title, text: summary, url });
        return;
      }

      // Try opening Gmail compose in new tab/window with prefilled subject/body and optional recipient
      // const opened = openGmailCompose(undefined, subject, body);
      // if (opened) return;

      // Fallback: copy URL to clipboard and notify user
      if (typeof navigator !== 'undefined' && (navigator as any).clipboard && url) {
        await (navigator as any).clipboard.writeText(url);
        notify('success', 'Link copied to clipboard. You can paste it into your email.');
        return;
      }
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } catch (err: any) {
      try {
        if (url && typeof navigator !== 'undefined' && (navigator as any).clipboard) {
          await (navigator as any).clipboard.writeText(url);
          notify('success', 'Link copied to clipboard');
        } else {
          notify('error', 'Unable to share. Please copy the link manually.');
        }
      } catch {
        notify('error', 'Unable to share. Please copy the link manually.');
      }
    }
  };

  // Share recipe to Zalo (Vietnam popular messenger)
  const shareToZalo = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `${i.title}\n\n${(r.notes && String(r.notes).trim()) || ''}`.trim();
    try {
      const opened = openZaloShare(url, text);
      if (!opened) {
        if (typeof navigator !== 'undefined' && (navigator as any).clipboard && url) {
          await (navigator as any).clipboard.writeText(url);
          notify('success', 'Zalo share opened blocked — link copied to clipboard');
        } else {
          notify('error', 'Unable to open Zalo share. Please copy the link manually.');
        }
      }
    } catch (err) {
      notify('error', 'Unable to share via Zalo.');
    }
  };

  // Share recipe to Telegram
  const shareToTelegram = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `${i.title} - ${(r.notes && String(r.notes).trim()) || ''}`.trim();
    try {
      const opened = openTelegramShare(url, text);
      if (!opened) {
        if (typeof navigator !== 'undefined' && (navigator as any).clipboard && url) {
          await (navigator as any).clipboard.writeText(url);
          notify('success', 'Telegram share opened blocked — link copied to clipboard');
        } else {
          notify('error', 'Unable to open Telegram share. Please copy the link manually.');
        }
      }
    } catch (err) {
      notify('error', 'Unable to share via Telegram.');
    }
  };

  // convenience: print then close modal (download flow)
  const handlePrintAndClose = () => {
    doPrint();
    // close preview modal (user still receives print dialog)
    setShowPrintModal(false);
  };

  // safe derived ingredient lists
  const mainIngredients = React.useMemo(() => {
    const raw = r?.ingredients?.[0]?.main ?? '';
    return typeof raw === 'string'
      ? raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  }, [r.ingredients]);

  const sauceIngredients = React.useMemo(() => {
    const raw = r?.ingredients?.[0]?.sauce ?? '';
    return typeof raw === 'string'
      ? raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  }, [r.ingredients]);

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
          <button
            onClick={openPrintPreview}
            className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-3"
            aria-label="Preview print"
          >
            <IoPrintOutline />
          </button>
          <button
            className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-3"
            onClick={shareRecipe}
            aria-label="Share recipe"
          >
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
            ) : // native video mode
            r?.recipe_video ? (
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
                <video ref={videoRef} src={r.recipe_video} controls className="w-full h-full object-cover bg-black" />

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
            ) : (
              // placeholder when no video source
              <div className="w-full h-[420px] bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                <div className="text-zinc-500">No video available</div>
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
                {mainIngredients.map((it, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <input type="checkbox" className="mt-1" />
                    <span className="text-sm text-zinc-800 dark:text-zinc-100">{it}</span>
                  </li>
                ))}
              </ul>

              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">For the sauce</div>
              <ul className="space-y-3">
                {sauceIngredients.map((it, idx) => (
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
                    src={i.image_url || '/images/promo.jpg'}
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

          {/* Comments: add/edit comments & rating */}
          <RecipeComments recipeId={i.id} />
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
                <Image
                  src={i.image_url || '/images/promo.jpg'}
                  alt="promo"
                  width={380}
                  height={220}
                  className="object-cover w-full"
                />
              </div>
              {/** Logic & components for comments */}
              <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center">
                <IoTelescope className="mx-auto mb-2 text-2xl text-zinc-600 dark:text-zinc-400" />
                <div className="text-sm text-zinc-700 dark:text-zinc-300">
                  Explore more recipes in our{' '}
                  <Link href="/recipes" className="text-sky-600">
                    Recipe Collection
                  </Link>
                  !
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Print Preview Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closePrintPreview} />
          <div className="relative max-w-4xl w-full bg-white dark:bg-[#071018] rounded-lg shadow-lg overflow-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="text-lg font-semibold">Print preview</div>
              <div className="flex items-center gap-2">
                <button onClick={handlePrintAndClose} className="px-3 py-1 bg-sky-600 text-white rounded">
                  Print / Save as PDF
                </button>
                <button onClick={doPrint} className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded">
                  Print (keep preview)
                </button>
                <button onClick={closePrintPreview} className="px-3 py-1 bg-transparent rounded">
                  Close
                </button>
              </div>
            </div>

            {/* printable content */}
            <div ref={printableRef} className="p-6 printable">
              {/* Reuse key parts of detail: title, hero image, ingredients, directions */}
              <h1 className="text-2xl font-bold mb-2">{i.title}</h1>
              <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                {i.admin.username} — {i.category.name}
              </div>

              {r.recipe_video && (
                <div className="mb-4">
                  {/* if video is YouTube, show embed link poster; for printing we show a poster image or URL */}
                  {isYouTube ? (
                    <div className="bg-black text-white p-6 rounded">YouTube video: {r.recipe_video}</div>
                  ) : (
                    <div className="w-full h-48 bg-black/80 rounded overflow-hidden flex items-center justify-center text-white">
                      Video preview
                    </div>
                  )}
                </div>
              )}

              <section className="mb-4">
                <h2 className="font-semibold mb-2">Ingredients</h2>
                <ul className="list-disc pl-6 text-sm">
                  {mainIngredients.map((it, idx) => (
                    <li key={idx}>{it}</li>
                  ))}
                </ul>
                <div className="mt-3">
                  <h3 className="font-medium">Sauce</h3>
                  <ul className="list-disc pl-6 text-sm">
                    {sauceIngredients.map((it, idx) => (
                      <li key={idx}>{it}</li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="mb-4">
                <h2 className="font-semibold mb-2">Directions</h2>
                <ol className="list-decimal pl-6 text-sm">
                  {r.steps.map((d, idx) => (
                    <li key={idx} className="mb-2">
                      {d.step}
                    </li>
                  ))}
                </ol>
              </section>

              <section className="mb-4">
                <h2 className="font-semibold mb-2">Notes</h2>
                <p className="text-sm">{r.notes}</p>
              </section>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
