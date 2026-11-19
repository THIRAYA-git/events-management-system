import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import PageHero from "@/components/common/PageHero";
import { useAuth } from "@/context/AuthContext";
import {
  errorTextClass,
  fieldInputClass,
  fieldLabelClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/booking/bookingStyles";
import { CONTACT_TOPICS, sendContactMessage } from "@/lib/contact.api";

const CONTACT = {
  phone: "+94 77 123 4567",
  email: "admin@aazathplaza.lk",
  addressLines: ["Colombo - Batticaloa Hwy", "Kalmunai 32300", "Sri Lanka"],
  hours: "Events run 8:00 AM – 10:00 PM",
};

const MAP_QUERY = encodeURIComponent("Aazath Plaza Reception Hall, Kalmunai, Sri Lanka");

const CARD = "rounded-2xl border border-border! bg-card shadow-sm";
const MAX_MESSAGE = 2000;

function InfoRow({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Phone;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${CARD} flex items-start gap-4 p-5`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 text-sm">
        <p className="font-semibold text-foreground">{title}</p>
        <div className="mt-1 text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState<string>(CONTACT_TOPICS[0]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (message.trim().length < 10) {
      return setError("Please write a message of at least 10 characters.");
    }
    setIsSending(true);
    try {
      await sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: subject as (typeof CONTACT_TOPICS)[number],
        message: message.trim(),
      });
      setSent(true);
    } catch (err: any) {
      const data = err?.response?.data;
      setError(
        data?.errors?.[0]?.message ||
          data?.message ||
          "We couldn't send your message. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  const reset = () => {
    setMessage("");
    setSent(false);
    setError(null);
  };

  return (
    <div>
      <PageHero
        compact
        title="Contact us"
        subtitle="Questions about a date, catering or accommodation? We're happy to help."
      />

      <div className="mx-auto max-w-5xl px-4 pb-16 lg:px-6">
        <div className="relative -mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Contact details */}
          <div className="space-y-4 lg:col-span-2">
            <InfoRow icon={Phone} title="Call us">
              <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="hover:text-violet-700">
                {CONTACT.phone}
              </a>
            </InfoRow>
            <InfoRow icon={Mail} title="Email">
              <a href={`mailto:${CONTACT.email}`} className="break-all hover:text-violet-700">
                {CONTACT.email}
              </a>
            </InfoRow>
            <InfoRow icon={MapPin} title="Visit us">
              {CONTACT.addressLines.map((l) => (
                <p key={l}>{l}</p>
              ))}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block font-medium text-violet-700 dark:text-violet-400 hover:underline"
              >
                Get directions →
              </a>
            </InfoRow>
            <InfoRow icon={Clock} title="Hours">
              <p>{CONTACT.hours}</p>
              <p className="text-xs text-muted-foreground">Sri Lanka Standard Time</p>
            </InfoRow>
          </div>

          {/* Message form */}
          <section className={`${CARD} p-6 sm:p-8 lg:col-span-3`}>
            {sent ? (
              <div className="py-8 text-center" role="status">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 ring-8 ring-green-100 dark:ring-green-500/30">
                  <CheckCircle2 className="h-8 w-8" />
                </span>
                <h2 className="mt-5 text-xl font-semibold text-foreground">Message sent</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                  Thank you, {name.split(" ")[0] || "there"}. Our team will reply to {email} as soon
                  as possible.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                  <button onClick={reset} className={secondaryBtnClass}>
                    Send another message
                  </button>
                  <Link to="/book" className={primaryBtnClass}>
                    Book a hall
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Send us a message</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We'll reply to the email address below.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c_name" className={fieldLabelClass}>
                      Your name
                    </label>
                    <input
                      id="c_name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      maxLength={100}
                      autoComplete="name"
                      className={fieldInputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="c_email" className={fieldLabelClass}>
                      Email
                    </label>
                    <input
                      id="c_email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className={fieldInputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="c_phone" className={fieldLabelClass}>
                      Phone <span className="font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <input
                      id="c_phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      placeholder="+94 77 123 4567"
                      className={fieldInputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="c_subject" className={fieldLabelClass}>
                      Topic
                    </label>
                    <select
                      id="c_subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={fieldInputClass}
                    >
                      {CONTACT_TOPICS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="c_message" className={fieldLabelClass}>
                    Message
                  </label>
                  <textarea
                    id="c_message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
                    rows={6}
                    required
                    placeholder="Tell us about your event, preferred date or question…"
                    className={fieldInputClass}
                  />
                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    {message.length}/{MAX_MESSAGE}
                  </p>
                </div>

                {error && <p className={errorTextClass}>{error}</p>}

                <button type="submit" disabled={isSending} className={`${primaryBtnClass} w-full gap-2`}>
                  <Send className="h-4 w-4" />
                  {isSending ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </section>
        </div>

        {/* Map */}
        <div className={`${CARD} mt-6 overflow-hidden`}>
          <iframe
            title="Aazath Plaza location"
            src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-72 w-full border-0"
          />
        </div>
      </div>
    </div>
  );
}