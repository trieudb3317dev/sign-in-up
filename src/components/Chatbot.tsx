import React, { useEffect, useRef, useState } from 'react';

type Message = { id: string; role: 'user' | 'assistant' | 'system'; text: string };

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem('chatbot_history');
      return raw ? (JSON.parse(raw) as Message[]) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem('chatbot_history', JSON.stringify(messages));
    // scroll to bottom when messages change
    setTimeout(() => {
      boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  }, [messages]);

  function addMessage(m: Message) {
    setMessages((s) => [...s, m]);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    addMessage(userMsg);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          // optional: provide system prompt limited to recipes
          system: 'You are a helpful assistant specialized in recipes and cooking instructions.',
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Chat API error');
      }
      const data = await res.json();
      const replyText = data.reply ?? data.message ?? 'No response';
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: replyText };
      addMessage(botMsg);
    } catch (err: any) {
      addMessage({ id: (Date.now() + 2).toString(), role: 'assistant', text: `Error: ${err?.message ?? 'Request failed'}` });
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="fixed right-6 bottom-6 z-50">
      {open ? (
        <div className="w-[440px] h-[580px] bg-white dark:bg-zinc-900 border rounded-lg shadow-lg flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold">R</div>
              <div className="text-sm font-semibold">Recipe Assistant</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setMessages([]);
                  localStorage.removeItem('chatbot_history');
                }}
                className="text-xs text-zinc-500 hover:text-zinc-700"
                title="Clear"
              >
                Clear
              </button>
              <button onClick={() => setOpen(false)} className="text-sm px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
                ✕
              </button>
            </div>
          </div>

          <div ref={boxRef} className="flex-1 overflow-auto p-3 space-y-3">
            {messages.length === 0 && <div className="text-xs text-zinc-500">Ask me about recipes, ingredients, substitutions, or cooking steps.</div>}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'}`}>
                  <div className="whitespace-pre-wrap text-sm">{m.text}</div>
                </div>
              </div>
            ))}
            {loading && <div className="text-sm text-zinc-500">Assistant is typing...</div>}
          </div>

          <div className="p-3 border-t dark:border-zinc-800">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about recipes (e.g. 'How to cook risotto?')"
                className="flex-1 px-3 py-2 rounded border dark:border-zinc-800 bg-transparent text-sm"
              />
              <button onClick={handleSend} disabled={loading} className="px-3 py-2 bg-emerald-600 text-white rounded">
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="h-14 w-14 rounded-full bg-emerald-600 text-white shadow-lg flex items-center justify-center">
          💬
        </button>
      )}
    </div>
  );
}
