import { apiClient } from '../client';

export interface UpdateProfileData {
  username?: string;
  password?: string;
}

export const usersService = {
  async updateProfile(data: UpdateProfileData) {
    return apiClient.patch('/users/profile', data);
  },
};
