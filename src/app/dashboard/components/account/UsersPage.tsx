'use client';
import { useSecure } from '@/hooks/useApiSecure';
import AuthAdminService from '@/services/adminAuthService';
import React, { useEffect, useState } from 'react';

type User = {
  id: number;
  username?: string;
  email: string;
  full_name?: string | null;
  created_at?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiSecure = useSecure(); // custom hook to get secured api instance

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      // use the service
      const res = await AuthAdminService.getUserList(apiSecure, {});
      // service returns response.data (may be array or { data: [...] })
      const list: User[] = Array.isArray(res) ? res : res?.data ?? [];
      setUsers(list);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function toggleBlock(userId: number) {
    try {
      await AuthAdminService.blockUser(apiSecure, userId);
      await fetchUsers();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">User lists</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-zinc-500">
                <th className="p-2">ID</th>
                <th className="p-2">Username</th>
                <th className="p-2">Full name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Created</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx: number) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">{u.username ?? '-'}</td>
                  <td className="p-2">{u.full_name ?? '-'}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.created_at ?? '-'}</td>
                  <td className="p-2">
                    <button
                      onClick={() => toggleBlock(u.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Toggle Block
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-zinc-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
