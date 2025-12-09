type QueryParams = Record<string, any>;

export default class WhistlistService {
  /**
   * Get all whistlist recipes service
   * - apiSecure: axios-like instance (must provide .get)
   * - params: page/limit/sort...
   */
  static async getAllWhistlistRecipes(apiSecure: any, params?: QueryParams): Promise<any> {
    const q: Record<string, any> = {};
    if (params?.page != null) q.page = params.page;
    if (params?.limit != null) q.limit = params.limit;
    if (params?.sortBy) q.sortBy = params.sortBy;
    if (params?.sortDir) q.order = String(params.sortDir).toUpperCase();
    const response = await apiSecure.get('/recipes/favorites/user', { params: q });
    return response.data;
  }

  /**
   * Add recipe to wishlist (favorites)
   * POST /recipes/{id}/add-to-favorites
   */
  static async addToWhistlist(apiSecure: any, recipeId: number): Promise<any> {
    const response = await apiSecure.post(`/recipes/${recipeId}/add-to-favorites`);
    return response.data;
  }

  /**
   * Remove recipe from wishlist (favorites)
   * DELETE /recipes/{id}/remove-from-favorites
   */
  static async removeFromWhistlist(apiSecure: any, recipeId: number): Promise<any> {
    const response = await apiSecure.delete(`/recipes/${recipeId}/remove-from-favorites`);
    return response.data;
  }

  /**
   * Check if recipe is in wishlist (favorites)
   * GET /recipes/{id}/is-favorite
   */
  static async isInWhistlist(apiSecure: any, recipeId: number): Promise<{ is_favorite: boolean }> {
    const response = await apiSecure.get(`/recipes/${recipeId}/is-favorite`);
    return response.data;
  }
}
