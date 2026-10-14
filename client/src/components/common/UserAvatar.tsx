interface Props {
  src?: string | null;
  name?: string;
  size?: number; // px
}

export default function UserAvatar({ src, name, size = 32 }: Props) {
  const initials = (name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return src ? (
    <img
      src={src}
      alt={name ?? "Profile"}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full object-cover"
    />
  ) : (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground"
    >
      {initials}
    </div>
  );
}