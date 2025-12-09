'use client';
import { useState, useEffect } from 'react';
import { API_URL_WITH_PREFIX, API_URL_DEVELOPMENT_WITH_PREFIX } from '@/config/contant.config';

type TrainRequest = {
  source_url: string;
  index_path: string;
  meta_path: string;
  model: string;
  chunk_size: number;
  chunk_overlap: number;
};

type TrainResponse = {
  status: string;
  indexed: number;
  index_path: string;
  meta_path: string;
};

type TrainHistory = TrainResponse & {
  id: string;
  source_url: string;
  model: string;
  chunk_size: number;
  chunk_overlap: number;
  created_at: string;
};

export default function ChatBotPage() {
  const [trainHistory, setTrainHistory] = useState<TrainHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<TrainRequest>({
    source_url: `${API_URL_WITH_PREFIX ?? API_URL_DEVELOPMENT_WITH_PREFIX}/recipes/full-details`,
    index_path: 'out.index',
    meta_path: 'meta.json',
    model: 'sentence-transformers/all-MiniLM-L6-v2',
    chunk_size: 1024,
    chunk_overlap: 80,
  });

  // Load train history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('trainHistory');
    if (saved) {
      try {
        setTrainHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load train history', e);
      }
    }
  }, []);

  // Save train history to localStorage whenever it changes
  useEffect(() => {
    if (trainHistory.length > 0) {
      localStorage.setItem('trainHistory', JSON.stringify(trainHistory));
    }
  }, [trainHistory]);

  async function handleTrain(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.details || 'Train failed');
      }

      const data: TrainResponse = await res.json();

      // Add to history
      const historyItem: TrainHistory = {
        ...data,
        id: Date.now().toString(),
        source_url: formData.source_url,
        model: formData.model,
        chunk_size: formData.chunk_size,
        chunk_overlap: formData.chunk_overlap,
        created_at: new Date().toISOString(),
      };

      setTrainHistory((prev) => [historyItem, ...prev]);
      setSuccess(`Successfully indexed ${data.indexed} documents!`);
      
      // Clear form after successful train
      setFormData({
        source_url: `${API_URL_WITH_PREFIX ?? API_URL_DEVELOPMENT_WITH_PREFIX}/recipes/full-details`,
        index_path: 'out.index',
        meta_path: 'meta.json',
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        chunk_size: 1024,
        chunk_overlap: 80,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to train data');
      console.error('Train error', err);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'chunk_size' || name === 'chunk_overlap' ? parseInt(value) || 0 : value,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Chatbot Training</h2>
      </div>

      {/* Train Form */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Train/Index New Data</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-green-700 dark:text-green-400">
            {success}
          </div>
        )}

        <form onSubmit={handleTrain} className="space-y-4">
          <div>
            <label htmlFor="source_url" className="block text-sm font-medium mb-1">
              Source URL *
            </label>
            <input
              type="url"
              id="source_url"
              name="source_url"
              value={formData.source_url}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              placeholder={`${API_URL_WITH_PREFIX ?? API_URL_DEVELOPMENT_WITH_PREFIX}/recipes/full-details`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="index_path" className="block text-sm font-medium mb-1">
                Index Path
              </label>
              <input
                type="text"
                id="index_path"
                name="index_path"
                value={formData.index_path}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label htmlFor="meta_path" className="block text-sm font-medium mb-1">
                Meta Path
              </label>
              <input
                type="text"
                id="meta_path"
                name="meta_path"
                value={formData.meta_path}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium mb-1">
              Model
            </label>
            <select
              id="model"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
            >
              <option value="sentence-transformers/all-MiniLM-L6-v2">all-MiniLM-L6-v2 (Default)</option>
              <option value="sentence-transformers/all-mpnet-base-v2">all-mpnet-base-v2</option>
              <option value="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2">paraphrase-multilingual-MiniLM-L12-v2</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="chunk_size" className="block text-sm font-medium mb-1">
                Chunk Size
              </label>
              <input
                type="number"
                id="chunk_size"
                name="chunk_size"
                value={formData.chunk_size}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label htmlFor="chunk_overlap" className="block text-sm font-medium mb-1">
                Chunk Overlap
              </label>
              <input
                type="number"
                id="chunk_overlap"
                name="chunk_overlap"
                value={formData.chunk_overlap}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Training...' : 'Train Data'}
          </button>
        </form>
      </div>

      {/* Train History */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Training History</h3>

        {trainHistory.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">No training history yet.</p>
        ) : (
          <div className="space-y-3">
            {trainHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        ✓ {item.status === 'ok' ? 'Success' : item.status}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                      <span className="font-medium">Source:</span> {item.source_url}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{item.indexed}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">documents</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <div>
                    <span className="font-medium">Index:</span> {item.index_path}
                  </div>
                  <div>
                    <span className="font-medium">Meta:</span> {item.meta_path}
                  </div>
                  <div>
                    <span className="font-medium">Model:</span> {item.model.split('/').pop()}
                  </div>
                  <div>
                    <span className="font-medium">Chunk:</span> {item.chunk_size} / {item.chunk_overlap}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
