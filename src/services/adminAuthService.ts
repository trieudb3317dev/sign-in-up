import { AxiosInstance } from 'axios';
import jwt from 'jsonwebtoken';

type RegisterType = {
  username: string;
  email: string;
  password: string;
  role?: string;
};

type LoginType = {
  username: string;
  password: string;
};

type AuthType = {
  id: number;
  username: string;
  full_name: string | null;
  gender: string | null;
  day_of_birth: string;
  email: string;
  phone_number: string | null;
  created_at: string;
};

type ResetPasswordType = {
  reset_token: string;
  new_password: string;
};

type ForgotPasswordType = {
  email: string;
};

type UpdateProfileType = {
  full_name: string;
  avatar: string;
  gender?: 'male' | 'female' | 'other';
  day_of_birth: string;
  phone_number: string;
};

export default class AuthAdminService {
  /**
   * Register service
   * - apiPublic: axios-like instance (must provide .post)
   */
  static async register(apiPublic: any, { username, email, password, role }: RegisterType): Promise<any> {
    const response = await apiPublic.post('/admin/register', { username, email, password, role });
    return response.data;
  }

  /**
   * Login service
   */
  static async login(apiPublic: any, { username, password }: LoginType): Promise<any> {
    const response = await apiPublic.post('/admin/login', { username, password });
    return response.data;
  }

  /**
   * Forgot password service
   */
  static async sendOtp(apiPublic: any, { email }: { email: string }): Promise<any> {
    const response = await apiPublic.post('/admin/send-otp', { email });
    return response.data;
  }

  /**
   * Reset password service
   */
  static async resetPassword(
    apiPublic: any,
    { reset_token, new_password, otp }: { reset_token: string; new_password: string; otp: string }
  ): Promise<any> {
    const response = await apiPublic.post('/admin/reset-password', { reset_token, new_password, otp });
    return response.data;
  }

  /**
   * Logout
   */
  static async logout(apiPublic: any): Promise<any> {
    const response = await apiPublic.post('/admin/logout');
    return response.data;
  }

  static async getCurrentUser(apiPublic: any, accessToken: string): Promise<AuthType> {
    const response = await apiPublic.get(`/admin/me`);
    console.log('Current User Response:', response.data);
    return response.data;
  }

  static async updateProfile(
    apiPrivate: any,
    { full_name, avatar, gender, day_of_birth, phone_number }: UpdateProfileType
  ): Promise<any> {
    const response = await apiPrivate.put('/admin', {
      full_name,
      avatar,
      gender,
      day_of_birth,
      phone_number,
    });
    return response.data;
  }

  static async getAdminList(apiPrivate: any, params?: Record<string, any>): Promise<any> {
    const q: Record<string, any> = {};
    if (params?.page != null) q.page = params.page;
    if (params?.limit != null) q.limit = params.limit;
    if (params?.sortBy) q.sortBy = params.sortBy;
    if (params?.sortDir) q.order = String(params.sortDir).toUpperCase();
    const response = await apiPrivate.get('/admin/admins', { params: q });
    return response.data;
  }

  static async getUserList(apiPrivate: any, params?: Record<string, any>): Promise<any> {
    const q: Record<string, any> = {};
    if (params?.page != null) q.page = params.page;
    if (params?.limit != null) q.limit = params.limit;
    if (params?.sortBy) q.sortBy = params.sortBy;
    if (params?.sortDir) q.order = String(params.sortDir).toUpperCase();
    const response = await apiPrivate.get('/admin/users', { params: q });
    return response.data;
  }

  static async blockAdmin(apiPrivate: any, adminId: number): Promise<any> {
    const response = await apiPrivate.put(`/admin/status/${adminId}`);
    return response.data;
  }

  static async blockUser(apiPrivate: any, userId: number): Promise<any> {
    const response = await apiPrivate.put(`/admin/user/status/${userId}`);
    return response.data;
  }
}
