export default class UserService {
	/**
	 * Update user profile
	 * PUT /users/profile
	 * payload: { full_name, avatar, gender, day_of_birth, phone_number }
	 */
	static async updateProfile(apiSecure: any, payload: Record<string, any>): Promise<any> {
		const res = await apiSecure.put('/users/profile', payload);
		return res.data;
	}

	/**
	 * Change password
	 * POST /auth/change-password
	 * payload: { current_password, new_password }
	 */
	static async changePassword(apiSecure: any, payload: { current_password: string; new_password: string }): Promise<any> {
		const res = await apiSecure.post('/auth/change-password', payload);
		return res.data;
	}
}
