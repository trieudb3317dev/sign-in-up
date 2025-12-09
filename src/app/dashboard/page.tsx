'use client';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import CategoriesPage from './components/category/CategoriesPage';
import { LoadingProvider } from '@/context/LoadingProvider';
import RecipesPage from './components/recipe/RecipesPage';
import BlogsPage from './components/blog/BlogsPage';
import { useAuth } from '@/hooks/useAuth';
import RecipesWhistlistPage from './components/whistlist/RecipesPage';
import ProfilePage from './components/user/ProfilePage';
import SettingsPage from './components/user/SettingsPage';
import ChatBotPage from './components/chatbot/ChatBotPage';

enum Section {
  Categories = 'categories',
  Recipes = 'recipes',
  Blogs = 'blogs',
}

enum UserSection {
  Profile = 'profile',
  Settings = 'settings',
  Whistlist = 'whitelist',
}

export default function DashboardPage() {
  const [section, setSection] = useState<Section>(Section.Categories);
  const [userSection, setUserSection] = useState<UserSection>(UserSection.Profile);
  const { auth } = useAuth();

  return (
    <LoadingProvider>
      {auth && auth.role !== undefined ? (
        <div className="flex min-h-screen flex-col items-center justify-start gap-12 py-10 bg-zinc-50 font-sans dark:bg-black">
          <div className="w-full max-w-6xl flex gap-6 px-4">
            <aside className="w-64">
              <Sidebar selected={section as any} onSelect={(s: any) => setSection(s)} />
            </aside>

            <main className="flex-1 bg-white rounded-lg p-6 shadow-sm dark:bg-zinc-900">
              {section === Section.Categories && <CategoriesPage />}
              {section === Section.Recipes && <RecipesPage />}
              {section === Section.Blogs && <BlogsPage />}
              {section === ('profile' as any) && <ProfilePage initial={auth?.role ?? undefined} />}
              {section === ('settings' as any) && <SettingsPage />}
              {section === ('chatbot' as any) && <ChatBotPage /> }
            </main>
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen flex-col items-center justify-start gap-12 py-10 bg-zinc-50 font-sans dark:bg-black">
          <div className="w-full max-w-6xl flex gap-6 px-4">
            <aside className="w-64">
              <Sidebar selected={userSection as any} onSelect={(s: any) => setUserSection(s)} />
            </aside>

            <main className="flex-1 bg-white rounded-lg p-6 shadow-sm dark:bg-zinc-900">
              {userSection === UserSection.Profile && <ProfilePage initial={auth?.role ?? undefined} />}
              {userSection === UserSection.Settings && <SettingsPage />}
              {userSection === UserSection.Whistlist && <RecipesWhistlistPage />}
            </main>
          </div>
        </div>
      )}
    </LoadingProvider>
  );
}
