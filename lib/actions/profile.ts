"use server";
import { UserProfile } from "@/app/profile/page";
import { createClient } from "../supabase/server";

const getCurrentUserProfile = async () => {
  const supabase = await createClient(); // Await the client creation

  const { data, error } = await supabase.auth.getUser(); // Await getUser()

  if (error || !data.user) {
    return null;
  }

  const user = data.user;
  console.log(user);

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Profile fetch error:", error);
    return null;
  }

  return profile;
};

const uploadProfilePhoto = async (file: File) => {
  const supabase = await createClient(); // Await the client creation
  const { data, error } = await supabase.auth.getUser(); // Await getUser()

  if (error || !data.user) {
    return { success: false, error: "user not found" };
  }

  const user = data.user;

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;

  const { error: profileUploadrror } = await supabase.storage
    .from("profile_photo")
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  if (profileUploadrror) {
    return { success: false, error: profileUploadrror.message };
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from("profile_photo").getPublicUrl(fileName);

  return { success: true, url: publicUrl };
};

const updateUserProfile = async (profileData: Partial<UserProfile>) => {
  const supabase = await createClient(); // Await the client creation
  const { data, error } = await supabase.auth.getUser(); // Await getUser()

  if (error || !data.user) {
    return { success: false, error: "user not found" };
  }

  const user = data.user;

  const { error: profileUpdateError } = await supabase
    .from("users")
    .update({
      full_name: profileData.full_name,
      username: profileData.username,
      bio: profileData.bio,
      gender: profileData.gender,
      birthdate: profileData.birthdate,
      avatar_url: profileData.avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileUpdateError) {
    console.log(profileUpdateError);
    return { success: false, error: profileUpdateError.message };
  }

  return { success: true };
};

export { getCurrentUserProfile, uploadProfilePhoto, updateUserProfile };
