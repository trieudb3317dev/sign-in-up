import { NextResponse } from 'next/server';

const VECTOR_API_BASE = process.env.NEXT_PUBLIC_VECTOR_API_URL || 'http://localhost:8000';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      source_url,
      index_path = 'out.index',
      meta_path = 'meta.json',
      model = 'sentence-transformers/all-MiniLM-L6-v2',
      chunk_size = 1024,
      chunk_overlap = 80,
    } = body;

    if (!source_url) {
      return NextResponse.json({ error: 'source_url is required' }, { status: 400 });
    }

    // Call vector API train endpoint
    const res = await fetch(`${VECTOR_API_BASE}/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_url,
        index_path,
        meta_path,
        model,
        chunk_size,
        chunk_overlap,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ error: 'Train API error', details: txt }, { status: res.status || 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('train route error', err);
    return NextResponse.json({ error: err?.message ?? 'unknown' }, { status: 500 });
  }
}

