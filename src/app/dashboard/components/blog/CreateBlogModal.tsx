'use client';
import React, { useEffect, useState } from 'react';
import notify from '@/utils/notify';

type ContentItem = { heading: string; body: string; image?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  initial?: any;
};

export default function CreateBlogModal({ open, onClose, onCreate, onUpdate, initial }: Props) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [content, setContent] = useState<ContentItem[]>([{ heading: '', body: '', image: '' }]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title ?? '');
      setImageUrl(initial.image_url ?? '');
      setNotes(initial.notes ?? '');
      setContent(initial.content ?? [{ heading: '', body: '', image: '' }]);
    } else {
      setStep(1);
      setTitle('');
      setImageUrl('');
      setNotes('');
      setContent([{ heading: '', body: '', image: '' }]);
    }
  }, [initial, open]);

  if (!open) return null;

  async function handleFile(file?: File, idx?: number) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/cloudinary/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('upload failed');
      const data = await res.json();
      if (typeof idx === 'number') {
        setContent((s) => s.map((c, i) => (i === idx ? { ...c, image: data.url || '' } : c)));
      } else {
        setImageUrl(data.url || '');
      }
    } catch (e) {
      console.error('upload', e);
      notify('error', 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function addContent() {
    setContent((s) => [...s, { heading: '', body: '', image: '' }]);
  }
  function removeContent(i: number) {
    setContent((s) => s.filter((_, idx) => idx !== i));
  }

  function submitFinal(e?: React.FormEvent) {
    e?.preventDefault();
    const payload = { title, image_url: imageUrl, notes, content };
    if (initial && onUpdate) {
      onUpdate(payload);
      notify('success', 'Blog updated');
    } else if (onCreate) {
      onCreate(payload);
      notify('success', 'Blog created');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-6">
      <form onSubmit={submitFinal} className="bg-white dark:bg-zinc-800 rounded p-6 w-full max-w-3xl shadow my-10">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{initial ? 'Edit Blog' : 'Create Blog'}</h3>
          <button type="button" onClick={onClose} className="text-sm px-2 py-1">Close</button>
        </div>

        {step === 1 && (
          <div className="mt-4 space-y-3">
            <label className="text-sm">Title<input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 px-2 py-1 border rounded" /></label>

            <label className="text-sm">
              Image
              <div className="flex items-center gap-3 mt-1">
                <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                {uploading ? <span className="text-sm">Uploading...</span> : imageUrl ? <img src={imageUrl} alt="preview" className="h-12 w-12 object-cover rounded" /> : null}
              </div>
              <div className="text-xs text-zinc-500 mt-1">Or enter image URL</div>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full mt-1 px-2 py-1 border rounded text-sm" />
            </label>

            <label className="text-sm">Notes<textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full mt-1 px-2 py-1 border rounded" rows={3} /></label>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
              <button type="button" onClick={() => setStep(2)} className="px-3 py-1 bg-blue-600 text-white rounded">Next</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 space-y-3">
            <h4 className="font-semibold">Content Sections</h4>
            {content.map((c, idx) => (
              <div key={idx} className="border p-3 rounded mb-2">
                <label className="text-sm">Heading<input value={c.heading} onChange={(e) => setContent((s) => s.map((it, i) => i === idx ? { ...it, heading: e.target.value } : it))} className="w-full mt-1 px-2 py-1 border rounded" /></label>
                <label className="text-sm">Body<textarea value={c.body} onChange={(e) => setContent((s) => s.map((it, i) => i === idx ? { ...it, body: e.target.value } : it))} className="w-full mt-1 px-2 py-1 border rounded" rows={3} /></label>

                <div className="flex items-center gap-3 mt-2">
                  <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0], idx)} />
                  {c.image ? <img src={c.image} alt="sec" className="h-12 w-12 object-cover rounded" /> : null}
                  <button type="button" onClick={() => removeContent(idx)} className="px-2 py-1 border rounded text-red-600">Remove</button>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <button type="button" onClick={addContent} className="px-3 py-1 border rounded">Add section</button>
            </div>

            <div className="flex justify-between gap-2 mt-4">
              <button type="button" onClick={() => setStep(1)} className="px-3 py-1 border rounded">Back</button>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">{initial ? 'Save' : 'Create'}</button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
