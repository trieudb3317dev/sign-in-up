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
   * Try multiple candidate endpoints/methods because backend naming may differ.
   */
  static async addToWhistlist(apiSecure: any, recipeId: number): Promise<any> {
    const candidates = [
      `/recipes/${recipeId}/add-to-favorites`
    ];

    const methods: Array<'post' | 'put' | 'patch'> = ['post', 'put', 'patch'];

    for (const path of candidates) {
      for (const method of methods) {
        // try without body first
        try {
          const resp = await apiSecure[method](path);
          const data = resp?.data;
          // success if 2xx
          if (resp?.status && resp.status >= 200 && resp.status < 300) {
            return data;
          }
        } catch (err: any) {
          const status = err?.response?.status;
          // if 404 try next method/path; if auth error bubble up
          if (status === 401 || status === 403) throw err;
          if (status === 404) {
            // try next variant
          } else {
            // other errors rethrow
            throw err;
          }
        }

        // try with body { recipe_id } (some APIs accept body)
        try {
          const resp = await apiSecure[method](path, { recipe_id: recipeId });
          const data = resp?.data;
          if (resp?.status && resp.status >= 200 && resp.status < 300) {
            return data;
          }
        } catch (err: any) {
          const status = err?.response?.status;
          if (status === 401 || status === 403) throw err;
          if (status === 404) {
            // continue to next
          } else {
            throw err;
          }
        }
      }
    }

    // none matched
    return { error: 'endpoint_not_found' };
  }

  /**
   * Remove recipe from wishlist (favorites)
   * Try multiple candidate endpoints & methods.
   */
  static async removeFromWhistlist(apiSecure: any, recipeId: number): Promise<any> {
    const candidates = [
      `/recipes/${recipeId}/remove-from-favorites`
    ];

    const methods: Array<'delete' | 'post' | 'put' | 'patch'> = ['delete', 'post', 'put', 'patch'];

    for (const path of candidates) {
      for (const method of methods) {
        try {
          // axios.delete may accept body differently; handle delete separately
          let resp;
          if (method === 'delete') {
            // try delete without body
            try {
              resp = await apiSecure.delete(path);
            } catch (err) {
              // try delete with data if axios supports config.data
              try {
                resp = await apiSecure.request({ url: path, method: 'DELETE', data: { recipe_id: recipeId } });
              } catch (e) {
                throw e;
              }
            }
          } else {
            resp = await apiSecure[method](path);
          }
          if (resp?.status && resp.status >= 200 && resp.status < 300) return resp.data;
        } catch (err: any) {
          const status = err?.response?.status;
          if (status === 401 || status === 403) throw err;
          if (status === 404) {
            // try next
          } else {
            throw err;
          }
        }

        // try with body { recipe_id }
        try {
          let resp;
          if (method === 'delete') {
            resp = await apiSecure.request({ url: path, method: 'DELETE', data: { recipe_id: recipeId } });
          } else {
            resp = await apiSecure[method](path, { recipe_id: recipeId });
          }
          if (resp?.status && resp.status >= 200 && resp.status < 300) return resp.data;
        } catch (err: any) {
          const status = err?.response?.status;
          if (status === 401 || status === 403) throw err;
          if (status === 404) {
            // continue
          } else {
            throw err;
          }
        }
      }
    }

    return { error: 'endpoint_not_found' };
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
