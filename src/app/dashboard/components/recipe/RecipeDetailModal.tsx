'use client';
import { useSecure } from '@/hooks/useApiSecure';
import RecipeService from '@/services/recipeService';
import React from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  recipe: any | null;
};

export default function RecipeDetailModal({ open, onClose, recipe }: Props) {
  if (!open || !recipe) return null;

  // some APIs nest detail under recipe
  const recipeService = RecipeService;
  const apiSecure = useSecure();

  const [detail, setDetail] = React.useState<any>(null);

  React.useEffect(() => {
    // If needed, fetch more detailed info here using recipeService
    // For now, we assume 'recipe' prop has all needed details
    const fetchDetail = async () => {
      const detail = await recipeService.getRecipeDetails(apiSecure, recipe.id);
      setDetail(detail);
    };
    fetchDetail();
  }, [recipe, apiSecure]);

  // --- replaced nutrition rendering with a parsed table ---
  const nutritionItems: string[] = detail?.nutrition_info ?? [];

  function parseNutrition(items: string[]) {
    return items.map((s) => {
      const idx = s.indexOf(':');
      if (idx === -1) return { key: s.trim(), value: '' };
      const key = s.slice(0, idx).trim();
      const value = s.slice(idx + 1).trim();
      return { key, value };
    });
  }

  const nutritionEntries = parseNutrition(nutritionItems);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-6">
      <div className="bg-white dark:bg-zinc-800 rounded p-6 w-full max-w-3xl shadow my-10">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{recipe.title ?? recipe.name}</h3>
          <button onClick={onClose} className="text-sm px-2 py-1">
            Close
          </button>
        </div>

        {recipe.image_url && (
          <img src={recipe.image_url} alt={recipe.title} className="mt-4 w-full h-48 object-cover rounded" />
        )}

        <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{recipe.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Prep:</strong> {detail?.time_preparation ?? detail?.timePreparation ?? '-'}
          </div>
          <div>
            <strong>Cook:</strong> {detail?.time_cooking ?? detail?.timeCooking ?? '-'}
          </div>
          <div>
            <strong>Type:</strong> {detail?.recipe_type ?? detail?.type ?? '-'}
          </div>
          <div>
            <strong>Video:</strong>{' '}
            {detail?.recipe_video ? (
              <a className="text-blue-600" href={detail.recipe_video} target="_blank" rel="noreferrer">
                Watch
              </a>
            ) : (
              '-'
            )}
          </div>
        </div>

        {detail?.ingredients && (
          <div className="mt-4">
            <h4 className="font-semibold">Ingredients</h4>
            <ol className="list-none pl-5 text-sm">
              {detail.ingredients.map((ing: any, idx: number) => (
                <li key={idx} className="mb-4">
                  <>
                    <p>Main: {ing.main}</p>
                    <p>Sauce: {ing.sauce}</p>
                  </>
                </li>
              ))}
            </ol>
          </div>
        )}

        {detail?.steps && (
          <div className="mt-4">
            <h4 className="font-semibold">Instructions</h4>
            <ol className="list-decimal pl-5 text-sm">
              {detail.steps.map((ins: any, idx: number) => (
                <li key={idx} className="mb-2">
                  {ins.step}
                  {ins.image && (
                    <img src={ins.image} alt={`step-${idx}`} className="mt-2 h-24 w-full object-cover rounded" />
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {nutritionItems.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold">Nutrition</h4>
            
            {/* Structured Nutrition Facts table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-100 dark:bg-zinc-700">
                    <th className="text-left p-2">Nutrient</th>
                    <th className="text-left p-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {nutritionEntries.map((n, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2 align-top font-medium">{n.key}</td>
                      <td className="p-2 align-top">{n.value || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {detail?.notes && (
          <div className="mt-4">
            <h4 className="font-semibold">Notes</h4>
            <p className="text-sm">{detail.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
