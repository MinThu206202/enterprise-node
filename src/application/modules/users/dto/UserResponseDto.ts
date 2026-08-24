export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  roles?: string[];
  permissions?: string[];
}
