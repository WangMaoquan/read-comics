import { ApiClient } from '../core/client';

export interface UpdateProfileData {
  username?: string;
  password?: string;
}

export class UsersService {
  constructor(private client: ApiClient) {}

  /**
   * 更新用户资料
   */
  async updateProfile(data: UpdateProfileData): Promise<any> {
    return this.client.patch('/users/profile', data);
  }
}
