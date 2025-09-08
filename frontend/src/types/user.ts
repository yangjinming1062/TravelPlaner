// 用户相关类型定义
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  phone: string;
  email?: string;
}

export interface UserSchema {
  id: string;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  gender: string;
  avatar: string;
  created_at: string;
}

export interface UserProfileSchema extends UserSchema {
  budget_min: number;
  budget_max: number;
  budget_flexibility: string;
  preferred_transport_modes: string[];
  accommodation_level: number[];
  group_travel_preference: string;
  activity_preferences: string[];
  attraction_categories: string[];
  travel_style: string;
  dietary_restrictions: string[];
  display_language: string;
  custom_preferences: string;
}

export interface UserPreferencesSchema {
  budget_min: number;
  budget_max: number;
  budget_flexibility: string;
  preferred_transport_modes: string[];
  accommodation_level: number[];
  group_travel_preference: string;
  activity_preferences: string[];
  attraction_categories: string[];
  travel_style: string;
  dietary_restrictions: string[];
  display_language: string;
  custom_preferences: string;
}

export interface LoginResponse {
  user: UserSchema;
  token: string;
}

export interface UpdateUserProfileRequest {
  nickname?: string;
  email?: string;
  phone?: string;
  gender?: string;
}

export interface UpdatePasswordRequest {
  old: string;
  new: string;
}
