'use client';
import React, { useState } from 'react';
import { useSecure } from '@/hooks/useApiSecure';
import UserService from '@/services/userService';
import notify from '@/utils/notify';

export default function SettingsPage() {
	const api = useSecure();
	const [otp, setOtp] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);

	async function handleChangePassword(e?: React.FormEvent) {
		e?.preventDefault();
		if (!otp || !newPassword) {
			notify('error', 'Fill required fields');
			return;
		}
		if (newPassword !== confirmPassword) {
			notify('error', 'New password and confirm do not match');
			return;
		}
		setLoading(true);
		try {
			notify('success', 'Password changed');
			setOtp('');
			setNewPassword('');
			setConfirmPassword('');
		} catch (err) {
			console.error('change password error', err);
			notify('error', 'Change password failed');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div>
			<h2 className="text-2xl font-semibold mb-4">Settings</h2>

			<form onSubmit={handleChangePassword} className="max-w-md">
				<label className="text-sm block mb-2">
					Verify code
					<input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full mt-1 px-2 py-1 border rounded" />
				</label>

				<label className="text-sm block mb-2">
					New password
					<input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full mt-1 px-2 py-1 border rounded" />
				</label>

				<label className="text-sm block mb-4">
					Confirm new password
					<input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full mt-1 px-2 py-1 border rounded" />
				</label>

				<button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
					{loading ? 'Saving...' : 'Change password'}
				</button>
			</form>
		</div>
	);
}
