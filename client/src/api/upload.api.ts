import { api } from "@/lib/api";

export interface UploadedImage {
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export const uploadImage = async (
  file: File,
  folder: "halls" | "organizers" | "sponsors" | "events" | "users" | "menu"
): Promise<UploadedImage> => {
  const form = new FormData();
  form.append("image", file);
  const { data } = await api.post(`/uploads/image?folder=${folder}`, form);
  return data.image;
};

export const uploadAvatar = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append("image", file);
  const { data } = await api.post("/uploads/avatar", form);
  return data.profile_image as string;
};