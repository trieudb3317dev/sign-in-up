'use client';
import React, { createContext, useContext, useMemo, useState } from 'react';

type LoadingContextType = {
	show: () => void;
	hide: () => void;
	run: <T>(fn: Promise<T> | (() => Promise<T>)) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
	const [manualCount, setManualCount] = useState(0);
	const active = manualCount > 0;

	const show = () => setManualCount((c) => c + 1);
	const hide = () => setManualCount((c) => Math.max(0, c - 1));
	const run = async <T,>(fn: Promise<T> | (() => Promise<T>)) => {
		show();
		try {
			return typeof fn === 'function' ? await fn() : await fn;
		} finally {
			hide();
		}
	};

	const value = useMemo(() => ({ show, hide, run }), []);

	return (
		<>
			<LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>

			{active && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="flex items-center gap-3 bg-white dark:bg-zinc-900 px-4 py-3 rounded shadow">
						<svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4"></circle>
							<path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
						</svg>
						<span className="text-sm">Loading...</span>
					</div>
				</div>
			)}
		</>
	);
}

export function useLoading() {
	const ctx = useContext(LoadingContext);
	if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
	return ctx;
}
