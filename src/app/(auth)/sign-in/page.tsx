'use client';

import React from 'react';
import { useAuthContext } from '../../../../context/AuthContext';
import { validateName, validatePassword, validatePhone } from '@/utils/validate';

import { IoIosEye } from 'react-icons/io';
import { IoIosEyeOff } from 'react-icons/io';
import notify from '@/utils/notify';
import usePublic from '@/hooks/useApiPublic';
import { useAuth } from '@/hooks/useAuth';
import AuthService from '@/services/authService';
import { useRouter } from 'next/navigation';
import AuthAdminService from '@/services/adminAuthService';

export default function SignInPage() {
  const { tab } = useAuthContext();
  const apiPublic = usePublic();
  const router = useRouter();
  const { setLoadding, accessToken, auth } = useAuth();
  const [username, setUsername] = React.useState('');
  const [mobile, setMobile] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(false);
  const [isUser, setIsUser] = React.useState(false);
  const [role, setRole] = React.useState<'admin' | null>(null);

  const usernameError = validateName(username);
  const phoneError = validatePhone(mobile);
  const passwordError = validatePassword(password);

  const authService = AuthService;

  React.useEffect(() => {
    if (auth && auth.role !== undefined) {
      setRole(auth.role === 'admin' ? 'admin' : null);
    }
  }, [auth]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'username' && usernameError) return notify('error', usernameError);
    if (tab === 'mobile' && phoneError) return notify('error', phoneError);
    if (passwordError) return notify('error', passwordError);
    if (!remember) return notify('error', 'You must agree to remember me.');
    setLoadding(true);
    try {
      const data = !isUser
        ? await authService.login(apiPublic, {
            username: tab === 'username' ? username : mobile,
            password,
          })
        : await AuthAdminService.login(apiPublic, {
            username: tab === 'username' ? username : mobile,
            password,
          });

      router.push(isUser ? '/dashboard' : '/');
      notify('success', 'Sign in successful!');
      console.log('signin response', data);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Sign in failed';
      notify('error', msg);
      router.push('/sign-in'); // Redirect back to sign-in page
    } finally {
      setLoadding(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {tab === 'username' ? (
        <label className="block">
          <div className="text-xs text-zinc-500 mb-2">Username</div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full border border-zinc-200 dark:border-zinc-700 rounded px-3 py-2 bg-white dark:bg-transparent text-zinc-900 dark:text-zinc-100"
            placeholder="Username"
          />
          {usernameError && <span className="text-xs text-red-500 mt-1">{usernameError}</span>}
        </label>
      ) : (
        <label className="block">
          <div className="text-xs text-zinc-500 mb-2">Mobile</div>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            className="w-full border border-zinc-200 dark:border-zinc-700 rounded px-3 py-2 bg-white dark:bg-transparent text-zinc-900 dark:text-zinc-100"
            placeholder="Mobile number"
          />
          {phoneError && <span className="text-xs text-red-500 mt-1">{phoneError}</span>}
        </label>
      )}

      <label className="block">
        <div className="text-xs text-zinc-500 mb-2">Password</div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-zinc-200 dark:border-zinc-700 rounded px-3 py-2 pr-10 bg-white dark:bg-transparent text-zinc-900 dark:text-zinc-100"
            placeholder="Password"
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
          >
            {showPassword ? <IoIosEyeOff size={18} /> : <IoIosEye size={18} />}
          </button>
        </div>
        {passwordError && <span className="text-xs text-red-500 mt-1">{passwordError}</span>}
      </label>

      <div className="flex items-center justify-between text-sm text-zinc-500">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4"
          />
          Remember me
        </label>
        <a href="#" className="text-sm text-sky-500">
          Forgot password?
        </a>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-600">
        <input type="checkbox" checked={isUser} onChange={(e) => setIsUser(e.target.checked)} className="w-4 h-4" />
        Is admin right?
      </label>

      <button
        type="submit"
        className="w-full mt-4 bg-gradient-to-r from-sky-400 to-blue-500 text-white py-3 rounded shadow-sm"
      >
        Continue
      </button>
    </form>
  );
}
