export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  username: string;
  password?: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}
