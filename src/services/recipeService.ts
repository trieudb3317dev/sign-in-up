type CategorySub = {
  id: number;
  name: string;
};

type AdminSub = {
  id: number;
  username: string;
  role: string;
};

type Recipe<C = CategorySub, A = AdminSub> = {
  id: number;
  title: string;
  slug: string;
  image_url: string;
  category: C;
  admin: A;
};

type RecipeDetails = {
  id: number;
  recipe_video: string;
  time_preparation: string;
  time_cooking: string;
  recipe_type: string;
  ingredients: { main: string; sauce?: string }[];
  steps: { step: string; image?: string }[];
  nutrition_info: string[];
  notes: string;
  nutrition_facts: boolean;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  nextPage: number | boolean;
  prevPage: number | boolean;
};

type RecipeResponse<C = CategorySub, A = AdminSub> = {
  data: Recipe<C, A>[];
  pagination: Pagination;
};

type RecipeCreateType = {
  title: string;
  image_url: string;
  description: string;
  category_id: number;
  detail: RecipeDetails;
};

type RecipeUpdateType = {
  title: string;
  image_url: string;
  description: string;
};

type RecipeUpdateDetailsType = RecipeDetails;

export default class RecipeService {
  /**
   * Get all recipes service
   * - apiPublic: axios-like instance (must provide .get)
   */
  static async getAllRecipes(apiPublic: any, params?: Record<string, any>): Promise<RecipeResponse> {
    const response = await apiPublic.get('/recipes', { params });
    return response.data;
  }

  /**
   * Get recipes by creator service
   * - apiPrivate: axios-like instance (must provide .get)
   */
  static async getRecipesByCreator(apiPrivate: any, params?: Record<string, any>): Promise<RecipeResponse> {
    const response = await apiPrivate.get('/recipes/by-created/me', { params });
    return response.data;
  }

  /**
   * Get recipe by ID service
   * - apiPublic: axios-like instance (must provide .get)
   */
  static async getRecipeById(apiPublic: any, id: number): Promise<Recipe> {
    const response = await apiPublic.get(`/recipes/${id}`);
    return response.data;
  }

  /**
   * Get recipes details service
   * - apiPublic: axios-like instance (must provide .get)
   */
  static async getRecipeDetails(apiPublic: any, id: number): Promise<RecipeDetails> {
    const response = await apiPublic.get(`/recipes/${id}/details`);
    return response.data;
  }

  /**
   * Create recipe service
   * - apiPrivate: axios-like instance (must provide .post)
   */
  static async createRecipe(apiPrivate: any, recipeDto: RecipeCreateType): Promise<{ message: string }> {
    const response = await apiPrivate.post('/recipes', recipeDto);
    return response.data;
  }

  /**
   * Update recipe service
   * - apiPrivate: axios-like instance (must provide .put)
   */
  static async updateRecipe(apiPrivate: any, id: number, recipeDto: RecipeUpdateType): Promise<{ message: string }> {
    const response = await apiPrivate.put(`/recipes/${id}`, recipeDto);
    return response.data;
  }
  /**
   * Update recipe details service
   * - apiPrivate: axios-like instance (must provide .put)
   */
  static async updateRecipeDetails(
    apiPrivate: any,
    recipe_id: number,
    detailsDto: RecipeUpdateDetailsType
  ): Promise<{ message: string }> {
    const response = await apiPrivate.put(`/recipes/${recipe_id}/details`, detailsDto);
    return response.data;
  }

  /**
   * Delete recipe service
   * - apiPrivate: axios-like instance (must provide .delete)
   */
  static async deleteRecipe(apiPrivate: any, id: number): Promise<{ message: string }> {
    const response = await apiPrivate.delete(`/recipes/${id}`);
    return response.data;
  }

  /**
   * Export recipes to CSV service
   * - apiPrivate: axios-like instance, only super_admin (must provide .get)
   */
  static async exportRecipesToCSV(apiPrivate: any): Promise<Blob> {
    const response = await apiPrivate.get('/recipes/export/csv');
    return response.data; // Blob representing the CSV file
  }

  /**
   * Import recipes from CSV service
   * - apiPrivate: axios-like instance, only super_admin (must provide .post)
   */
  static async importRecipesFromCSV(apiPrivate: any, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiPrivate.post('/recipes/import/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}
