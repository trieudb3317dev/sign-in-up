'use client';
import React, { useEffect, useState } from 'react';
import { useSecure } from '@/hooks/useApiSecure';
import RecipeService from '@/services/recipeService';
import usePublic from '@/hooks/useApiPublic';
import notify from '@/utils/notify';
import CategoryService from '@/services/categoryService';
import { API_URL_WITH_PREFIX, API_URL_DEVELOPMENT_WITH_PREFIX } from '@/config/contant.config';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  initial?: any;
};

export default function CreateRecipeModal({ open, onClose, onCreate, onUpdate, initial }: Props) {
  const api = useSecure();
  const apiPublic = usePublic();
  const [step, setStep] = useState(1);
  const recipeService = RecipeService;

  // basic/state declarations
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');

  const [recipeVideo, setRecipeVideo] = useState('');
  const [timePreparation, setTimePreparation] = useState('');
  const [timeCooking, setTimeCooking] = useState('');
  const [recipeType, setRecipeType] = useState('');
  const [ingredients, setIngredients] = useState<any[]>([{ main: '', sauce: '' }]);
  const [instructions, setInstructions] = useState<any[]>([{ step: '', image: '' }]);
  const [nutritionInfo, setNutritionInfo] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');
  const [nutritionFacts, setNutritionFacts] = useState<boolean>(false);

  const [detail, setDetail] = React.useState<any>(null);
  const [uploading, setUploading] = useState(false);

  // new: categories list for select
  const [categoriesList, setCategoriesList] = useState<{ id: number; name: string }[]>([]);
  const [catsLoading, setCatsLoading] = useState(false);

  // --- fixed effect: fetch detail when editing; reset state when creating ---
  useEffect(() => {
    let mounted = true;

    async function fetchDetail() {
      if (!initial?.id) return;
      try {
        const res: any = await recipeService.getRecipeDetails(apiPublic, initial.id);
        if (!mounted) return;
        const fetched = res?.data ?? res;
        setDetail(fetched);

        // set basic fields from initial + fetched detail (use fetched when available)
        setTitle(initial.title ?? initial.name ?? '');
        setImageUrl(initial.image_url ?? '');
        setDescription(initial.description ?? '');
        setCategoryId(initial.category_id ?? initial.category?.id ?? '');

        if (fetched) {
          setRecipeVideo(fetched.recipe_video ?? fetched.recipeVideo ?? '');
          setTimePreparation(fetched.time_preparation ?? fetched.timePreparation ?? '');
          setTimeCooking(fetched.time_cooking ?? fetched.timeCooking ?? '');
          setRecipeType(fetched.recipe_type ?? fetched.recipeType ?? '');
          setIngredients(fetched.ingredients ?? [{ main: '' }]);
          setInstructions(fetched.instructions ?? fetched.instructions ?? fetched.steps ?? [{ step: '', image: '' }]);
          setNutritionInfo(fetched.nutrition_info ?? fetched.nutritionInfo ?? ['']);
          setNotes(fetched.notes ?? '');
          setNutritionFacts(Boolean(fetched.nutrition_facts ?? fetched.nutritionFacts));
        }
      } catch (err) {
        console.error('fetch detail error', err);
      }
    }

    async function fetchCategories() {
      if (!mounted) return;
      setCatsLoading(true);
      try {
        // fetch all categories (large limit)
        const res: any = await CategoryService.getAllCategories(apiPublic, { page: 1, limit: 1000 });
        const items = res?.data ?? [];
        if (!mounted) return;
        // map to minimal shape
        setCategoriesList(items.map((c: any) => ({ id: c.id, name: c.name })));
      } catch (err) {
        console.error('fetch categories error', err);
      } finally {
        if (mounted) setCatsLoading(false);
      }
    }

    if (initial?.id) {
      fetchDetail();
    } else {
      // create mode -> reset states
      setStep(1);
      setTitle('');
      setImageUrl('');
      setDescription('');
      setCategoryId('');
      setRecipeVideo('');
      setTimePreparation('');
      setTimeCooking('');
      setRecipeType('');
      setIngredients([{ main: '' }]);
      setInstructions([{ step: '', image: '' }]);
      setNutritionInfo(['']);
      setNotes('');
      setNutritionFacts(false);
      setDetail(null);
    }

    // always fetch categories when modal opens
    if (open) fetchCategories();

    return () => {
      mounted = false;
    };
    // depend on initial.id, apiPublic and open
  }, [initial?.id, apiPublic, open]);

  if (!open) return null;

  async function handleFile(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_URL_WITH_PREFIX ?? API_URL_DEVELOPMENT_WITH_PREFIX}/cloudinary/upload`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('upload fail');
      const data = await res.json();
      setImageUrl(data.url || '');
    } catch (e) {
      console.error('upload', e);
      notify('error', 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function addIngredient() {
    setIngredients((s) => [...s, { main: '' }]);
  }
  function removeIngredient(i: number) {
    setIngredients((s) => s.filter((_, idx) => idx !== i));
  }
  function addInstruction() {
    setInstructions((s) => [...s, { step: '', image: '' }]);
  }
  function removeInstruction(i: number) {
    setInstructions((s) => s.filter((_, idx) => idx !== i));
  }
  function addNutrition() {
    setNutritionInfo((s) => [...s, '']);
  }
  function removeNutrition(i: number) {
    setNutritionInfo((s) => s.filter((_, idx) => idx !== i));
  }

  async function submitFinal(e?: React.FormEvent) {
    e?.preventDefault();

    // normalize ingredients: combine all 'main' into one string, pick any 'sauce' if provided
    const mainParts = ingredients.map((it) => (it?.main ?? '').trim()).filter(Boolean);
    const joinedMain = mainParts.join(', ');
    const sauceItem = ingredients.find((it) => (it?.sauce ?? '').trim());
    const normalizedIngredients = joinedMain
      ? sauceItem
        ? [{ main: joinedMain, sauce: (sauceItem?.sauce ?? '').trim() }]
        : [{ main: joinedMain }]
      : [];

    const payload = {
      title,
      image_url: imageUrl,
      description,
      category_id: Number(categoryId),
      detail: {
        recipe_video: recipeVideo,
        time_preparation: timePreparation,
        time_cooking: timeCooking,
        recipe_type: recipeType,
        // send normalized ingredients array with single object
        ingredients: normalizedIngredients,
        instructions,
        nutrition_info: nutritionInfo,
        nutrition_facts: nutritionFacts,
        notes,
      },
    };
    if (initial && onUpdate) {
      onUpdate(payload);
      notify('success', 'Recipe updated successfully');
    } else if (onCreate) {
      onCreate(payload);
      notify('success', 'Recipe created successfully');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-6">
      <form onSubmit={submitFinal} className="bg-white dark:bg-zinc-800 rounded p-6 w-full max-w-3xl shadow my-10">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{initial ? 'Edit Recipe' : 'Create Recipe'}</h3>
          <button type="button" onClick={onClose} className="text-sm px-2 py-1">
            Close
          </button>
        </div>

        {step === 1 && (
          <div className="mt-4 space-y-3">
            <label className="text-sm">
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1 px-2 py-1 border rounded"
              />
            </label>

            <label className="text-sm">
              Image
              <div className="flex items-center gap-3 mt-1">
                <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                {uploading ? (
                  <span className="text-sm">Uploading...</span>
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

            <label className="text-sm">
              Category
              {catsLoading ? (
                <select className="w-full mt-1 px-2 py-1 border rounded bg-zinc-50" disabled>
                  <option>Loading categories...</option>
                </select>
              ) : (
                <select
                  value={categoryId as any}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full mt-1 px-2 py-1 border rounded"
                >
                  <option value="">Select category</option>
                  {categoriesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </label>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-3 py-1 border rounded">
                Cancel
              </button>
              <button type="button" onClick={() => setStep(2)} className="px-3 py-1 bg-blue-600 text-white rounded">
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 space-y-3">
            <label className="text-sm">
              Video URL
              <input
                value={recipeVideo}
                onChange={(e) => setRecipeVideo(e.target.value)}
                className="w-full mt-1 px-2 py-1 border rounded"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                Time Preparation
                <input
                  value={timePreparation}
                  onChange={(e) => setTimePreparation(e.target.value)}
                  className="w-full mt-1 px-2 py-1 border rounded"
                />
              </label>
              <label className="text-sm">
                Time Cooking
                <input
                  value={timeCooking}
                  onChange={(e) => setTimeCooking(e.target.value)}
                  className="w-full mt-1 px-2 py-1 border rounded"
                />
              </label>
            </div>

            <label className="text-sm">
              Recipe Type
              <input
                value={recipeType}
                onChange={(e) => setRecipeType(e.target.value)}
                className="w-full mt-1 px-2 py-1 border rounded"
              />
            </label>

            <div>
              <h4 className="font-semibold">Ingredients</h4>
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2 items-center mt-2">
                  <input
                    value={ing.main ?? ''}
                    onChange={(e) =>
                      setIngredients((s) => s.map((it, idx) => (idx === i ? { ...it, main: e.target.value } : it)))
                    }
                    className="flex-1 px-2 py-1 border rounded"
                  />
                  <input
                    placeholder="sauce (optional)"
                    value={ing.sauce ?? ''}
                    onChange={(e) =>
                      setIngredients((s) => s.map((it, idx) => (idx === i ? { ...it, sauce: e.target.value } : it)))
                    }
                    className="flex-1 px-2 py-1 border rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    className="px-2 py-1 border rounded text-red-600"
                  >
                    Del
                  </button>
                </div>
              ))}
              <button type="button" onClick={addIngredient} className="mt-2 px-2 py-1 border rounded">
                Add ingredient
              </button>
            </div>

            <div>
              <h4 className="font-semibold">Instructions</h4>
              {instructions.map((ins, i) => (
                <div key={i} className="mt-2 space-y-1">
                  <textarea
                    value={ins.step}
                    onChange={(e) =>
                      setInstructions((s) => s.map((it, idx) => (idx === i ? { ...it, step: e.target.value } : it)))
                    }
                    className="w-full px-2 py-1 border rounded"
                    rows={2}
                  />
                  <div className="flex gap-2 items-center">
                    <input
                      placeholder="image url"
                      value={ins.image ?? ''}
                      onChange={(e) =>
                        setInstructions((s) => s.map((it, idx) => (idx === i ? { ...it, image: e.target.value } : it)))
                      }
                      className="flex-1 px-2 py-1 border rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeInstruction(i)}
                      className="px-2 py-1 border rounded text-red-600"
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addInstruction} className="mt-2 px-2 py-1 border rounded">
                Add step
              </button>
            </div>

            <div>
              <h4 className="font-semibold">Nutrition Info</h4>
              {nutritionInfo.map((n, i) => (
                <div key={i} className="flex gap-2 items-center mt-2">
                  <input
                    value={n}
                    onChange={(e) => setNutritionInfo((s) => s.map((it, idx) => (idx === i ? e.target.value : it)))}
                    className="flex-1 px-2 py-1 border rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeNutrition(i)}
                    className="px-2 py-1 border rounded text-red-600"
                  >
                    Del
                  </button>
                </div>
              ))}
              <button type="button" onClick={addNutrition} className="mt-2 px-2 py-1 border rounded">
                Add nutrition
              </button>
            </div>

            <label className="text-sm">
              Notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full mt-1 px-2 py-1 border rounded"
                rows={2}
              />
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={nutritionFacts} onChange={(e) => setNutritionFacts(e.target.checked)} />
              Has nutrition facts
            </label>

            <div className="flex justify-between gap-2">
              <button type="button" onClick={() => setStep(1)} className="px-3 py-1 border rounded">
                Back
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="px-3 py-1 border rounded">
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">
                  {initial ? 'Save' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
