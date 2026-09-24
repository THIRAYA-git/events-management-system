import { useEffect, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { uploadAvatar } from "@/api/upload.api";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

interface Props {
  currentUrl?: string | null;
  name?: string;
  onUploaded?: (url: string) => void | Promise<void>;
}

export default function AvatarUploader({ currentUrl, name, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const initials = (name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;

    setError(null);
    if (!ALLOWED.includes(file.type)) return setError("Use a JPG, PNG or WEBP image.");
    if (file.size > MAX_BYTES) return setError("Image must be 5 MB or smaller.");

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      await onUploaded?.(url);
    } catch (err: any) {
      setPreview(null);
      setError(err?.response?.data?.message ?? "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const src = preview ?? currentUrl ?? null;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-200">
        {src ? (
          <img src={src} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-gray-600">
            {initials}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </div>

      <div>
        <input ref={inputRef} type="file" accept={ALLOWED.join(",")} className="hidden" onChange={handleFile} />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <Camera className="h-4 w-4" />
          {currentUrl ? "Change photo" : "Upload photo"}
        </button>
        <p className="mt-1 text-xs text-gray-500">JPG, PNG or WEBP, up to 5 MB.</p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}