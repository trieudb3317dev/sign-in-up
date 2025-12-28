'use client';
import { useEffect, useState } from 'react';
import AuthAdminService from '@/services/adminAuthService';
import { useSecure } from '@/hooks/useApiSecure';

type Admin = {
  id: number;
  username: string;
  email: string;
  role?: string;
  created_at?: string;
};

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiSecure = useSecure(); // custom hook to get secured api instance

  async function fetchAdmins() {
    setLoading(true);
    setError(null);
    try {
      // use the service
      const res = await AuthAdminService.getAdminList(apiSecure, {});
      // service returns response.data (may be array or { data: [...] })
      const list: Admin[] = Array.isArray(res) ? res : res?.data ?? [];
      setAdmins(list);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function toggleBlock(adminId: number) {
    try {
      await AuthAdminService.blockAdmin(apiSecure, adminId);
      await fetchAdmins();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Admin lists</h2>
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
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Created</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a, idx: number) => (
                <tr key={a.id} className="border-t">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">{a.username}</td>
                  <td className="p-2">{a.email}</td>
                  <td className="p-2">{a.role ?? '-'}</td>
                  <td className="p-2">{a.created_at ?? '-'}</td>
                  <td className="p-2">
                    <button
                      onClick={() => toggleBlock(a.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Toggle Block
                    </button>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-zinc-500">
                    No admins found
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
