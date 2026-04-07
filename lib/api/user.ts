import api from "../axios";
import type { UserProfile, UpdateProfileRequest, UserStats, Subscription } from "@/types";

const USER_ENDPOINTS = {
  PROFILE: "/api/v1/user/profile",
  STATS: "/api/v1/user/stats",
  SUBSCRIPTION: "/api/v1/user/subscription",
};

/**
 * Get user profile
 * GET /api/v1/user/profile
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>(USER_ENDPOINTS.PROFILE);
  return response.data;
};

/**
 * Update user profile (partial updates only)
 * PUT /api/v1/user/profile
 */
export const updateUserProfile = async (data: UpdateProfileRequest): Promise<UserProfile> => {
  const response = await api.put<UserProfile>(USER_ENDPOINTS.PROFILE, data);
  return response.data;
};

/**
 * Get user statistics
 * GET /api/v1/user/stats
 */
export const getUserStats = async (): Promise<UserStats> => {
  const response = await api.get<UserStats>(USER_ENDPOINTS.STATS);
  return response.data;
};

/**
 * Get user subscription details
 * GET /api/v1/user/subscription
 */
export const getUserSubscription = async (): Promise<Subscription> => {
  const response = await api.get<Subscription>(USER_ENDPOINTS.SUBSCRIPTION);
  return response.data;
};
