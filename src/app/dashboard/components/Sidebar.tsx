'use client';
import { useAuth } from '@/hooks/useAuth';

type MenuKey = 'categories' | 'recipes' | 'blogs' | 'profile' | 'settings' | 'whitelist' | 'chatbot';

enum RoleAdmin {
  Admin = 'admin',
  SuperAdmin = 'super_admin',
  Editor = 'editor',
}

enum RoleUser {
  User = 'user',
  Guest = 'guest',
}

type Props = {
  selected: MenuKey;
  onSelect: (s: MenuKey) => void;
};

export default function Sidebar({ selected, onSelect }: Props) {
  const { auth } = useAuth();
  const role = auth?.role ?? 'guest';

  const adminMenu: { key: MenuKey; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'settings', label: 'Settings' },
    { key: 'categories', label: 'Categories' },
    { key: 'recipes', label: 'Recipes' },
    { key: 'blogs', label: 'Blogs' },
    { key: 'chatbot', label: 'Chatbot' },
  ];

  const userMenu: { key: MenuKey; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'settings', label: 'Settings' },
    { key: 'whitelist', label: 'Whistlist' },
  ];

  const guestMenu: { key: MenuKey; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'settings', label: 'Settings' },
  ];

  const menu =
    role === RoleAdmin.Admin || role === RoleAdmin.SuperAdmin || role === RoleAdmin.Editor
      ? adminMenu
      : role === RoleUser.User || role === RoleUser.Guest
      ? userMenu
      : userMenu;

  return (
    <nav className="bg-white dark:bg-zinc-800 rounded-md p-3 shadow-sm">
      <ul className="flex flex-col gap-1">
        {menu.map((m) => (
          <li key={m.key}>
            <button
              onClick={() => onSelect(m.key)}
              className={`w-full text-left px-3 py-2 rounded ${
                selected === m.key
                  ? 'bg-zinc-100 dark:bg-zinc-700 font-semibold'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-700'
              }`}
            >
              {m.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
