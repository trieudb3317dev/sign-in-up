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
}
