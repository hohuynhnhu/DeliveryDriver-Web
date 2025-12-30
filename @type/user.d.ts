// @type/user.d.ts
// User-related type definitions

/**
 * User entity
 */
type User = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  avatarURL?: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  fcmToken?: string;
}
