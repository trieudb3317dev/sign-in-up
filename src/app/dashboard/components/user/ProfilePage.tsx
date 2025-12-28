'use client';
import React, { useEffect, useState } from 'react';
import { useSecure } from '@/hooks/useApiSecure';
import notify from '@/utils/notify';
import { API_URL_WITH_PREFIX, API_URL_DEVELOPMENT_WITH_PREFIX } from '@/config/contant.config';
import AuthService from '@/services/authService';
import AuthAdminService from '@/services/adminAuthService';

type Props = {
  initial?: any; // optional initial profile object
};

export default function ProfilePage({ initial }: Props) {
  const api = useSecure();

  const [fullName, setFullName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [dayOfBirth, setDayOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setFullName(initial.full_name ?? '');
      setAvatar(initial.avatar ?? '');
      setGender(initial.gender ?? '');
      setDayOfBirth(initial.day_of_birth ? initial.day_of_birth.slice(0, 10) : '');
      setPhoneNumber(initial.phone_number ?? '');
    }
  }, [initial]);

  async function handleFile(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_URL_WITH_PREFIX || API_URL_DEVELOPMENT_WITH_PREFIX}/cloudinary/upload`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setAvatar(data.url || '');
    } catch (err) {
      console.error('upload error', err);
      notify('error', 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleUpdate() {
    setSaving(true);
    try {
      // build payload and only include gender when it's set (not empty string)
      const payload: any = {
        full_name: fullName,
        avatar,
        day_of_birth: dayOfBirth,
        phone_number: phoneNumber,
      };
      if (gender) {
        payload.gender = gender as 'male' | 'female' | 'other';
      }

      {
        initial && initial !== undefined && initial !== 'user'
          ? await AuthAdminService.updateProfile(api, payload)
          : await AuthService.updateProfile(api, payload);
      }
      notify('success', 'Profile updated');
    } catch (err) {
      console.error('update profile', err);
      notify('error', 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm block mb-2">
            Full name
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full mt-1 px-2 py-1 border rounded"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              Gender
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full mt-1 px-2 py-1 border rounded"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="text-sm">
              Date of birth
              <input
                type="date"
                value={dayOfBirth}
                onChange={(e) => setDayOfBirth(e.target.value)}
                className="w-full mt-1 px-2 py-1 border rounded"
              />
            </label>
          </div>

          <label className="text-sm block mt-3">
            Phone number
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full mt-1 px-2 py-1 border rounded"
            />
          </label>

          <div className="flex gap-2 mt-4">
            <button onClick={handleUpdate} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">
              {saving ? 'Saving...' : 'Update profile'}
            </button>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white dark:bg-zinc-800 rounded p-4 shadow">
            <div className="mb-3 text-sm font-medium">Avatar</div>
            <div className="flex items-center gap-3">
              {avatar ? (
                <img src={avatar} alt="avatar" className="h-24 w-24 object-cover rounded" />
              ) : (
                <div className="h-24 w-24 bg-zinc-200 rounded" />
              )}
              <div className="flex flex-col gap-2">
                <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                {uploading ? <div className="text-xs text-zinc-500">Uploading...</div> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
