'use client';
import { API_URL_WITH_PREFIX, API_URL_DEVELOPMENT_WITH_PREFIX } from '@/config/contant.config';
import notify from '@/utils/notify';
import React, { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate?: (payload: { name: string; image_url?: string; description?: string }) => void;
  onUpdate?: (payload: { name: string; image_url?: string; description?: string }) => void;
  initial?: { id?: number; name?: string; image_url?: string; description?: string };
};

export default function CreateCategoryModal({ open, onClose, onCreate, onUpdate, initial }: Props) {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initial) {
      setName(initial.name ?? '');
      setImageUrl(initial.image_url ?? '');
      setDescription(initial.description ?? '');
    } else {
      setName('');
      setImageUrl('');
      setDescription('');
    }
  }, [initial, open]);

  if (!open) return null;

  async function handleFile(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      // expects server endpoint /api/upload that returns { url: string }
      const res = await fetch(`${API_URL_WITH_PREFIX ?? API_URL_DEVELOPMENT_WITH_PREFIX}/cloudinary/upload`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setImageUrl(data.url || '');
    } catch (e) {
      console.error('upload error', e);
      notify('error', 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { name: name.trim(), image_url: imageUrl, description: description?.trim() };
    if (!payload.name) return;
    if (initial && onUpdate) {
      onUpdate(payload);
      notify('success', 'Category updated successfully');
    } else if (onCreate) {
      onCreate(payload);
      notify('success', 'Category created successfully');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={submit} className="bg-white dark:bg-zinc-800 rounded p-6 w-full max-w-lg shadow">
        <h3 className="text-lg font-semibold mb-4">{initial ? 'Edit Category' : 'Create Category'}</h3>
        <div className="flex flex-col gap-3">
          <label className="text-sm">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-2 py-1 border rounded"
            />
          </label>

          <label className="text-sm">
            Image
            <div className="flex items-center gap-3 mt-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="px-2 py-1"
              />
              {uploading ? (
                <span className="text-sm text-zinc-500">Uploading...</span>
              ) : imageUrl ? (
                <img src={imageUrl} alt="preview" className="h-12 w-12 object-cover rounded" />
              ) : null}
            </div>
            <div className="text-xs text-zinc-500 mt-1">Or enter image URL</div>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full mt-1 px-2 py-1 border rounded text-sm"
            />
          </label>

          <label className="text-sm">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 px-2 py-1 border rounded"
              rows={3}
            />
          </label>

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-3 py-1 border rounded">
              Cancel
            </button>
            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">
              {initial ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
