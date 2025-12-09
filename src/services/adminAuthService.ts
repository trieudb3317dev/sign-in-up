import { AxiosInstance } from 'axios';
import jwt from 'jsonwebtoken';

type RegisterType = {
  username: string;
  email: string;
  password: string;
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
  gender: 'male' | 'female' | 'other';
  day_of_birth: string;
  phone_number: string;
};

export default class AuthAdminService {
  /**
   * Register service
   * - apiPublic: axios-like instance (must provide .post)
   */
  static async register(apiPublic: any, { username, email, password }: RegisterType): Promise<any> {
    const response = await apiPublic.post('/admin/register', { username, email, password });
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
    const response = await apiPrivate.put('/admin/me', {
      full_name,
      avatar,
      gender,
      day_of_birth,
      phone_number,
    });
    return response.data;
  }
}
