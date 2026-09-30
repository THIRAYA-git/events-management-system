import { Link } from "react-router-dom";
import { Users, MapPin, CalendarCheck, BedDouble } from "lucide-react";
import PageHero from "@/components/common/PageHero";

const FEATURES = [
  {
    icon: MapPin,
    title: "Two Halls, One Venue",
    text: "Hall 1 (Grand) and Hall 2 (Banquet), combined seating capacity of 1,200 guests.",
  },
  {
    icon: BedDouble,
    title: "On-Site Accommodation",
    text: "5 rooms available for guests travelling from out of town.",
  },
  {
    icon: CalendarCheck,
    title: "Every Kind of Event",
    text: "Weddings, engagements, birthdays, school functions, and political events.",
  },
  {
    icon: Users,
    title: "A Dedicated Team",
    text: "A small on-site staff focused on making every event run smoothly.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <PageHero
        compact
        title="About Aazath Plaza"
        subtitle="Serving the Kalmunai community since 2016."
      />

      <div className="mx-auto max-w-4xl px-4 pb-16 lg:px-6">
        <div className="relative -mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="leading-relaxed text-gray-600">
            Aazath Plaza Reception Hall has been serving the Kalmunai community since
            2016, hosting weddings, engagements, birthday functions, political events,
            and school events. With a small, dedicated team, we help families and
            organisations bring their events to life.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This booking platform was built to make that experience easier — real-time
            hall availability, transparent pricing by event type, and a straightforward
            way to reserve accommodation, order catering, and connect with event
            organisers and sponsors, all in one place.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-gray-900">{title}</p>
                <p className="mt-1 text-sm text-gray-500">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl bg-gradient-to-br from-violet-700 to-indigo-600 px-6 py-10 text-center text-white">
          <h2 className="text-xl font-semibold">Ready to plan your event?</h2>
          <p className="mt-2 text-sm text-violet-100">
            Check availability and reserve your date in a few minutes.
          </p>
          <Link
            to="/book"
            className="mt-5 inline-block rounded-md bg-white px-6 py-3 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-50"
          >
            Book Your Event
          </Link>
        </div>
      </div>
    </div>
  );
}
