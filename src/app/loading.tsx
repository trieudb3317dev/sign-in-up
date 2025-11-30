export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 px-4 py-3 rounded shadow">
                <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4"></circle>
                    <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
                </svg>
                <span>Loading...</span>
            </div>
        </div>
    );
}