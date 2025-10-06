"use server";

import { createClient } from "../supabase/server";
import { UserProfile } from "@/app/profile/page";

export const getPotentialMatches = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not logged in");
  }

  const { data: potentialMatches, error: potentialMatchesError } =
    await supabase.from("users").select("*").neq("id", user.id).limit(50);

  if (potentialMatchesError) {
    throw new Error("error fetching potential matches");
  }

  const { data: currentUserPreferences, error: currentUserPreferencesError } =
    await supabase
      .from("users")
      .select("preferences")
      .eq("id", user.id)
      .single();

  if (currentUserPreferencesError) {
    throw new Error("failed to get user preferences");
  }

  const currentUserPrefs = currentUserPreferences.preferences as any;
  const genderPreference = currentUserPrefs?.gender_preference || [];

  const filteredMatches =
    potentialMatches
      .filter((match) => {
        if (!genderPreference || genderPreference.length === 0) {
          return true;
        }

        return genderPreference.includes(match.gender);
      })
      .map((match) => ({
        id: match.id,
        full_name: match.full_name,
        username: match.username,
        email: "",
        gender: match.gender,
        birthdate: match.birthdate,
        bio: match.bio,
        avatar_url: match.avatar_url,
        preferences: match.preferences,
        location_lat: undefined,
        location_lng: undefined,
        last_active: new Date().toISOString(),
        is_verified: true,
        is_online: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })) || [];

  return filteredMatches;
};

export const likeUser = async (toUserId: string) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not logged in");
  }

  const { error: likeError } = await supabase
    .from("likes")
    .insert({ from_user_id: user.id, to_user_id: toUserId });

  if (likeError) {
    console.error(likeError.message);
  }

  const { data: existingLike, error: matchCheckError } = await supabase
    .from("likes")
    .select("*")
    .eq("from_user_id", toUserId)
    .eq("to_user_id", user.id)
    .single();

  if (matchCheckError && matchCheckError.code !== "PGRST116") {
    throw new Error("failed to check for a match");
  }

  if (existingLike) {
    const { data: matchedUser, error: fetchMatchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", toUserId)
      .single();

    if (fetchMatchError) {
      throw new Error("failed to fetch match");
    }

    return {
      success: true,
      isMatch: true,
      matchedUser: matchedUser as UserProfile,
    };
  }

  return { success: true, isMatch: false };
};


export const getUserMatches = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .eq("is_active", true);

  if (error) {
    throw new Error("Failed to fetch matches");
  }

  const matchedUsers: UserProfile[] = [];

  for (const match of matches || []) {
    const otherUserId =
      match.user1_id === user.id ? match.user2_id : match.user1_id;

    const { data: otherUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", otherUserId)
      .single();

    if (userError) {
      continue;
    }

    matchedUsers.push({
      id: otherUser.id,
      full_name: otherUser.full_name,
      username: otherUser.username,
      email: otherUser.email,
      gender: otherUser.gender,
      birthdate: otherUser.birthdate,
      bio: otherUser.bio,
      avatar_url: otherUser.avatar_url,
      preferences: otherUser.preferences,
      location_lat: undefined,
      location_lng: undefined,
      last_active: new Date().toISOString(),
      is_verified: true,
      is_online: false,
      created_at: match.created_at,
      updated_at: match.created_at,
    });
  }

  return matchedUsers;
};
