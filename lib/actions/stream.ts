"use server";

import { createClient } from "../supabase/server";
import { StreamChat } from "stream-chat";

export const getStreamUserToken = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "user not logged in" };
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (userError) {
    console.error(userError.message);
    throw new Error("failed to fetch user info.");
  }

  const serverClient = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    process.env.STREAM_API_SECRET!
  );

  const token = serverClient.createToken(user.id);

  await serverClient.upsertUser({
    id: user.id,
    name: userData.full_name,
    image: userData.avatar_url || undefined,
  });

  return {
    token,
    userId: user.id,
    userName: userData.full_name,
    userImage: userData.avatar_url || undefined,
  };
};

export const createOrGetChannel = async (otherUserId: string) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "user not logged in" };
  }

  const { data: matches, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .or(
      `and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`
    )
    .eq("is_active", true)
    .single();

  if (matchError || !matches) {
    throw new Error("Users are not matched. Cannot create chat channel.");
  }

  const sortedIds = [user.id, otherUserId].sort();
  const combinedIds = sortedIds.join("_");
  let hash = 0;
  for (let i = 0; i < combinedIds.length; i++) {
    const char = combinedIds.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  const channelId = `match_${Math.abs(hash).toString(36)}`;

  const serverClient = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    process.env.STREAM_API_SECRET!
  );

  const { data: otherUserData, error: otherUserError } = await supabase
    .from("users")
    .select("full_name, avatar_url")
    .eq("id", otherUserId)
    .single();

  if (otherUserError) {
    console.error(otherUserError.message);
    throw new Error("failed to fetch other user data");
  }

  const channel = serverClient.channel("messaging", channelId, {
    members: [user.id, otherUserId],
    created_by_id: user.id,
  });

  await serverClient.upsertUser({
    id: otherUserId,
    name: otherUserData.full_name,
    image: otherUserData.avatar_url || undefined,
  });

  try {
    await channel.create();
    console.log("channel created", channelId);
  } catch (error) {
    console.error("error creating channel", error);
    if (error instanceof Error && !error.message.includes("already exists")) {
      throw error;
    }
  }

  return {
    channelType: "messaging",
    channelId: channelId,
  };
};
