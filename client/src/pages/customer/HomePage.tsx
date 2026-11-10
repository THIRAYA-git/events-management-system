import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Loader2,
  Megaphone,
  MapPin,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import PageHero from "@/components/common/PageHero";
import { getAllHalls } from "@/api/hall.api";
import type { Hall } from "@/types/hall.types";
import { getPublicFeedback } from "@/api/publicFeedback.api";
import type { PublicFeedback } from "@/types/publicFeedback.types";
import {
  getMyNextUpcomingBooking,
  type UpcomingBookingSummary,
} from "@/api/myUpcomingBooking.api";

// Local images (served from client/public). Note: NO "/public" in the path.
const HALL_IMAGES = ["/images/halls/hall-1.jpg", "/images/halls/hall-2.jpg"];

const GALLERY = [
  { id: 1, caption: "Guest lounge corner", image: "/images/gallery/gallery-1.jpg" },
  {
    id: 2,
    caption: "3rd floor staircase",
    image: "/images/gallery/gallery-2.jpg",
  },
  {
    id: 3,
    caption: "Hall 2 – Banquet setup",
    image: "/images/gallery/gallery-3.jpg",
  },
  {
    id: 4,
    caption: "Hall 1 – Stage",
    image: "/images/gallery/gallery-4.jpg",
  },
  {
    id: 5,
    caption: "Hall 1 – Main floor",
    image: "/images/gallery/gallery-5.jpg",
  },
];

const PARTNER_CARDS = [
  {
    icon: Megaphone,
    eyebrow: "For sponsors",
    title: "Want to sponsor an event? Join with us.",
    description:
      "Connect your brand with weddings, birthdays, school and community events held at our halls.",
    points: [
      "Browse upcoming events and pick the ones that fit your brand",
      "Send sponsorship offers straight to the host",
      "Track every offer and its response in one place",
    ],
    cta: "Join as a sponsor",
    to: "/register?role=sponsor",
  },
  {
    icon: Sparkles,
    eyebrow: "For organizers & decorators",
    title: "Elevate your business with Aazath Plaza.",
    description:
      "Get discovered by customers planning their next event and win bookings without chasing leads.",
    points: [
      "Get listed where customers choose their event organizer",
      "Receive event requests and accept or decline in one click",
      "Showcase your portfolio and build your ratings",
    ],
    cta: "Join as an organizer",
    to: "/register?role=organizer",
  },
];

/* ────────────────────────────────────────────────────────────
   ANIMATION HELPERS
   Pure Tailwind + IntersectionObserver, no extra packages.
   Elements fade in and rise once, the first time they scroll
   into view. Users with "reduce motion" on see everything
   immediately.
   ──────────────────────────────────────────────────────────── */
function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number; // ms, use for staggering cards
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(prefersReducedMotion());

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* Image with a graceful fallback box when the file is missing. */
function PhotoOrPlaceholder({
  src,
  alt,
  label,
  className = "",
  icon: Icon = ImageOff,
}: {
  src?: string | null;
  alt: string;
  label: string;
  className?: string;
  icon?: typeof ImageOff;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground ${className}`}
      >
        <Icon className="h-7 w-7 opacity-60" />
        <span className="text-xs font-medium">{label}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${className}`}
    />
  );
}

/* Images shown one by one: each photo cross-fades into the next.
   Auto-advances, pauses on hover/focus, and has arrows + dots.
   With "reduce motion" on, it stops auto-playing. */
function GalleryGrid({
  items,
}: {
  items: { id: number; caption: string; image: string }[];
}) {
  const [open, setOpen] = useState<number | null>(null);
  const total = items.length;

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % total));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + total) % total));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, total]);

  return (
    <>
      {/* fixed-size grid: 1 large + 4 small */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:h-[420px] sm:grid-cols-4 sm:grid-rows-2">
        {items.slice(0, 5).map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`View ${item.caption}`}
            className={`group relative overflow-hidden rounded-xl border border-border bg-muted ${
              i === 0
                ? "col-span-2 aspect-[16/10] sm:row-span-2 sm:aspect-auto"
                : "aspect-square sm:aspect-auto"
            }`}
          >
            <img
              src={item.image}
              alt={item.caption}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-8 text-left text-xs font-medium text-white sm:text-sm">
              {item.caption}
            </span>
          </button>
        ))}
      </div>

      {/* lightbox: shows the full, uncropped photo */}
      {open !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
          aria-label={items[open].caption}
        >
          <img
            src={items[open].image}
            alt={items[open].caption}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
          />
          <p className="absolute bottom-5 left-0 right-0 text-center text-sm font-medium text-white">
            {items[open].caption} · {open + 1} / {total}
          </p>
          <button
            type="button"
            onClick={() => setOpen(null)}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + total) % total); }}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % total); }}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [testimonials, setTestimonials] = useState<PublicFeedback[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingBookingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [hallsRes, feedbackRes, upcomingRes] = await Promise.allSettled([
        getAllHalls(),
        getPublicFeedback(4),
        user?.role === "customer"
          ? getMyNextUpcomingBooking()
          : Promise.resolve(null),
      ]);

      if (hallsRes.status === "fulfilled") setHalls(hallsRes.value);
      else console.error("Halls failed:", hallsRes.reason);

      if (feedbackRes.status === "fulfilled")
        setTestimonials(feedbackRes.value);
      else console.error("Feedback failed:", feedbackRes.reason);

      if (upcomingRes.status === "fulfilled") setUpcoming(upcomingRes.value);

      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  // If the API returns no halls, still show two placeholder cards.
  const hallCards: Array<Partial<Hall> & { key: string }> =
    halls.length > 0
      ? [...halls]
          .sort((a, b) => a.hall_id - b.hall_id)
          .map((h) => ({ ...h, key: String(h.hall_id) }))
      : HALL_IMAGES.map((_, i) => ({
          key: `placeholder-${i}`,
          hall_name: `Hall ${i + 1}`,
          description: "Hall description goes here.",
          capacity: 600,
        }));

  return (
    <div>
      <PageHero
        title="Welcome to Aazath Plaza"
        subtitle="Two elegant halls, seamless booking, and everything you need for weddings, engagements, and celebrations — all in one place."
      >
        <Link
          to="/book"
          className="neon-btn group inline-flex items-center gap-2 rounded-full border-2 px-9 py-3 text-sm font-semibold tracking-wide"
        >
          Book Now
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </PageHero>

      <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
          </div>
        ) : (
          <>
            {/* ── Upcoming event card (customer only) ─────────── */}
            {upcoming && (
              <Reveal className="mb-12">
                <div className="rounded-xl border border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 p-5">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-400">
                    {/* soft pulsing dot draws the eye to the next event */}
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-60 motion-reduce:animate-none" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
                    </span>
                    Your Upcoming Event
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-medium text-foreground">
                        {upcoming.booking_ref}
                      </span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {upcoming.event_type}
                      </span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {upcoming.hall_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {new Date(upcoming.event_date).toLocaleDateString()}
                      </span>
                      <Link
                        to="/my-bookings"
                        className="group inline-flex items-center gap-1 text-sm font-medium text-violet-700 dark:text-violet-400 hover:underline"
                      >
                        View details
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            )}

            {/* ── Hall showcase ────────────────────────────────── */}
            <Reveal>
              <h2 className="text-2xl font-semibold text-foreground">
                Our Halls
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose the space that fits your celebration.
              </p>
            </Reveal>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {hallCards.map((hall, i) => (
                <Reveal key={hall.key} delay={i * 150}>
                  <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:hover:translate-y-0">
                    <div className="overflow-hidden">
                      <PhotoOrPlaceholder
                        src={HALL_IMAGES[i % HALL_IMAGES.length]}
                        alt={hall.hall_name ?? `Hall ${i + 1}`}
                        label={`Add Hall ${i + 1} photo`}
                        className="h-52 w-full"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-foreground">
                        {hall.hall_name}
                      </h3>
                      {hall.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {hall.description}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-violet-700 dark:text-violet-400">
                        <span className="flex items-center gap-1 rounded-full bg-violet-50 dark:bg-violet-500/10 px-2.5 py-1">
                          <Users className="h-3.5 w-3.5" /> {hall.capacity}{" "}
                          guests
                        </span>
                        {hall.floor_number !== undefined && (
                          <span className="flex items-center gap-1 rounded-full bg-violet-50 dark:bg-violet-500/10 px-2.5 py-1">
                            <MapPin className="h-3.5 w-3.5" /> Floor{" "}
                            {hall.floor_number}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* ── other images ──────────────────────────── */}
            <div className="mt-14">
              <Reveal>
                <h2 className="text-2xl font-semibold text-foreground">
                  Take a Look Around
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  A glimpse of our halls, stage, and lounge areas.
                </p>
              </Reveal>
              <GalleryGrid items={GALLERY} />
            </div>

            {/* ── Testimonials ─────────────────────────────────── */}
            {testimonials.length > 0 && (
              <div className="mt-14">
                <Reveal>
                  <h2 className="text-2xl font-semibold text-foreground">
                    What Our Customers Say
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Reviews from families and organisations who celebrated with
                    us.
                  </p>
                </Reveal>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {testimonials.map((t, i) => (
                    <Reveal key={t.feedback_id} delay={i * 120}>
                      <div className="h-full rounded-xl border border-border border-l-4 border-l-violet-500 bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star
                              key={s}
                              className={`h-4 w-4 ${
                                s < t.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/40"
                              }`}
                            />
                          ))}
                        </div>
                        {t.comment && (
                          <p className="mt-3 text-sm text-foreground">
                            "{t.comment}"
                          </p>
                        )}
                        <p className="mt-3 text-xs font-medium text-muted-foreground">
                          {t.customer_name} · {t.event_type}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}

            {/* ── Partner call-to-action ───────────────────────── */}
            <div className="mt-14">
              <Reveal>
                <h2 className="text-2xl font-semibold text-foreground">
                  Grow with Aazath Plaza
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Partner with us and put your business in front of every event
                  we host.
                </p>
              </Reveal>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {PARTNER_CARDS.map(({ icon: Icon, ...card }, i) => (
                  <Reveal key={card.eyebrow} delay={i * 150}>
                    <div className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:hover:translate-y-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 transition-transform duration-300 group-hover:scale-110 motion-reduce:group-hover:scale-100">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-400">
                        {card.eyebrow}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-foreground">
                        {card.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {card.description}
                      </p>
                      <ul className="mt-4 space-y-2 text-sm text-foreground">
                        {card.points.map((p) => (
                          <li key={p} className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        to={card.to}
                        className="group/cta mt-5 inline-flex items-center gap-2 self-start rounded-md bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
                      >
                        {card.cta}
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                      </Link>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
