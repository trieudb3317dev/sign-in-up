export default class BlogService {
  static async getAllBlogs(api: any, params?: Record<string, any>): Promise<any> {
    const q: Record<string, any> = {};
    if (params?.page != null) q.page = params.page;
    if (params?.limit != null) q.limit = params.limit;
    if (params?.sortBy) q.sortBy = params.sortBy;
    if (params?.sortDir) q.order = String(params.sortDir).toUpperCase();
    const res = await api.get('/blogs', { params: q });
    return res.data;
  }

  static async getBlogsByAuthor(api: any, params?: Record<string, any>): Promise<any> {
    const q: Record<string, any> = {};
    if (params?.page != null) q.page = params.page;
    if (params?.limit != null) q.limit = params.limit;
    if (params?.sortBy) q.sortBy = params.sortBy;
    if (params?.sortDir) q.order = String(params.sortDir).toUpperCase();
    const res = await api.get('/blogs/by-created', { params: q });
    return res.data;
  }

  static async getBlogById(api: any, id: number): Promise<any> {
    const res = await api.get(`/blogs/${id}`);
    return res.data;
  }

  static async createBlog(api: any, payload: any): Promise<any> {
    const res = await api.post('/blogs', payload);
    return res.data;
  }

  static async updateBlog(api: any, id: number, payload: any): Promise<any> {
    const res = await api.put(`/blogs/${id}`, payload);
    return res.data;
  }

  static async deleteBlog(api: any, id: number): Promise<any> {
    const res = await api.delete(`/blogs/${id}`);
    return res.data;
  }

  /**
   * Export blogs to CSV service
   * - apiPrivate: axios-like instance (must provide .get)
   */
  static async exportBlogsToCSV(api: any): Promise<Blob> {
    const response = await api.get('/blogs/export/csv');
    return response.data; // Blob representing the CSV file
  }

  /**
   * Import blogs from CSV service
   * - apiPrivate: axios-like instance (must provide .post)
   */
  static async importBlogsFromCSV(api: any, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/blogs/import/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}
