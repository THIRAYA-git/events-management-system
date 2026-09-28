import { Link } from "react-router-dom";
import { Users, MapPin, CalendarCheck, BedDouble } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-6">
      <h1 className="text-3xl font-semibold text-gray-900">About Aazath Plaza</h1>
      <p className="mt-4 text-gray-600 leading-relaxed">
        Aazath Plaza Reception Hall has been serving the Kalmunai community since 2016,
        hosting weddings, engagements, birthday functions, political events, and school
        events. With a small, dedicated team, we've helped hundreds of families and
        organisations bring their events to life.
      </p>
      <p className="mt-4 text-gray-600 leading-relaxed">
        This booking platform was built to make that experience easier — real-time hall
        availability, transparent pricing by event type, and a straightforward way to
        reserve accommodation, order catering, and connect with event organisers and
        sponsors, all in one place.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">Two Halls, One Venue</p>
            <p className="text-sm text-gray-500">
              Hall 1 (Grand) and Hall 2 (Banquet), combined seating capacity of 1,200 guests.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <BedDouble className="mt-0.5 h-5 w-5 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">On-Site Accommodation</p>
            <p className="text-sm text-gray-500">
              5 rooms available for guests travelling from out of town.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <CalendarCheck className="mt-0.5 h-5 w-5 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">Every Kind of Event</p>
            <p className="text-sm text-gray-500">
              Weddings, engagements, birthdays, school functions, and political events.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <Users className="mt-0.5 h-5 w-5 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">A Dedicated Team</p>
            <p className="text-sm text-gray-500">
              A small on-site staff focused on making every event run smoothly.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/book"
          className="inline-block rounded-md bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
        >
          Book Your Event
        </Link>
      </div>
    </div>
  );
}