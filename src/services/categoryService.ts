type Category = {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
  description?: string;
  recipe_count: number;
  created_at: string;
};

type QueryParams = {
  search?: string;
  page: number;
  limit: number;
  sortBy?: keyof Category;
  sortDir?: 'asc' | 'desc';
};

export default class CategoryService {

  /**
   * Get all categories service with pagination / filters
   * - apiPublic: axios-like instance (must provide .get)
   * - params: { page, limit, sortBy, sortDir, search }
   */
  static async getAllCategories(apiPublic: any, params?: Record<string, any>): Promise<any> {
    // build params object for query string (map sortDir -> order uppercase)
    const q: Record<string, any> = {};
    if (params?.search) q.search = params.search;
    if (params?.page != null) q.page = params.page;
    if (params?.limit != null) q.limit = params.limit;
    if (params?.sortBy) q.sortBy = params.sortBy;
    if (params?.sortDir) q.order = String(params.sortDir).toUpperCase(); // backend expects ASC/DESC

    const response = await apiPublic.get('/categories', { params: q });
    return response.data; // expected shape: { data: [...], pagination: {...} }
  }

  /**
   * Get category by ID service
   * - apiPublic: axios-like instance (must provide .get)
   */
  static async getCategoryById(apiPublic: any, id: number): Promise<any> {
    const response = await apiPublic.get(`/categories/${id}`);
    return response.data;
  }

  /**
   * Create category service
   * - apiPrivate: axios-like instance (must provide .post)
   */
  static async createCategory(
    apiPrivate: any,
    { name, image_url, description }: { name: string; image_url?: string; description?: string }
  ): Promise<any> {
    const response = await apiPrivate.post('/categories', { name, image_url, description });
    return response.data;
  }
  /**
   * Update category service
   * - apiPrivate: axios-like instance (must provide .put)
   */
  static async updateCategory(
    apiPrivate: any,
    id: number,
    { name, image_url, description }: { name: string; image_url?: string; description?: string }
  ): Promise<any> {
    const response = await apiPrivate.put(`/categories/${id}`, { name, image_url, description });
    return response.data;
  }

  /**
   * Delete category service
   * - apiPrivate: axios-like instance (must provide .delete)
   */
  static async deleteCategory(apiPrivate: any, id: number): Promise<any> {
    const response = await apiPrivate.delete(`/categories/${id}`);
    return response.data;
  }
}
