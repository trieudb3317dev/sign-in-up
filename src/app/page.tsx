'use client';

import Carousel from '@/components/Carousel';
import Categories from '@/components/Categories';
import RecipesGrid from '@/components/RecipesGrid';
import RecipesSection from '@/components/RecipesSection';
import Hero from '@/components/Hero';
import BlogSection from '@/components/BlogSection';
import Contact from '@/components/Contact';
import { useAuth } from '@/hooks/useAuth';
import { LoadingProvider } from '@/context/LoadingProvider';
import Chatbot from '@/components/Chatbot';

export default function Home() {
  const { auth } = useAuth();
  console.log('Current User:', auth);
  return (
    <LoadingProvider>
      <div className="flex min-h-screen flex-col items-center justify-start gap-12 py-10 bg-zinc-50 font-sans dark:bg-black">
        <Carousel />
        <Categories />
        <RecipesGrid />
        <Hero />
        <BlogSection />
        <RecipesSection />
        <Contact />
        <Chatbot />
      </div>
    </LoadingProvider>
  );
}
