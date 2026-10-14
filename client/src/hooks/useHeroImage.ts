import { useEffect, useState } from "react";
import { getAllHalls } from "@/api/hall.api";

// Want your own banner photo instead of a hall photo? Put the file in
// client/public (e.g. hero.jpg) and set this.".
// const HERO_IMAGE_OVERRIDE: string | null = "/auth-hero2.jpg";
const HERO_IMAGE_OVERRIDE: string | null = null;

// One shared request for every page that shows a hero, so moving between
// Home / About / Book doesn't refetch the halls each time.
let cached: Promise<string | null> | null = null;

const loadHeroImage = (): Promise<string | null> => {
  if (!cached) {
    cached = getAllHalls()
      .then((halls) => halls.find((h) => h.image_url)?.image_url ?? null)
      .catch(() => {
        cached = null; // allow a retry on the next mount
        return null;
      });
  }
  return cached;
};

export function useHeroImage(): string | null {
  const [image, setImage] = useState<string | null>(HERO_IMAGE_OVERRIDE);

  useEffect(() => {
    if (HERO_IMAGE_OVERRIDE) return;
    let active = true;
    loadHeroImage().then((url) => {
      if (active) setImage(url);
    });
    return () => {
      active = false;
    };
  }, []);

  return image;
}
