import { Link } from "react-router-dom";
import { MapPin, Phone, Mail,Clock } from "lucide-react";
import Logo from "./Logo";

export default function Footer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <footer className="border-t px-6 py-3 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Aazath Plaza Reception Hall. All rights reserved.
      </footer>
    );
  }  return (
    <footer className="bg-violet-950 text-violet-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <Logo variant="lockup" tone="light" className="" />
          <p className="mt-4 max-w-xs text-sm text-violet-200">
            Two elegant halls and five guest rooms for weddings, walima functions,
            birthdays and celebrations.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-200">
            Quick links
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/book" className="hover:text-white">Book a Hall</Link></li>
            <li><Link to="/login" className="hover:text-white">Sign in</Link></li>
          </ul>
        </div>

       <div>
  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-200">
    Contact
  </h3>
  <ul className="space-y-3 text-sm">
    <li className="flex gap-2">
      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        Aazath Plaza Reception Hall, Colombo - Batticaloa Hwy (Main Rd),
        Kalmunai 32300, Sri Lanka
      </span>
    </li>
    <li className="flex gap-2">
      <Phone className="mt-0.5 h-4 w-4 shrink-0" />+94 77 307 4300
    </li>
    <li className="flex gap-2">
      <Mail className="mt-0.5 h-4 w-4 shrink-0" />admin@aazathplaza.lk
    </li>
    <li className="flex gap-2">
      <Clock className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p>Mon–Thu, Sat–Sun: 8:00 AM – 10:00 PM</p>
        <p>Friday: 2:00 PM – 11:00 PM</p>
      </div>
    </li>
  </ul>
</div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-violet-300">
        © {new Date().getFullYear()} Aazath Plaza Reception Hall. All rights reserved.
      </div>
    </footer>
  );
}