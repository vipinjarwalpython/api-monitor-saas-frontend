import api from "../axios";
import type {
  UpdateProfileRequest,
  UserProfile,
  UserStats,
  UserSubscriptionSummary,
} from "@/types";

const USER_ENDPOINTS = {
  PROFILE: "/api/v1/user/profile",
  STATS: "/api/v1/user/stats",
  SUBSCRIPTION: "/api/v1/user/subscription",
  DELETE_ACCOUNT: "/api/v1/user/delete-account",
} as const;

export async function getUserProfile() {
  const response = await api.get<UserProfile>(USER_ENDPOINTS.PROFILE);
  return response.data;
}

export async function updateUserProfile(data: UpdateProfileRequest) {
  const response = await api.put<UserProfile>(USER_ENDPOINTS.PROFILE, data);
  return response.data;
}

export async function getUserStats() {
  const response = await api.get<UserStats>(USER_ENDPOINTS.STATS);
  return response.data;
}

export async function getUserSubscription() {
  const response = await api.get<UserSubscriptionSummary>(USER_ENDPOINTS.SUBSCRIPTION);
  return response.data;
}

export async function deleteAccount() {
  await api.delete(USER_ENDPOINTS.DELETE_ACCOUNT);
}
