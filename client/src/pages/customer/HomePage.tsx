import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BedDouble,
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

/* ────────────────────────────────────────────────────────────
   IMAGE PLACEHOLDERS
   Drop your real photos into the /public folder using these
   exact paths (or change the paths below):

   public/images/halls/hall-1.jpg
   public/images/halls/hall-2.jpg
   public/images/rooms/room-1.jpg … room-5.jpg

   Halls: an image_url from the database wins; if there is none,
   the file below is used. If the file is missing too, a neutral
   "Add photo" box is shown instead of a broken image.
   ──────────────────────────────────────────────────────────── */
const HALL_PLACEHOLDERS = ["/images/halls/hall-1.jpg", "/images/halls/hall-2.jpg"];

const ROOMS = [
  { id: 1, name: "Room 1", image: "/images/rooms/room-1.jpg" },
  { id: 2, name: "Room 2", image: "/images/rooms/room-2.jpg" },
  { id: 3, name: "Room 3", image: "/images/rooms/room-3.jpg" },
  { id: 4, name: "Room 4", image: "/images/rooms/room-4.jpg" },
  { id: 5, name: "Room 5", image: "/images/rooms/room-5.jpg" },
];

const ROOM_PRICE_PER_DAY = 5000; // LKR, from FR-009

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

/* Rooms shown one by one: each photo cross-fades into the next.
   Auto-advances, pauses on hover/focus, and has arrows + dots.
   With "reduce motion" on, it stops auto-playing. */
function RoomsSlideshow({
  rooms,
  intervalMs = 4500,
}: {
  rooms: { id: number; name: string; image: string }[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const total = rooms.length;

  useEffect(() => {
    if (paused || prefersReducedMotion()) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % total), intervalMs);
    return () => clearInterval(timer);
  }, [paused, total, intervalMs]);

  const go = (i: number) => setIndex((i + total) % total);

  return (
    <div
      className="group relative mt-6 aspect-[16/9] overflow-hidden rounded-xl border border-border bg-muted shadow-sm sm:aspect-[21/9]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Accommodation rooms"
    >
      {rooms.map((room, i) => {
        const active = i === index;
        return (
          <div
            key={room.id}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out motion-reduce:transition-none ${
              active ? "opacity-100" : "opacity-0"
            }`}
          >
            {failed[room.id] ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <BedDouble className="h-9 w-9 opacity-60" />
                <span className="text-sm font-medium">Add {room.name} photo</span>
              </div>
            ) : (
              <img
                src={room.image}
                alt={room.name}
                onError={() => setFailed((f) => ({ ...f, [room.id]: true }))}
                // slow zoom while the slide is showing
                className={`h-full w-full object-cover transition-transform duration-[6000ms] ease-out motion-reduce:transition-none ${
                  active ? "scale-100" : "scale-110"
                }`}
              />
            )}
          </div>
        );
      })}

      {/* caption */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16">
        <div className="flex items-end justify-between gap-3">
          <div key={rooms[index].id} className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <h3 className="text-xl font-semibold text-white">{rooms[index].name}</h3>
            <p className="text-sm text-white/80">
              LKR {ROOM_PRICE_PER_DAY.toLocaleString()} per day
            </p>
          </div>
          <span className="text-xs font-medium text-white/80">
            {index + 1} / {total}
          </span>
        </div>
      </div>

      {/* arrows */}
      <button
        type="button"
        onClick={() => go(index - 1)}
        aria-label="Previous room"
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        aria-label="Next room"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* dots */}
      <div className="absolute right-4 top-4 flex gap-1.5">
        {rooms.map((room, i) => (
          <button
            key={room.id}
            type="button"
            onClick={() => go(i)}
            aria-label={`Show ${room.name}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
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
        user?.role === "customer" ? getMyNextUpcomingBooking() : Promise.resolve(null),
      ]);

      if (hallsRes.status === "fulfilled") setHalls(hallsRes.value);
      else console.error("Halls failed:", hallsRes.reason);

      if (feedbackRes.status === "fulfilled") setTestimonials(feedbackRes.value);
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
      ? halls.map((h) => ({ ...h, key: String(h.hall_id) }))
      : HALL_PLACEHOLDERS.map((_, i) => ({
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
                      <span className="font-medium text-foreground">{upcoming.booking_ref}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{upcoming.event_type}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{upcoming.hall_name}</span>
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
              <h2 className="text-2xl font-semibold text-foreground">Our Halls</h2>
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
                        src={hall.image_url || HALL_PLACEHOLDERS[i]}
                        alt={hall.hall_name ?? `Hall ${i + 1}`}
                        label={`Add Hall ${i + 1} photo`}
                        className="h-52 w-full"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-foreground">{hall.hall_name}</h3>
                      {hall.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{hall.description}</p>
                      )}
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-violet-700 dark:text-violet-400">
                        <span className="flex items-center gap-1 rounded-full bg-violet-50 dark:bg-violet-500/10 px-2.5 py-1">
                          <Users className="h-3.5 w-3.5" /> {hall.capacity} guests
                        </span>
                        {hall.floor_number !== undefined && (
                          <span className="flex items-center gap-1 rounded-full bg-violet-50 dark:bg-violet-500/10 px-2.5 py-1">
                            <MapPin className="h-3.5 w-3.5" /> Floor {hall.floor_number}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* ── Accommodation rooms ──────────────────────────── */}
            <div className="mt-14">
              <Reveal>
                <h2 className="text-2xl font-semibold text-foreground">Stay With Us</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Five rooms for your guests, LKR {ROOM_PRICE_PER_DAY.toLocaleString()} per room per day.
                </p>
              </Reveal>
              <RoomsSlideshow rooms={ROOMS} />
            </div>

            {/* ── Testimonials ─────────────────────────────────── */}
            {testimonials.length > 0 && (
              <div className="mt-14">
                <Reveal>
                  <h2 className="text-2xl font-semibold text-foreground">What Our Customers Say</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Reviews from families and organisations who celebrated with us.
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
                          <p className="mt-3 text-sm text-foreground">"{t.comment}"</p>
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
                <h2 className="text-2xl font-semibold text-foreground">Grow with Aazath Plaza</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Partner with us and put your business in front of every event we host.
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
                      <h3 className="mt-1 text-lg font-semibold text-foreground">{card.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
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
