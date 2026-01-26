'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import usePublic from '@/hooks/useApiPublic';
import notify from '@/utils/notify';
import { useAuth } from '@/hooks/useAuth';

export default function VerifyAccountPage() {
  const apiPublic = usePublic();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auth } = useAuth();

  const usernameFromQuery = searchParams?.get('username') ?? '';
  const codeFromQuery = searchParams?.get('code') ?? '';
  const roleFromQuery = searchParams?.get('role') ?? '';

  const [username] = useState(usernameFromQuery);
  const [code, setCode] = useState(codeFromQuery || '');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');

  useEffect(() => {
    // auto verify when both username and code present in query
    if (username && codeFromQuery) {
      doVerify(codeFromQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, codeFromQuery]);

  const doVerify = async (codeToUse?: string) => {
    if (!username) {
      notify('error', 'Missing username in query');
      return;
    }
    const c = codeToUse ?? code;
    if (!c) {
      notify('error', 'Missing verification code');
      return;
    }

    setLoading(true);
    setStatus('verifying');
    try {
      // call backend endpoint (matches screenshot pattern)
      const res = await apiPublic.post(
        `/${roleFromQuery ? 'admin' : 'auth'}/verify-account/${encodeURIComponent(username)}/${encodeURIComponent(c)}`
      );
      const message = res?.data?.message || 'Verified successfully';
      notify('success', message);
      setStatus('success');
      // redirect to sign-in (or change to desired route)
      router.push('/sign-in');
    } catch (err: any) {
      console.error('verify error', err);
      const msg = err?.response?.data?.message || err?.message || 'Verification failed';
      notify('error', msg);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Verify account</h1>

      {username ? (
        <>
          <p className="text-sm text-zinc-600 mb-4">
            Hi <strong>{username}</strong>. Vui lòng kiểm tra email và bấm link xác thực. Nếu bạn đã mở link trên mail
            thì hệ thống sẽ tự xác thực. Bạn cũng có thể nhập mã xác thực bên dưới.
          </p>

          <div className="space-y-3">
            <label className="block">
              <div className="text-xs text-zinc-500 mb-2">Verification code</div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code from email"
                className="w-full border border-zinc-200 dark:border-zinc-700 rounded px-3 py-2 bg-white dark:bg-transparent"
                disabled={loading}
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                onClick={() => doVerify()}
                disabled={loading || !code}
                className="px-4 py-2 bg-sky-600 text-white rounded disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>

              {status === 'success' && <div className="text-sm text-green-600">Account verified. Redirecting...</div>}
              {status === 'error' && <div className="text-sm text-red-600">Verification failed. Please try again.</div>}
            </div>
          </div>
        </>
      ) : (
        <div className="text-sm text-zinc-600">
          Missing username. Vui lòng mở link xác thực từ email hoặc liên hệ support.
        </div>
      )}
    </div>
  );
}
