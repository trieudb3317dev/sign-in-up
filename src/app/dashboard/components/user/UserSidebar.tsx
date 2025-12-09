'use client';
import React from 'react';

type UserSectionKey = 'profile' | 'settings' | 'whitelist';

type Props = {
	selected: UserSectionKey;
	onSelect: (s: UserSectionKey) => void;
};

export default function UserSidebar({ selected, onSelect }: Props) {
	return (
		<nav className="bg-white dark:bg-zinc-800 rounded-md p-3 shadow-sm">
			<ul className="flex flex-col gap-1">
				<li>
					<button
						onClick={() => onSelect('profile')}
						className={`w-full text-left px-3 py-2 rounded ${selected === 'profile' ? 'bg-zinc-100 dark:bg-zinc-700 font-semibold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-700'}`}
					>
						Profile
					</button>
				</li>
				<li>
					<button
						onClick={() => onSelect('settings')}
						className={`w-full text-left px-3 py-2 rounded ${selected === 'settings' ? 'bg-zinc-100 dark:bg-zinc-700 font-semibold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-700'}`}
					>
						Settings
					</button>
				</li>
				<li>
					<button
						onClick={() => onSelect('whitelist')}
						className={`w-full text-left px-3 py-2 rounded ${selected === 'whitelist' ? 'bg-zinc-100 dark:bg-zinc-700 font-semibold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-700'}`}
					>
						Whistlist
					</button>
				</li>
			</ul>
		</nav>
	);
}
