--
-- PostgreSQL database dump
--

\restrict hJf7PAD2NZCXPVjWjU2dufEE0afx2DvUzeiLOghycqwk9aF3AK3OOX83oCjyLQT

-- Dumped from database version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: booking_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.booking_status AS ENUM (
    'pending',
    'confirmed',
    'cancelled',
    'completed'
);


--
-- Name: notification_channel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_channel AS ENUM (
    'email',
    'sms',
    'both',
    'in_app'
);


--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_type AS ENUM (
    'booking_confirmation',
    'payment_receipt',
    'event_reminder',
    'catering_update',
    'cancellation',
    'general'
);


--
-- Name: order_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'confirmed',
    'preparing',
    'delivered',
    'cancelled'
);


--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_method AS ENUM (
    'credit_card',
    'debit_card',
    'mobile_wallet',
    'bank_transfer'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded'
);


--
-- Name: sponsor_request_direction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sponsor_request_direction AS ENUM (
    'customer_to_sponsor',
    'sponsor_to_customer'
);


--
-- Name: sponsor_request_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sponsor_request_status AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'withdrawn'
);


--
-- Name: sponsor_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sponsor_status AS ENUM (
    'pending',
    'active',
    'inactive'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'customer',
    'front_desk',
    'admin',
    'organizer',
    'sponsor',
    'restaurant'
);


--
-- Name: check_combined_hall_capacity(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_combined_hall_capacity() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    total_guests INT;
BEGIN
    IF NEW.status = 'cancelled' OR NEW.is_complimentary THEN
        RETURN NEW;
    END IF;

    SELECT COALESCE(SUM(b.guest_count), 0)
      INTO total_guests
      FROM hall_bookings hb
      JOIN bookings b ON b.booking_id = hb.booking_id
     WHERE hb.event_date = NEW.event_date
       AND hb.status <> 'cancelled'
       AND NOT hb.is_complimentary
       AND hb.booking_id <> NEW.booking_id;

    SELECT total_guests + b.guest_count INTO total_guests
      FROM bookings b WHERE b.booking_id = NEW.booking_id;

    IF total_guests > 1200 THEN
        RAISE EXCEPTION
            'Combined guest count (%) for % across both halls would exceed the venue-wide cap of 1200 seats.',
            total_guests, NEW.event_date;
    END IF;

    RETURN NEW;
END;
$$;


--
-- Name: generate_booking_ref(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_booking_ref() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.booking_ref := CONCAT('AP-', TO_CHAR(NOW(), 'YYYYMMDD'), '-', LPAD(NEW.booking_id::TEXT, 4, '0'));
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_log (
    log_id integer NOT NULL,
    user_id integer,
    action character varying(100) NOT NULL,
    table_name character varying(50),
    record_id integer,
    old_values jsonb,
    new_values jsonb,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_log_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_log_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_log_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_log_log_id_seq OWNED BY public.audit_log.log_id;


--
-- Name: booking_organizers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_organizers (
    id integer NOT NULL,
    booking_id integer NOT NULL,
    organizer_id integer NOT NULL,
    role_in_event character varying(100),
    agreed_fee numeric(10,2) DEFAULT 0,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    notes text,
    assigned_at timestamp without time zone DEFAULT now() NOT NULL,
    decline_reason text,
    responded_at timestamp with time zone
);


--
-- Name: booking_organizers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.booking_organizers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: booking_organizers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.booking_organizers_id_seq OWNED BY public.booking_organizers.id;


--
-- Name: booking_sponsors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_sponsors (
    id integer NOT NULL,
    booking_id integer NOT NULL,
    sponsor_id integer NOT NULL,
    proposed_amount numeric(10,2),
    message text,
    status public.sponsor_request_status DEFAULT 'pending'::public.sponsor_request_status NOT NULL,
    responded_by integer,
    responded_at timestamp without time zone,
    requested_at timestamp without time zone DEFAULT now() NOT NULL,
    direction public.sponsor_request_direction DEFAULT 'customer_to_sponsor'::public.sponsor_request_direction NOT NULL
);


--
-- Name: booking_sponsors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.booking_sponsors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: booking_sponsors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.booking_sponsors_id_seq OWNED BY public.booking_sponsors.id;


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    booking_id integer NOT NULL,
    user_id integer NOT NULL,
    booking_ref character varying(20) NOT NULL,
    event_date date NOT NULL,
    event_start_time time without time zone DEFAULT '08:00:00'::time without time zone NOT NULL,
    event_end_time time without time zone DEFAULT '22:00:00'::time without time zone NOT NULL,
    event_type character varying(80) NOT NULL,
    guest_count integer NOT NULL,
    status public.booking_status DEFAULT 'pending'::public.booking_status NOT NULL,
    base_amount numeric(10,2) DEFAULT 0 NOT NULL,
    addon_amount numeric(10,2) DEFAULT 0 NOT NULL,
    discount_amount numeric(10,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0 NOT NULL,
    total_amount numeric(10,2) DEFAULT 0 NOT NULL,
    special_requests text,
    internal_notes text,
    confirmed_by integer,
    confirmed_at timestamp without time zone,
    cancelled_at timestamp without time zone,
    cancel_reason text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    room_count integer DEFAULT 0 NOT NULL,
    custom_event_type character varying(100),
    reminder_sent_at timestamp without time zone,
    reminder_email_sent_at timestamp with time zone,
    CONSTRAINT bookings_guest_count_check CHECK ((guest_count > 0)),
    CONSTRAINT bookings_room_count_check CHECK (((room_count >= 0) AND (room_count <= 5))),
    CONSTRAINT chk_custom_event_type CHECK ((((event_type)::text <> 'Other'::text) OR ((custom_event_type IS NOT NULL) AND (length(btrim((custom_event_type)::text)) > 0))))
);


--
-- Name: bookings_booking_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bookings_booking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bookings_booking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bookings_booking_id_seq OWNED BY public.bookings.booking_id;


--
-- Name: catering_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.catering_orders (
    order_id integer NOT NULL,
    booking_id integer NOT NULL,
    menu_items jsonb DEFAULT '[]'::jsonb NOT NULL,
    total_cost numeric(10,2) DEFAULT 0 NOT NULL,
    guest_count integer DEFAULT 0 NOT NULL,
    status public.order_status DEFAULT 'pending'::public.order_status NOT NULL,
    special_notes text,
    delivery_time time without time zone,
    confirmed_at timestamp without time zone,
    delivered_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: catering_orders_order_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.catering_orders_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: catering_orders_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.catering_orders_order_id_seq OWNED BY public.catering_orders.order_id;


--
-- Name: event_pricing; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_pricing (
    event_type character varying(80) NOT NULL,
    base_price numeric(10,2) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    both_halls_price numeric(10,2),
    CONSTRAINT event_pricing_base_price_check CHECK ((base_price >= (0)::numeric))
);


--
-- Name: event_timelines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_timelines (
    timeline_id integer NOT NULL,
    booking_id integer NOT NULL,
    activity_name character varying(100) NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    assigned_to character varying(100),
    notes text,
    sequence_order integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    category character varying(20) DEFAULT 'other'::character varying NOT NULL,
    hall_id integer,
    CONSTRAINT chk_timeline_category CHECK (((category)::text = ANY (ARRAY[('setup'::character varying)::text, ('catering'::character varying)::text, ('decoration'::character varying)::text, ('cleanup'::character varying)::text, ('other'::character varying)::text])))
);


--
-- Name: event_timelines_timeline_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.event_timelines_timeline_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: event_timelines_timeline_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.event_timelines_timeline_id_seq OWNED BY public.event_timelines.timeline_id;


--
-- Name: feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feedback (
    feedback_id integer NOT NULL,
    booking_id integer,
    user_id integer NOT NULL,
    rating integer NOT NULL,
    title character varying(100),
    comment text,
    is_public boolean DEFAULT true NOT NULL,
    admin_reply text,
    replied_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    reply_read_at timestamp with time zone,
    event_name character varying(150),
    event_date date,
    hall_name character varying(100),
    CONSTRAINT feedback_event_chk CHECK (((booking_id IS NOT NULL) OR ((event_name IS NOT NULL) AND (event_date IS NOT NULL)))),
    CONSTRAINT feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: feedback_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.feedback_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: feedback_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.feedback_feedback_id_seq OWNED BY public.feedback.feedback_id;


--
-- Name: hall_bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hall_bookings (
    hall_booking_id integer NOT NULL,
    hall_id integer NOT NULL,
    booking_id integer NOT NULL,
    event_date date NOT NULL,
    event_start_time time without time zone NOT NULL,
    event_end_time time without time zone NOT NULL,
    status public.booking_status DEFAULT 'pending'::public.booking_status NOT NULL,
    assigned_by integer,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_complimentary boolean DEFAULT false NOT NULL,
    CONSTRAINT hall_bookings_check CHECK ((event_end_time > event_start_time))
);


--
-- Name: hall_bookings_hall_booking_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hall_bookings_hall_booking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hall_bookings_hall_booking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hall_bookings_hall_booking_id_seq OWNED BY public.hall_bookings.hall_booking_id;


--
-- Name: halls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.halls (
    hall_id integer NOT NULL,
    hall_name character varying(100) NOT NULL,
    floor_number integer NOT NULL,
    capacity integer NOT NULL,
    description text,
    base_price numeric(10,2) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    image_url text,
    amenities text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT halls_base_price_check CHECK ((base_price >= (0)::numeric)),
    CONSTRAINT halls_capacity_check CHECK ((capacity > 0)),
    CONSTRAINT halls_floor_number_check CHECK ((floor_number = ANY (ARRAY[1, 2])))
);


--
-- Name: halls_hall_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.halls_hall_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: halls_hall_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.halls_hall_id_seq OWNED BY public.halls.hall_id;


--
-- Name: menu_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_items (
    item_id integer NOT NULL,
    item_name character varying(100) NOT NULL,
    category character varying(50) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    unit character varying(20) DEFAULT 'per person'::character varying NOT NULL,
    image_url text,
    is_vegetarian boolean DEFAULT false NOT NULL,
    is_available boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    restaurant_id integer NOT NULL,
    CONSTRAINT menu_items_price_check CHECK ((price >= (0)::numeric))
);


--
-- Name: menu_items_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.menu_items_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: menu_items_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.menu_items_item_id_seq OWNED BY public.menu_items.item_id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    user_id integer NOT NULL,
    booking_id integer,
    type public.notification_type NOT NULL,
    channel public.notification_channel NOT NULL,
    subject character varying(200),
    message text NOT NULL,
    recipient_email character varying(150),
    recipient_phone character varying(20),
    is_sent boolean DEFAULT false NOT NULL,
    sent_at timestamp without time zone,
    error_message text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    is_read boolean DEFAULT false NOT NULL
);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- Name: organizers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizers (
    organizer_id integer NOT NULL,
    user_id integer NOT NULL,
    business_name character varying(150),
    specialty character varying(100) NOT NULL,
    experience_years integer DEFAULT 0 NOT NULL,
    portfolio_url text,
    bio text,
    service_areas text,
    price_range character varying(50),
    avg_rating numeric(3,2) DEFAULT 0.00,
    total_reviews integer DEFAULT 0 NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    is_available boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT organizers_avg_rating_check CHECK (((avg_rating >= (0)::numeric) AND (avg_rating <= (5)::numeric)))
);


--
-- Name: organizers_organizer_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organizers_organizer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organizers_organizer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organizers_organizer_id_seq OWNED BY public.organizers.organizer_id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    payment_id integer NOT NULL,
    booking_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_method public.payment_method NOT NULL,
    transaction_id character varying(100),
    payhere_order_id character varying(100),
    status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
    currency character varying(3) DEFAULT 'LKR'::character varying NOT NULL,
    invoice_url text,
    invoice_number character varying(30),
    paid_at timestamp without time zone,
    refunded_at timestamp without time zone,
    refund_reason text,
    gateway_response jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT payments_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: payments_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_payment_id_seq OWNED BY public.payments.payment_id;


--
-- Name: room_reservations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.room_reservations (
    reservation_id integer NOT NULL,
    reservation_ref character varying(30) NOT NULL,
    user_id integer NOT NULL,
    room_id integer NOT NULL,
    booking_id integer,
    check_in date NOT NULL,
    check_out date NOT NULL,
    nights integer GENERATED ALWAYS AS ((check_out - check_in)) STORED,
    guests integer DEFAULT 1 NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    status character varying(12) DEFAULT 'pending'::character varying NOT NULL,
    payment_status character varying(10) DEFAULT 'unpaid'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    group_ref character varying(30) NOT NULL,
    transaction_id character varying(50),
    payment_method character varying(30),
    paid_at timestamp with time zone,
    CONSTRAINT room_reservations_check CHECK ((check_out > check_in)),
    CONSTRAINT room_reservations_payment_status_check CHECK (((payment_status)::text = ANY (ARRAY[('unpaid'::character varying)::text, ('paid'::character varying)::text, ('refunded'::character varying)::text]))),
    CONSTRAINT room_reservations_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('confirmed'::character varying)::text, ('cancelled'::character varying)::text, ('completed'::character varying)::text])))
);


--
-- Name: room_reservations_reservation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.room_reservations_reservation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: room_reservations_reservation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.room_reservations_reservation_id_seq OWNED BY public.room_reservations.reservation_id;


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rooms (
    room_id integer NOT NULL,
    room_name character varying(50) NOT NULL,
    capacity integer DEFAULT 2 NOT NULL,
    rate_per_day numeric(10,2) DEFAULT 5000 NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: rooms_room_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rooms_room_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rooms_room_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rooms_room_id_seq OWNED BY public.rooms.room_id;


--
-- Name: sponsors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sponsors (
    sponsor_id integer NOT NULL,
    user_id integer NOT NULL,
    company_name character varying(150) NOT NULL,
    industry character varying(100),
    website_url text,
    logo_url text,
    budget_range character varying(50),
    preferred_events text,
    description text,
    status public.sponsor_status DEFAULT 'pending'::public.sponsor_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sponsors_sponsor_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sponsors_sponsor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sponsors_sponsor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sponsors_sponsor_id_seq OWNED BY public.sponsors.sponsor_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash text,
    phone character varying(20),
    role public.user_role DEFAULT 'customer'::public.user_role NOT NULL,
    profile_image text,
    is_active boolean DEFAULT true NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    login_attempts integer DEFAULT 0 NOT NULL,
    locked_until timestamp without time zone,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    refresh_token text,
    google_id character varying(255)
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: v_booked_dates; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_booked_dates AS
 SELECT event_date,
    booking_ref,
    event_type,
    guest_count,
    status
   FROM public.bookings
  WHERE (status = ANY (ARRAY['pending'::public.booking_status, 'confirmed'::public.booking_status]))
  ORDER BY event_date;


--
-- Name: v_booking_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_booking_summary AS
 SELECT b.booking_id,
    b.booking_ref,
    u.full_name AS customer_name,
    u.email AS customer_email,
    u.phone AS customer_phone,
    b.event_date,
    b.event_type,
    ep.base_price AS event_type_rate,
    b.guest_count,
    b.total_amount,
    b.status,
    py.status AS payment_status,
    b.created_at
   FROM (((public.bookings b
     JOIN public.users u ON ((b.user_id = u.user_id)))
     LEFT JOIN public.event_pricing ep ON (((ep.event_type)::text = (b.event_type)::text)))
     LEFT JOIN public.payments py ON ((py.booking_id = b.booking_id)));


--
-- Name: v_monthly_revenue; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_monthly_revenue AS
 SELECT date_trunc('month'::text, (event_date)::timestamp with time zone) AS month,
    count(booking_id) AS total_bookings,
    sum(total_amount) AS gross_revenue,
    sum(discount_amount) AS total_discounts,
    sum((total_amount - discount_amount)) AS net_revenue,
    avg(total_amount) AS avg_booking_value
   FROM public.bookings b
  WHERE (status = ANY (ARRAY['confirmed'::public.booking_status, 'completed'::public.booking_status]))
  GROUP BY (date_trunc('month'::text, (event_date)::timestamp with time zone))
  ORDER BY (date_trunc('month'::text, (event_date)::timestamp with time zone)) DESC;


--
-- Name: v_ratings_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_ratings_summary AS
 SELECT b.event_type,
    count(f.feedback_id) AS total_reviews,
    avg(f.rating) AS avg_rating,
    min(f.rating) AS min_rating,
    max(f.rating) AS max_rating
   FROM (public.feedback f
     JOIN public.bookings b ON ((f.booking_id = b.booking_id)))
  GROUP BY b.event_type
  ORDER BY (avg(f.rating)) DESC;


--
-- Name: audit_log log_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN log_id SET DEFAULT nextval('public.audit_log_log_id_seq'::regclass);


--
-- Name: booking_organizers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_organizers ALTER COLUMN id SET DEFAULT nextval('public.booking_organizers_id_seq'::regclass);


--
-- Name: booking_sponsors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_sponsors ALTER COLUMN id SET DEFAULT nextval('public.booking_sponsors_id_seq'::regclass);


--
-- Name: bookings booking_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings ALTER COLUMN booking_id SET DEFAULT nextval('public.bookings_booking_id_seq'::regclass);


--
-- Name: catering_orders order_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catering_orders ALTER COLUMN order_id SET DEFAULT nextval('public.catering_orders_order_id_seq'::regclass);


--
-- Name: event_timelines timeline_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_timelines ALTER COLUMN timeline_id SET DEFAULT nextval('public.event_timelines_timeline_id_seq'::regclass);


--
-- Name: feedback feedback_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback ALTER COLUMN feedback_id SET DEFAULT nextval('public.feedback_feedback_id_seq'::regclass);


--
-- Name: hall_bookings hall_booking_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hall_bookings ALTER COLUMN hall_booking_id SET DEFAULT nextval('public.hall_bookings_hall_booking_id_seq'::regclass);


--
-- Name: halls hall_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.halls ALTER COLUMN hall_id SET DEFAULT nextval('public.halls_hall_id_seq'::regclass);


--
-- Name: menu_items item_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items ALTER COLUMN item_id SET DEFAULT nextval('public.menu_items_item_id_seq'::regclass);


--
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- Name: organizers organizer_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizers ALTER COLUMN organizer_id SET DEFAULT nextval('public.organizers_organizer_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: payments payment_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN payment_id SET DEFAULT nextval('public.payments_payment_id_seq'::regclass);


--
-- Name: room_reservations reservation_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_reservations ALTER COLUMN reservation_id SET DEFAULT nextval('public.room_reservations_reservation_id_seq'::regclass);


--
-- Name: rooms room_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms ALTER COLUMN room_id SET DEFAULT nextval('public.rooms_room_id_seq'::regclass);


--
-- Name: sponsors sponsor_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsors ALTER COLUMN sponsor_id SET DEFAULT nextval('public.sponsors_sponsor_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_log (log_id, user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: booking_organizers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.booking_organizers (id, booking_id, organizer_id, role_in_event, agreed_fee, status, notes, assigned_at, decline_reason, responded_at) FROM stdin;
\.


--
-- Data for Name: booking_sponsors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.booking_sponsors (id, booking_id, sponsor_id, proposed_amount, message, status, responded_by, responded_at, requested_at, direction) FROM stdin;
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bookings (booking_id, user_id, booking_ref, event_date, event_start_time, event_end_time, event_type, guest_count, status, base_amount, addon_amount, discount_amount, tax_amount, total_amount, special_requests, internal_notes, confirmed_by, confirmed_at, cancelled_at, cancel_reason, created_at, updated_at, room_count, custom_event_type, reminder_sent_at, reminder_email_sent_at) FROM stdin;
\.


--
-- Data for Name: catering_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.catering_orders (order_id, booking_id, menu_items, total_cost, guest_count, status, special_notes, delivery_time, confirmed_at, delivered_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: event_pricing; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_pricing (event_type, base_price, description, is_active, created_at, updated_at, both_halls_price) FROM stdin;
School Event	20000.00	School functions and academic events	t	2026-06-20 17:31:57.906536	2026-06-20 17:31:57.906536	\N
Political Event	30000.00	Standard political event	t	2026-06-20 17:31:57.906536	2026-06-20 17:31:57.906536	\N
Political Event (Large)	35000.00	Political event exceeding standard scale/duration	t	2026-06-20 17:31:57.906536	2026-06-20 17:31:57.906536	\N
Birthday Function	60000.00	Birthday celebrations	t	2026-06-20 17:31:57.906536	2026-06-20 17:31:57.906536	\N
Wedding Function	40000.00	Wedding functions	t	2026-06-20 17:31:57.906536	2026-06-20 17:31:57.906536	\N
Other	30000.00	Any event type not listed - customer types their own	t	2026-09-29 07:56:53.649856	2026-09-29 07:56:53.649856	\N
Walima Event	40000.00	Walima ceremony - LKR 40,000 single hall, LKR 60,000 both halls	t	2026-10-20 01:03:05.43868	2026-10-20 01:03:05.43868	60000.00
\.


--
-- Data for Name: event_timelines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_timelines (timeline_id, booking_id, activity_name, start_time, end_time, assigned_to, notes, sequence_order, created_at, category, hall_id) FROM stdin;
\.


--
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.feedback (feedback_id, booking_id, user_id, rating, title, comment, is_public, admin_reply, replied_at, created_at, reply_read_at, event_name, event_date, hall_name) FROM stdin;
\.


--
-- Data for Name: hall_bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hall_bookings (hall_booking_id, hall_id, booking_id, event_date, event_start_time, event_end_time, status, assigned_by, notes, created_at, updated_at, is_complimentary) FROM stdin;
\.


--
-- Data for Name: halls; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.halls (hall_id, hall_name, floor_number, capacity, description, base_price, is_active, image_url, amenities, created_at, updated_at) FROM stdin;
5	Hall 1 - Grand	1	600	Main hall with stage and A/C	0.00	t	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790436883/aazath-plaza/halls/aqui8yug9e37loxxalof.jpg	["A/C","Stage","Projector"]	2026-06-20 17:02:49.488621	2026-09-26 15:34:46.637027
6	Hall 2 - Banquet	2	600	Banquet hall with garden view	0.00	t	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790515857/aazath-plaza/halls/mzqyk2lszhwmzkc28row.jpg	["A/C","Garden View"]	2026-06-20 17:02:49.488621	2026-09-27 13:31:00.582437
\.


--
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.menu_items (item_id, item_name, category, description, price, unit, image_url, is_vegetarian, is_available, created_at, restaurant_id) FROM stdin;
3	Mutton Biriyani	Main Course	Slow-cooked mutton biriyani with saffron rice and mint raita	550.00	per person	\N	f	t	2026-05-29 11:33:59.461172	13
4	Vegetable Biriyani	Main Course	Mixed vegetable biriyani with coconut chutney	350.00	per person	\N	t	t	2026-05-29 11:33:59.461172	13
5	Kottu Roti (Chicken)	Main Course	Sri Lankan street-style chicken kottu with egg	400.00	per person	\N	f	t	2026-05-29 11:33:59.461172	13
14	Soft Drinks Pack	Beverages	Assorted carbonated soft drinks	80.00	per person	\N	t	t	2026-05-29 11:33:59.461172	13
18	Birthday Cake (2kg)	Cakes	Custom 2kg photo/theme birthday cake	6500.00	per cake	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790771375/aazath-plaza/menu/cir3fjhk0rthwsioqgap.jpg	t	t	2026-05-29 11:33:59.461172	13
11	Fruit Salad	Desserts	Fresh seasonal tropical fruit salad	150.00	per person	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790771584/aazath-plaza/menu/cixrsfagnroykri3r5xo.jpg	t	t	2026-05-29 11:33:59.461172	13
19	Engagement Cake (1.5kg)	Cakes	Elegant 1.5kg engagement cake with ring design	5500.00	per cake	\N	t	t	2026-05-29 11:33:59.461172	13
12	Ice Cream (3 scoops)	Desserts	Assorted flavours - vanilla, chocolate, strawberry	180.00	per person	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790771619/aazath-plaza/menu/oyvehk2mk7fxilaysosf.jpg	t	t	2026-05-29 11:33:59.461172	13
2	Chicken Biriyani	Main Course	Fragrant basmati rice with spiced chicken, raita and salad	450.00	per person	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790771790/aazath-plaza/menu/i0rprv7wzuzmbfedigpw.jpg	f	t	2026-05-29 11:33:59.461172	13
20	Chicken Biryani	Main Course	\N	475.00	per plate	\N	f	t	2026-09-08 02:30:53.653548	13
6	Fried Rice with Chicken	Main Course	Chinese-style fried rice with chicken and vegetables	380.00	per person	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790771917/aazath-plaza/menu/fbkwkahcxj1rn2hnzlsc.jpg	f	t	2026-05-29 11:33:59.461172	13
22	Pol Rotti with Lunu Miris	Starters & Snacks	Traditional Sri Lankan coconut flatbread served with a spicy, tangy onion and chili sambal.	450.00	per person	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790412393/aazath-plaza/menu/v2iyyvhdbulxkpw4pl1c.jpg	t	t	2026-09-26 08:42:10.63676	13
16	Faluda	Beverages	Traditional Sri Lankan rose milk faluda	120.00	per person	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790770989/aazath-plaza/menu/qmojcawl4narg0kemsch.jpg	t	t	2026-05-29 11:33:59.461172	13
15	Fresh Juice Bar	Beverages	Fresh fruit juice counter - mango, orange, watermelon, wood apple	150.00	per person	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790771135/aazath-plaza/menu/bvptqgvyzlgcaknxqkez.jpg	t	t	2026-05-29 11:33:59.461172	13
1	Rice and Curry (Full Meal)	Main Course	Traditional Sri Lankan rice and curry with 5 curries, papadum and pickle	350.00	per person	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790772010/aazath-plaza/menu/zomgk8cu8ihwq6cwhygk.jpg	f	t	2026-05-29 11:33:59.461172	13
9	Bruschetta	Starters	Toasted bread with tomato, garlic and basil topping	180.00	per person	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790772103/aazath-plaza/menu/gube4jnryu6vq1svw5uw.jpg	t	t	2026-05-29 11:33:59.461172	13
7	Short Eats Platter	Starters	Assorted short eats - rolls, puffs, cutlets (10 pieces)	250.00	per person	https://res.cloudinary.com/h0f2gpu1/image/upload/v1791987227/aazath-plaza/menu/lomsqvxsxksguhuljp3o.jpg	f	t	2026-05-29 11:33:59.461172	13
8	Samosa Platter	Starters	Crispy vegetable and chicken samosas (8 pieces)	200.00	per person	https://res.cloudinary.com/h0f2gpu1/image/upload/v1791987250/aazath-plaza/menu/zvym34cpboptcafwrnh4.jpg	f	t	2026-05-29 11:33:59.461172	13
17	Wedding Cake (3-tier)	Cakes	Custom 3-tier fondant wedding cake with floral design	15000.00	per cake	https://res.cloudinary.com/h0f2gpu1/image/upload/v1792011690/aazath-plaza/menu/lyqqs50v3u5aitqd7cix.jpg	t	t	2026-05-29 11:33:59.461172	13
13	Chocolate Fountain	Desserts	Chocolate fountain with fresh fruits and marshmallows	350.00	per person	https://res.cloudinary.com/h0f2gpu1/image/upload/v1792011776/aazath-plaza/menu/sgxuhq3zpbmkir62u29w.jpg	t	t	2026-05-29 11:33:59.461172	13
10	Watalappan	Desserts	Traditional Sri Lankan coconut custard pudding with jaggery	120.00	per person	https://res.cloudinary.com/h0f2gpu1/image/upload/v1792011882/aazath-plaza/menu/g6o9pkb2hmdgcvp31fqy.jpg	t	t	2026-05-29 11:33:59.461172	13
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (notification_id, user_id, booking_id, type, channel, subject, message, recipient_email, recipient_phone, is_sent, sent_at, error_message, created_at, is_read) FROM stdin;
\.


--
-- Data for Name: organizers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organizers (organizer_id, user_id, business_name, specialty, experience_years, portfolio_url, bio, service_areas, price_range, avg_rating, total_reviews, is_verified, is_available, created_at, updated_at) FROM stdin;
1	9	Riyaz Events & Decorations	Wedding & Reception Decoration	8	https://riyazevents.lk	Specialising in traditional Sri Lankan and modern wedding decorations. Over 500 successful events.	\N	LKR 25,000 - 80,000	4.80	45	t	t	2026-05-29 11:34:23.064997	2026-05-29 11:34:23.064997
2	10	Fathima Floral Designs	Floral Arrangements & Stage Setup	5	https://fathimaflorals.lk	Expert in fresh floral arrangements, stage backdrops and table centrepieces for all occasions.		LKR 15,000 - 50,000	4.60	28	t	t	2026-05-29 11:34:23.064997	2026-10-12 10:22:22.107063
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_tokens (id, user_id, token, expires_at, used_at, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (payment_id, booking_id, amount, payment_method, transaction_id, payhere_order_id, status, currency, invoice_url, invoice_number, paid_at, refunded_at, refund_reason, gateway_response, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: room_reservations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.room_reservations (reservation_id, reservation_ref, user_id, room_id, booking_id, check_in, check_out, guests, total_amount, status, payment_status, created_at, group_ref, transaction_id, payment_method, paid_at) FROM stdin;
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rooms (room_id, room_name, capacity, rate_per_day, is_active) FROM stdin;
1	Room 1	2	5000.00	t
2	Room 2	2	5000.00	t
3	Room 3	2	5000.00	t
4	Room 4	2	5000.00	t
5	Room 5	2	5000.00	t
\.


--
-- Data for Name: sponsors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sponsors (sponsor_id, user_id, company_name, industry, website_url, logo_url, budget_range, preferred_events, description, status, created_at, updated_at) FROM stdin;
2	12	Zam Zam Jewellery	Jewellery & Gold	https://zamzamjewel.lk	\N	LKR 30,000 - 150,000	weddings, engagements, valima	Premium gold and diamond jewellery. Official sponsor for wedding and engagement events.	active	2026-05-29 11:34:42.014059	2026-05-29 11:34:42.014059
1	11	Akbar Traders	Retail & Trading	https://akbartraders.lk	https://res.cloudinary.com/h0f2gpu1/image/upload/v1791363798/aazath-plaza/sponsors/ircgksjkfg8tmcykhg5b.png	LKR 50,000 - 200,000	weddings, corporate events, cultural events	Leading retail and trading company in the Eastern Province. Proud to sponsor community events.	active	2026-05-29 11:34:42.014059	2026-10-07 09:03:19.261615
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (user_id, full_name, email, password_hash, phone, role, profile_image, is_active, is_verified, login_attempts, locked_until, last_login, created_at, updated_at, refresh_token, google_id) FROM stdin;
18	Reg-Testing	testreg@gmail.com	$2b$12$ZnnpLGQ0KH8FKpp7li4LBux7z9uQFHUOMt/PKk.kWhn50Rve/6yNa	\N	customer	\N	t	f	0	\N	\N	2026-09-20 16:57:27.453297	2026-09-20 16:57:27.453297	\N	\N
5	Fathima Zahira	zahira@gmail.com	$2b$12$f2dz2n//8UahdWaUERAzOOj6Snt72qvDiS1erRJ/ycCKsO2EAjoG2	+94775678901	customer	\N	t	t	0	\N	\N	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	\N
7	Nusaibah Farhan	nusaibah@gmail.com	$2b$12$f2dz2n//8UahdWaUERAzOOj6Snt72qvDiS1erRJ/ycCKsO2EAjoG2	+94777890123	customer	\N	t	t	0	\N	\N	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	\N
8	Hassan Mueen	mueen@gmail.com	$2b$12$f2dz2n//8UahdWaUERAzOOj6Snt72qvDiS1erRJ/ycCKsO2EAjoG2	+94778901234	customer	\N	t	t	0	\N	\N	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	\N
12	Zam Zam Jewellery	sponsor@zamzam.lk	$2b$12$f2dz2n//8UahdWaUERAzOOj6Snt72qvDiS1erRJ/ycCKsO2EAjoG2	+94772233445	sponsor	\N	t	t	0	\N	\N	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	\N
9	Riyaz Events	riyaz@events.lk	$2b$10$HCcCJ92/kc8vgN/oHiZF0.GB8YdLbXfmw9QuYlrScGmyeFntYAa.m	+94779012345	organizer	\N	t	t	0	\N	\N	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	\N
13	Althab Restaurant	althab@restaurant.lk	$2b$10$XgDWZqBupT36otT7lihy3ulPsR4w446k8PYz34vmJC40ga85AphRq	+94773344556	restaurant	\N	t	t	0	\N	2026-10-17 21:27:45.799104	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	\N
11	Akbar Traders	sponsor@akbartraders.lk	$2b$10$VcFaS4ntaiBC3mTTTkydd.eOKHHSl4qmJkqgOKUv7DHqVle4G.3D.	+94771122334	sponsor	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790246829/aazath-plaza/users/ymvji7m0cs3gkklvec1o.jpg	t	t	0	\N	2026-10-19 19:13:19.451435	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	\N
19	Test Staff	teststaff@aazathplaza.lk	$2b$12$3nbYD0/N0joQUWeZ18ELsucnwwU67PcHkQidj6J7xv3qoFWpLOg/e	+94771110548	front_desk	\N	t	t	0	\N	\N	2026-10-01 03:54:40.730822	2026-10-19 18:58:40.17755	\N	\N
3	Front Desk Staff	staff@aazathplaza.lk	$2b$10$8oX2gTYptOLytLU2qdJ1ZOBwzSalKFU3I56PEQZkRk/30ePjZXc0C	+94773456789	front_desk	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790230739/aazath-plaza/users/o7dzl90rmogagflkifuk.jpg	t	t	0	\N	2026-10-20 00:31:26.193636	2026-05-29 11:33:11.576052	2026-10-17 10:42:11.09157	\N	\N
6	Customer	thirayafathima@gmail.com	$2b$12$vRZ1VihjBdKmZzyx0wRG6.Y7hnPo80ko9qfgv8NZo/v3Il9TiErAi	+94779972423	customer	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790226950/aazath-plaza/users/ar2ivkqriftzlegeyui4.jpg	t	t	0	\N	2026-10-18 23:17:41.386872	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	103468752940350229146
10	Fathima Decorations	fathima@decorations.lk	$2b$10$HCcCJ92/kc8vgN/oHiZF0.GB8YdLbXfmw9QuYlrScGmyeFntYAa.m	+94770123456	organizer	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790244997/aazath-plaza/users/uvtrqqkfgttt05oo8d4w.jpg	t	t	1	\N	2026-10-14 21:07:30.019097	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	\N
17	Test Customer	test@example.com	$2b$12$VizevEqJu/5rBaPKh3p6l.urgJR7nMDhdvdteNMl2/BOQ.mrhKXKG	0771234567	customer	\N	t	f	0	\N	2026-10-20 13:34:10.30053	2026-06-21 16:38:06.436496	2026-06-21 16:38:06.436496	\N	\N
4	Mohamed Rifkan	rifkan@gmail.com	$2b$10$hkX8RXCux/qYsPyooMI5cu5j1k1sOKisFhzLDhNWjvYWdkXwF0gOW	+94774567890	customer	\N	t	t	0	\N	2026-09-08 08:30:33.91102	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	\N
1	Admin	admin@aazathplaza.lk	$2b$10$94tFbhA/jeRcYr7KYy4FnuqqxEoYKmNSOyYhO8Ec3O5D2hHHCIDHq	+94771234567	admin	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790196116/aazath-plaza/users/qunvcvxidbwo2bnxq6um.jpg	t	t	0	\N	2026-10-20 14:45:31.244087	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	\N
\.


--
-- Name: audit_log_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_log_log_id_seq', 1, false);


--
-- Name: booking_organizers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.booking_organizers_id_seq', 1, false);


--
-- Name: booking_sponsors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.booking_sponsors_id_seq', 1, false);


--
-- Name: bookings_booking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bookings_booking_id_seq', 1, false);


--
-- Name: catering_orders_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.catering_orders_order_id_seq', 1, false);


--
-- Name: event_timelines_timeline_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.event_timelines_timeline_id_seq', 1, false);


--
-- Name: feedback_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.feedback_feedback_id_seq', 1, false);


--
-- Name: hall_bookings_hall_booking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hall_bookings_hall_booking_id_seq', 1, false);


--
-- Name: halls_hall_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.halls_hall_id_seq', 6, true);


--
-- Name: menu_items_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.menu_items_item_id_seq', 22, true);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 1, false);


--
-- Name: organizers_organizer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.organizers_organizer_id_seq', 4, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, false);


--
-- Name: payments_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payments_payment_id_seq', 1, false);


--
-- Name: room_reservations_reservation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.room_reservations_reservation_id_seq', 1, false);


--
-- Name: rooms_room_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rooms_room_id_seq', 5, true);


--
-- Name: sponsors_sponsor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sponsors_sponsor_id_seq', 4, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_user_id_seq', 26, true);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (log_id);


--
-- Name: booking_organizers booking_organizers_booking_id_organizer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_organizers
    ADD CONSTRAINT booking_organizers_booking_id_organizer_id_key UNIQUE (booking_id, organizer_id);


--
-- Name: booking_organizers booking_organizers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_organizers
    ADD CONSTRAINT booking_organizers_pkey PRIMARY KEY (id);


--
-- Name: booking_sponsors booking_sponsors_booking_id_sponsor_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_sponsors
    ADD CONSTRAINT booking_sponsors_booking_id_sponsor_id_key UNIQUE (booking_id, sponsor_id);


--
-- Name: booking_sponsors booking_sponsors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_sponsors
    ADD CONSTRAINT booking_sponsors_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_booking_ref_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_booking_ref_key UNIQUE (booking_ref);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (booking_id);


--
-- Name: catering_orders catering_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catering_orders
    ADD CONSTRAINT catering_orders_pkey PRIMARY KEY (order_id);


--
-- Name: event_pricing event_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_pricing
    ADD CONSTRAINT event_pricing_pkey PRIMARY KEY (event_type);


--
-- Name: event_timelines event_timelines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_timelines
    ADD CONSTRAINT event_timelines_pkey PRIMARY KEY (timeline_id);


--
-- Name: feedback feedback_booking_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_booking_id_key UNIQUE (booking_id);


--
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (feedback_id);


--
-- Name: hall_bookings hall_bookings_booking_hall_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hall_bookings
    ADD CONSTRAINT hall_bookings_booking_hall_key UNIQUE (booking_id, hall_id);


--
-- Name: hall_bookings hall_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hall_bookings
    ADD CONSTRAINT hall_bookings_pkey PRIMARY KEY (hall_booking_id);


--
-- Name: halls halls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.halls
    ADD CONSTRAINT halls_pkey PRIMARY KEY (hall_id);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (item_id);


--
-- Name: room_reservations no_room_overlap; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_reservations
    ADD CONSTRAINT no_room_overlap EXCLUDE USING gist (room_id WITH =, daterange(check_in, check_out) WITH &&) WHERE (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('confirmed'::character varying)::text])));


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: organizers organizers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizers
    ADD CONSTRAINT organizers_pkey PRIMARY KEY (organizer_id);


--
-- Name: organizers organizers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizers
    ADD CONSTRAINT organizers_user_id_key UNIQUE (user_id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


--
-- Name: payments payments_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_number_key UNIQUE (invoice_number);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (payment_id);


--
-- Name: payments payments_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_transaction_id_key UNIQUE (transaction_id);


--
-- Name: room_reservations room_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_reservations
    ADD CONSTRAINT room_reservations_pkey PRIMARY KEY (reservation_id);


--
-- Name: room_reservations room_reservations_reservation_ref_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_reservations
    ADD CONSTRAINT room_reservations_reservation_ref_key UNIQUE (reservation_ref);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (room_id);


--
-- Name: rooms rooms_room_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_room_name_key UNIQUE (room_name);


--
-- Name: sponsors sponsors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_pkey PRIMARY KEY (sponsor_id);


--
-- Name: sponsors sponsors_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_user_id_key UNIQUE (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: idx_audit_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_action ON public.audit_log USING btree (action);


--
-- Name: idx_audit_log_table_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_log_table_name ON public.audit_log USING btree (table_name);


--
-- Name: idx_audit_log_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_log_user_id ON public.audit_log USING btree (user_id);


--
-- Name: idx_audit_table; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_table ON public.audit_log USING btree (table_name);


--
-- Name: idx_audit_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_user ON public.audit_log USING btree (user_id);


--
-- Name: idx_bookings_booking_ref; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_booking_ref ON public.bookings USING btree (booking_ref);


--
-- Name: idx_bookings_event_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_event_date ON public.bookings USING btree (event_date);


--
-- Name: idx_bookings_ref; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_ref ON public.bookings USING btree (booking_ref);


--
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);


--
-- Name: idx_bookings_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_user_id ON public.bookings USING btree (user_id);


--
-- Name: idx_catering_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_catering_booking ON public.catering_orders USING btree (booking_id);


--
-- Name: idx_catering_orders_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_catering_orders_booking_id ON public.catering_orders USING btree (booking_id);


--
-- Name: idx_catering_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_catering_status ON public.catering_orders USING btree (status);


--
-- Name: idx_event_timelines_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_timelines_booking_id ON public.event_timelines USING btree (booking_id);


--
-- Name: idx_event_timelines_hall_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_timelines_hall_id ON public.event_timelines USING btree (hall_id);


--
-- Name: idx_event_timelines_sequence_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_timelines_sequence_order ON public.event_timelines USING btree (sequence_order);


--
-- Name: idx_event_timelines_start_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_timelines_start_time ON public.event_timelines USING btree (start_time);


--
-- Name: idx_feedback_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feedback_booking ON public.feedback USING btree (booking_id);


--
-- Name: idx_feedback_rating; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feedback_rating ON public.feedback USING btree (rating);


--
-- Name: idx_hall_bookings_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hall_bookings_booking ON public.hall_bookings USING btree (booking_id);


--
-- Name: idx_hall_bookings_hall_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hall_bookings_hall_date ON public.hall_bookings USING btree (hall_id, event_date);


--
-- Name: idx_hall_bookings_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hall_bookings_status ON public.hall_bookings USING btree (status);


--
-- Name: idx_hb_one_complimentary_per_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_hb_one_complimentary_per_booking ON public.hall_bookings USING btree (booking_id) WHERE is_complimentary;


--
-- Name: idx_hb_one_primary_per_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_hb_one_primary_per_booking ON public.hall_bookings USING btree (booking_id) WHERE (NOT is_complimentary);


--
-- Name: idx_menu_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menu_category ON public.menu_items USING btree (category);


--
-- Name: idx_no_double_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_no_double_booking ON public.bookings USING btree (event_date) WHERE (status = 'confirmed'::public.booking_status);


--
-- Name: INDEX idx_no_double_booking; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_no_double_booking IS 'BR-01: one confirmed event per date across both halls';


--
-- Name: idx_notif_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notif_booking ON public.notifications USING btree (booking_id);


--
-- Name: idx_notif_sent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notif_sent ON public.notifications USING btree (is_sent);


--
-- Name: idx_notifications_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_created ON public.notifications USING btree (user_id, created_at DESC);


--
-- Name: idx_organizers_spec; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_organizers_spec ON public.organizers USING btree (specialty);


--
-- Name: idx_organizers_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_organizers_user ON public.organizers USING btree (user_id);


--
-- Name: idx_payments_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_booking_id ON public.payments USING btree (booking_id);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- Name: idx_payments_transaction; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_transaction ON public.payments USING btree (transaction_id);


--
-- Name: idx_room_res_group; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_room_res_group ON public.room_reservations USING btree (group_ref);


--
-- Name: idx_room_res_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_room_res_user ON public.room_reservations USING btree (user_id);


--
-- Name: idx_sponsors_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sponsors_status ON public.sponsors USING btree (status);


--
-- Name: idx_sponsors_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sponsors_user ON public.sponsors USING btree (user_id);


--
-- Name: idx_timeline_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timeline_booking ON public.event_timelines USING btree (booking_id);


--
-- Name: idx_users_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_active ON public.users USING btree (is_active);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: uq_audit_payment; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_audit_payment ON public.audit_log USING btree (((new_values ->> 'payment_ref'::text)), ((new_values ->> 'status_code'::text))) WHERE (((action)::text ~~ 'PAYMENT_%'::text) AND ((action)::text <> 'PAYMENT_SIG_INVALID'::text));


--
-- Name: bookings trg_booking_ref; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_booking_ref BEFORE INSERT ON public.bookings FOR EACH ROW WHEN (((new.booking_ref IS NULL) OR ((new.booking_ref)::text = ''::text))) EXECUTE FUNCTION public.generate_booking_ref();


--
-- Name: bookings trg_bookings_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: catering_orders trg_catering_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_catering_updated BEFORE UPDATE ON public.catering_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: event_pricing trg_event_pricing_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_event_pricing_updated BEFORE UPDATE ON public.event_pricing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: hall_bookings trg_hall_bookings_capacity_cap; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_hall_bookings_capacity_cap BEFORE INSERT OR UPDATE ON public.hall_bookings FOR EACH ROW EXECUTE FUNCTION public.check_combined_hall_capacity();


--
-- Name: hall_bookings trg_hall_bookings_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_hall_bookings_updated BEFORE UPDATE ON public.hall_bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: organizers trg_organizers_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_organizers_updated BEFORE UPDATE ON public.organizers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: payments trg_payments_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: sponsors trg_sponsors_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sponsors_updated BEFORE UPDATE ON public.sponsors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: audit_log audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: booking_organizers booking_organizers_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_organizers
    ADD CONSTRAINT booking_organizers_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id) ON DELETE CASCADE;


--
-- Name: booking_organizers booking_organizers_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_organizers
    ADD CONSTRAINT booking_organizers_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.organizers(organizer_id) ON DELETE CASCADE;


--
-- Name: booking_sponsors booking_sponsors_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_sponsors
    ADD CONSTRAINT booking_sponsors_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id);


--
-- Name: booking_sponsors booking_sponsors_responded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_sponsors
    ADD CONSTRAINT booking_sponsors_responded_by_fkey FOREIGN KEY (responded_by) REFERENCES public.users(user_id);


--
-- Name: booking_sponsors booking_sponsors_sponsor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_sponsors
    ADD CONSTRAINT booking_sponsors_sponsor_id_fkey FOREIGN KEY (sponsor_id) REFERENCES public.sponsors(sponsor_id);


--
-- Name: bookings bookings_confirmed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_confirmed_by_fkey FOREIGN KEY (confirmed_by) REFERENCES public.users(user_id);


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE RESTRICT;


--
-- Name: catering_orders catering_orders_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catering_orders
    ADD CONSTRAINT catering_orders_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id) ON DELETE RESTRICT;


--
-- Name: event_timelines event_timelines_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_timelines
    ADD CONSTRAINT event_timelines_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id) ON DELETE CASCADE;


--
-- Name: event_timelines event_timelines_hall_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_timelines
    ADD CONSTRAINT event_timelines_hall_id_fkey FOREIGN KEY (hall_id) REFERENCES public.halls(hall_id) ON DELETE SET NULL;


--
-- Name: feedback feedback_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id) ON DELETE CASCADE;


--
-- Name: feedback feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: bookings fk_bookings_event_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_bookings_event_type FOREIGN KEY (event_type) REFERENCES public.event_pricing(event_type) ON UPDATE CASCADE;


--
-- Name: hall_bookings hall_bookings_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hall_bookings
    ADD CONSTRAINT hall_bookings_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: hall_bookings hall_bookings_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hall_bookings
    ADD CONSTRAINT hall_bookings_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id) ON DELETE CASCADE;


--
-- Name: hall_bookings hall_bookings_hall_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hall_bookings
    ADD CONSTRAINT hall_bookings_hall_id_fkey FOREIGN KEY (hall_id) REFERENCES public.halls(hall_id) ON DELETE RESTRICT;


--
-- Name: menu_items menu_items_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.users(user_id);


--
-- Name: notifications notifications_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: organizers organizers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizers
    ADD CONSTRAINT organizers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: payments payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id) ON DELETE RESTRICT;


--
-- Name: room_reservations room_reservations_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_reservations
    ADD CONSTRAINT room_reservations_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id);


--
-- Name: room_reservations room_reservations_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_reservations
    ADD CONSTRAINT room_reservations_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id);


--
-- Name: room_reservations room_reservations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_reservations
    ADD CONSTRAINT room_reservations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: sponsors sponsors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict hJf7PAD2NZCXPVjWjU2dufEE0afx2DvUzeiLOghycqwk9aF3AK3OOX83oCjyLQT

