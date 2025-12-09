import { NextResponse } from 'next/server';

const VECTOR_API = `${process.env.NEXT_PUBLIC_VECTOR_API_URL || 'http://localhost:8000'}/search`;
const GROQ_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

async function queryVector(q: string, k = 3) {
  try {
    const res = await fetch(VECTOR_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, k }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.results ?? [];
  } catch (e) {
    console.warn('vector query failed', e);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage: string = (body?.message ?? '').toString();
    const systemPrompt: string | undefined = body?.system;

    if (!userMessage) return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    if (!GROQ_KEY) return NextResponse.json({ error: 'Server not configured with GROQ_API_KEY' }, { status: 500 });

    // 1) Retrieval
    const docs = await queryVector(userMessage, 4);
    let contextText = '';
    if (docs && docs.length) {
      contextText = docs.map((d: any, i: number) => `Document ${i + 1} (score=${(d.score || 0).toFixed(3)}):\nTitle: ${d.title}\n${d.text}\n---`).join("\n\n");
    }

    // 2) Build messages
    const messages = [
      { role: 'system', content: systemPrompt ?? 'You are a helpful assistant specialized in recipes and cooking instructions. Use provided recipe documents when relevant.' },
    ] as { role: string; content: string }[];

    if (contextText) {
      messages.push({ role: 'system', content: `Reference documents (use to answer if applicable):\n${contextText}` });
    }
    messages.push({ role: 'user', content: userMessage });

    // 3) Call Groq
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Groq model - fast and free
        messages,
        max_tokens: 800,
        temperature: 0.2, // lower for precise recipe answers
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ error: 'Upstream error', details: txt }, { status: 502 });
    }
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content ?? null;
    return NextResponse.json({ reply, sources: docs ?? [] });
  } catch (err: any) {
    console.error('chat route error', err);
    return NextResponse.json({ error: err?.message ?? 'unknown' }, { status: 500 });
  }
}
