--
-- PostgreSQL database dump
--

\restrict e0IQh0fCgPz91EPzm4mBu2d4qWKNUfa1Us0fMACE9Up5vFzsJOuZz1TQFnIiuyX

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.sponsors DROP CONSTRAINT IF EXISTS sponsors_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.room_reservations DROP CONSTRAINT IF EXISTS room_reservations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.room_reservations DROP CONSTRAINT IF EXISTS room_reservations_room_id_fkey;
ALTER TABLE IF EXISTS ONLY public.room_reservations DROP CONSTRAINT IF EXISTS room_reservations_booking_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_booking_id_fkey;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.organizers DROP CONSTRAINT IF EXISTS organizers_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_booking_id_fkey;
ALTER TABLE IF EXISTS ONLY public.menu_items DROP CONSTRAINT IF EXISTS menu_items_restaurant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.hall_bookings DROP CONSTRAINT IF EXISTS hall_bookings_hall_id_fkey;
ALTER TABLE IF EXISTS ONLY public.hall_bookings DROP CONSTRAINT IF EXISTS hall_bookings_booking_id_fkey;
ALTER TABLE IF EXISTS ONLY public.hall_bookings DROP CONSTRAINT IF EXISTS hall_bookings_assigned_by_fkey;
ALTER TABLE IF EXISTS ONLY public.bookings DROP CONSTRAINT IF EXISTS fk_bookings_event_type;
ALTER TABLE IF EXISTS ONLY public.feedback DROP CONSTRAINT IF EXISTS feedback_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.feedback DROP CONSTRAINT IF EXISTS feedback_booking_id_fkey;
ALTER TABLE IF EXISTS ONLY public.event_timelines DROP CONSTRAINT IF EXISTS event_timelines_hall_id_fkey;
ALTER TABLE IF EXISTS ONLY public.event_timelines DROP CONSTRAINT IF EXISTS event_timelines_booking_id_fkey;
ALTER TABLE IF EXISTS ONLY public.catering_orders DROP CONSTRAINT IF EXISTS catering_orders_booking_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bookings DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bookings DROP CONSTRAINT IF EXISTS bookings_confirmed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.booking_sponsors DROP CONSTRAINT IF EXISTS booking_sponsors_sponsor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.booking_sponsors DROP CONSTRAINT IF EXISTS booking_sponsors_responded_by_fkey;
ALTER TABLE IF EXISTS ONLY public.booking_sponsors DROP CONSTRAINT IF EXISTS booking_sponsors_booking_id_fkey;
ALTER TABLE IF EXISTS ONLY public.booking_organizers DROP CONSTRAINT IF EXISTS booking_organizers_organizer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.booking_organizers DROP CONSTRAINT IF EXISTS booking_organizers_booking_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_log DROP CONSTRAINT IF EXISTS audit_log_user_id_fkey;
DROP TRIGGER IF EXISTS trg_sponsors_updated ON public.sponsors;
DROP TRIGGER IF EXISTS trg_payments_updated ON public.payments;
DROP TRIGGER IF EXISTS trg_organizers_updated ON public.organizers;
DROP TRIGGER IF EXISTS trg_hall_bookings_updated ON public.hall_bookings;
DROP TRIGGER IF EXISTS trg_hall_bookings_capacity_cap ON public.hall_bookings;
DROP TRIGGER IF EXISTS trg_event_pricing_updated ON public.event_pricing;
DROP TRIGGER IF EXISTS trg_catering_updated ON public.catering_orders;
DROP TRIGGER IF EXISTS trg_bookings_updated ON public.bookings;
DROP TRIGGER IF EXISTS trg_booking_ref ON public.bookings;
DROP INDEX IF EXISTS public.uq_audit_payment;
DROP INDEX IF EXISTS public.idx_users_role;
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_users_active;
DROP INDEX IF EXISTS public.idx_timeline_booking;
DROP INDEX IF EXISTS public.idx_sponsors_user;
DROP INDEX IF EXISTS public.idx_sponsors_status;
DROP INDEX IF EXISTS public.idx_room_res_user;
DROP INDEX IF EXISTS public.idx_room_res_group;
DROP INDEX IF EXISTS public.idx_payments_transaction;
DROP INDEX IF EXISTS public.idx_payments_status;
DROP INDEX IF EXISTS public.idx_payments_booking_id;
DROP INDEX IF EXISTS public.idx_organizers_user;
DROP INDEX IF EXISTS public.idx_organizers_spec;
DROP INDEX IF EXISTS public.idx_notifications_user_id;
DROP INDEX IF EXISTS public.idx_notifications_user_created;
DROP INDEX IF EXISTS public.idx_notif_user;
DROP INDEX IF EXISTS public.idx_notif_sent;
DROP INDEX IF EXISTS public.idx_notif_booking;
DROP INDEX IF EXISTS public.idx_no_double_booking;
DROP INDEX IF EXISTS public.idx_menu_category;
DROP INDEX IF EXISTS public.idx_hb_one_primary_per_booking;
DROP INDEX IF EXISTS public.idx_hb_one_complimentary_per_booking;
DROP INDEX IF EXISTS public.idx_hall_bookings_status;
DROP INDEX IF EXISTS public.idx_hall_bookings_hall_date;
DROP INDEX IF EXISTS public.idx_hall_bookings_booking;
DROP INDEX IF EXISTS public.idx_feedback_rating;
DROP INDEX IF EXISTS public.idx_feedback_booking;
DROP INDEX IF EXISTS public.idx_event_timelines_start_time;
DROP INDEX IF EXISTS public.idx_event_timelines_sequence_order;
DROP INDEX IF EXISTS public.idx_event_timelines_hall_id;
DROP INDEX IF EXISTS public.idx_event_timelines_booking_id;
DROP INDEX IF EXISTS public.idx_catering_status;
DROP INDEX IF EXISTS public.idx_catering_orders_booking_id;
DROP INDEX IF EXISTS public.idx_catering_booking;
DROP INDEX IF EXISTS public.idx_bookings_user_id;
DROP INDEX IF EXISTS public.idx_bookings_status;
DROP INDEX IF EXISTS public.idx_bookings_ref;
DROP INDEX IF EXISTS public.idx_bookings_event_date;
DROP INDEX IF EXISTS public.idx_bookings_booking_ref;
DROP INDEX IF EXISTS public.idx_audit_user;
DROP INDEX IF EXISTS public.idx_audit_table;
DROP INDEX IF EXISTS public.idx_audit_log_user_id;
DROP INDEX IF EXISTS public.idx_audit_log_table_name;
DROP INDEX IF EXISTS public.idx_audit_action;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_google_id_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.sponsors DROP CONSTRAINT IF EXISTS sponsors_user_id_key;
ALTER TABLE IF EXISTS ONLY public.sponsors DROP CONSTRAINT IF EXISTS sponsors_pkey;
ALTER TABLE IF EXISTS ONLY public.rooms DROP CONSTRAINT IF EXISTS rooms_room_name_key;
ALTER TABLE IF EXISTS ONLY public.rooms DROP CONSTRAINT IF EXISTS rooms_pkey;
ALTER TABLE IF EXISTS ONLY public.room_reservations DROP CONSTRAINT IF EXISTS room_reservations_reservation_ref_key;
ALTER TABLE IF EXISTS ONLY public.room_reservations DROP CONSTRAINT IF EXISTS room_reservations_pkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_transaction_id_key;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_pkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_invoice_number_key;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_token_key;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.organizers DROP CONSTRAINT IF EXISTS organizers_user_id_key;
ALTER TABLE IF EXISTS ONLY public.organizers DROP CONSTRAINT IF EXISTS organizers_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.room_reservations DROP CONSTRAINT IF EXISTS no_room_overlap;
ALTER TABLE IF EXISTS ONLY public.menu_items DROP CONSTRAINT IF EXISTS menu_items_pkey;
ALTER TABLE IF EXISTS ONLY public.halls DROP CONSTRAINT IF EXISTS halls_pkey;
ALTER TABLE IF EXISTS ONLY public.hall_bookings DROP CONSTRAINT IF EXISTS hall_bookings_pkey;
ALTER TABLE IF EXISTS ONLY public.hall_bookings DROP CONSTRAINT IF EXISTS hall_bookings_booking_hall_key;
ALTER TABLE IF EXISTS ONLY public.feedback DROP CONSTRAINT IF EXISTS feedback_pkey;
ALTER TABLE IF EXISTS ONLY public.feedback DROP CONSTRAINT IF EXISTS feedback_booking_id_key;
ALTER TABLE IF EXISTS ONLY public.event_timelines DROP CONSTRAINT IF EXISTS event_timelines_pkey;
ALTER TABLE IF EXISTS ONLY public.event_pricing DROP CONSTRAINT IF EXISTS event_pricing_pkey;
ALTER TABLE IF EXISTS ONLY public.catering_orders DROP CONSTRAINT IF EXISTS catering_orders_pkey;
ALTER TABLE IF EXISTS ONLY public.bookings DROP CONSTRAINT IF EXISTS bookings_pkey;
ALTER TABLE IF EXISTS ONLY public.bookings DROP CONSTRAINT IF EXISTS bookings_booking_ref_key;
ALTER TABLE IF EXISTS ONLY public.booking_sponsors DROP CONSTRAINT IF EXISTS booking_sponsors_pkey;
ALTER TABLE IF EXISTS ONLY public.booking_sponsors DROP CONSTRAINT IF EXISTS booking_sponsors_booking_id_sponsor_id_key;
ALTER TABLE IF EXISTS ONLY public.booking_organizers DROP CONSTRAINT IF EXISTS booking_organizers_pkey;
ALTER TABLE IF EXISTS ONLY public.booking_organizers DROP CONSTRAINT IF EXISTS booking_organizers_booking_id_organizer_id_key;
ALTER TABLE IF EXISTS ONLY public.audit_log DROP CONSTRAINT IF EXISTS audit_log_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sponsors ALTER COLUMN sponsor_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.rooms ALTER COLUMN room_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.room_reservations ALTER COLUMN reservation_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payments ALTER COLUMN payment_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.password_reset_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.organizers ALTER COLUMN organizer_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN notification_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.menu_items ALTER COLUMN item_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.halls ALTER COLUMN hall_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.hall_bookings ALTER COLUMN hall_booking_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.feedback ALTER COLUMN feedback_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.event_timelines ALTER COLUMN timeline_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.catering_orders ALTER COLUMN order_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.bookings ALTER COLUMN booking_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.booking_sponsors ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.booking_organizers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_log ALTER COLUMN log_id DROP DEFAULT;
DROP VIEW IF EXISTS public.v_ratings_summary;
DROP VIEW IF EXISTS public.v_monthly_revenue;
DROP VIEW IF EXISTS public.v_booking_summary;
DROP VIEW IF EXISTS public.v_booked_dates;
DROP SEQUENCE IF EXISTS public.users_user_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.sponsors_sponsor_id_seq;
DROP TABLE IF EXISTS public.sponsors;
DROP SEQUENCE IF EXISTS public.rooms_room_id_seq;
DROP TABLE IF EXISTS public.rooms;
DROP SEQUENCE IF EXISTS public.room_reservations_reservation_id_seq;
DROP TABLE IF EXISTS public.room_reservations;
DROP SEQUENCE IF EXISTS public.payments_payment_id_seq;
DROP TABLE IF EXISTS public.payments;
DROP SEQUENCE IF EXISTS public.password_reset_tokens_id_seq;
DROP TABLE IF EXISTS public.password_reset_tokens;
DROP SEQUENCE IF EXISTS public.organizers_organizer_id_seq;
DROP TABLE IF EXISTS public.organizers;
DROP SEQUENCE IF EXISTS public.notifications_notification_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.menu_items_item_id_seq;
DROP TABLE IF EXISTS public.menu_items;
DROP SEQUENCE IF EXISTS public.halls_hall_id_seq;
DROP TABLE IF EXISTS public.halls;
DROP SEQUENCE IF EXISTS public.hall_bookings_hall_booking_id_seq;
DROP TABLE IF EXISTS public.hall_bookings;
DROP SEQUENCE IF EXISTS public.feedback_feedback_id_seq;
DROP TABLE IF EXISTS public.feedback;
DROP SEQUENCE IF EXISTS public.event_timelines_timeline_id_seq;
DROP TABLE IF EXISTS public.event_timelines;
DROP TABLE IF EXISTS public.event_pricing;
DROP SEQUENCE IF EXISTS public.catering_orders_order_id_seq;
DROP TABLE IF EXISTS public.catering_orders;
DROP SEQUENCE IF EXISTS public.bookings_booking_id_seq;
DROP TABLE IF EXISTS public.bookings;
DROP SEQUENCE IF EXISTS public.booking_sponsors_id_seq;
DROP TABLE IF EXISTS public.booking_sponsors;
DROP SEQUENCE IF EXISTS public.booking_organizers_id_seq;
DROP TABLE IF EXISTS public.booking_organizers;
DROP SEQUENCE IF EXISTS public.audit_log_log_id_seq;
DROP TABLE IF EXISTS public.audit_log;
DROP FUNCTION IF EXISTS public.update_updated_at();
DROP FUNCTION IF EXISTS public.generate_booking_ref();
DROP FUNCTION IF EXISTS public.check_combined_hall_capacity();
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.sponsor_status;
DROP TYPE IF EXISTS public.sponsor_request_status;
DROP TYPE IF EXISTS public.sponsor_request_direction;
DROP TYPE IF EXISTS public.payment_status;
DROP TYPE IF EXISTS public.payment_method;
DROP TYPE IF EXISTS public.order_status;
DROP TYPE IF EXISTS public.notification_type;
DROP TYPE IF EXISTS public.notification_channel;
DROP TYPE IF EXISTS public.booking_status;
DROP EXTENSION IF EXISTS pgcrypto;
DROP EXTENSION IF EXISTS pg_stat_statements;
DROP EXTENSION IF EXISTS btree_gist;
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
    CONSTRAINT room_reservations_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['unpaid'::character varying, 'paid'::character varying, 'refunded'::character varying])::text[]))),
    CONSTRAINT room_reservations_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'cancelled'::character varying, 'completed'::character varying])::text[])))
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
1	1	CREATE_USER	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	127.0.0.1	\N	2026-05-29 11:37:44.607889
5	3	CONFIRM_BOOKING	bookings	7	\N	{"status": "confirmed", "booking_ref": "AP-20260703-0007"}	192.168.1.12	\N	2026-05-29 11:37:44.607889
6	4	CREATE_BOOKING	bookings	1	\N	{"event_date": "2026-01-15", "event_type": "Wedding Reception"}	102.165.1.5	\N	2026-05-29 11:37:44.607889
7	5	CREATE_BOOKING	bookings	2	\N	{"event_date": "2026-02-10", "event_type": "Engagement Ceremony"}	102.165.2.8	\N	2026-05-29 11:37:44.607889
8	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-05-31 14:32:41.943099
9	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-06-06 14:00:30.618877
10	17	CREATE_USER	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-06-21 16:38:08.907208
11	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-06-21 16:38:43.491223
12	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-06-21 17:00:35.278531
13	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-06-21 17:04:59.437248
14	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-06-21 17:21:00.044216
15	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-06-21 17:31:01.349061
16	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-07-03 03:00:35.284769
17	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::1	\N	2026-07-03 03:08:14.719178
18	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::1	\N	2026-07-03 03:14:34.927607
19	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::1	\N	2026-07-05 15:26:02.168725
20	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::1	\N	2026-07-17 03:37:02.247421
21	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-07-17 04:18:19.268822
22	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-07-17 06:21:32.205257
23	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::1	\N	2026-08-02 10:11:41.275178
24	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::1	\N	2026-08-02 10:15:56.509521
25	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::1	\N	2026-08-02 11:34:40.712949
26	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::1	\N	2026-08-02 11:41:53.68167
27	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::1	\N	2026-08-02 11:52:01.076113
28	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-08-02 11:56:47.361922
29	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::1	\N	2026-08-02 12:01:39.464511
30	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-08-02 12:04:48.450132
31	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-09-08 02:28:53.604825
32	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::1	\N	2026-09-08 02:40:07.029902
33	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-09-08 02:47:09.068189
34	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::1	\N	2026-09-08 02:51:11.142388
35	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-09-08 02:52:09.984856
36	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-09-08 02:56:33.397201
37	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::1	\N	2026-09-08 03:01:36.773667
38	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-09-08 03:04:16.040988
39	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::1	\N	2026-09-08 03:11:20.646464
40	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-09-08 03:13:56.961425
41	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::1	\N	2026-09-08 03:16:41.38441
42	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-09-08 03:18:03.089258
43	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::1	\N	2026-09-08 08:11:19.689656
44	4	LOGIN	users	4	\N	{"role": "customer", "email": "rifkan@gmail.com"}	::1	\N	2026-09-08 08:17:15.546331
45	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::1	\N	2026-09-08 08:22:17.703255
46	4	LOGIN	users	4	\N	{"role": "customer", "email": "rifkan@gmail.com"}	::1	\N	2026-09-08 08:30:36.187631
47	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-09-08 08:34:57.152416
48	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::1	\N	2026-09-08 08:40:17.528741
49	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-09-08 08:46:57.741895
50	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-09-08 09:11:12.724355
51	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-09-08 15:23:35.95233
52	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-09-12 13:17:42.017455
53	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-09-12 13:20:16.828567
54	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-09-12 13:25:22.590757
55	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-09-12 13:28:36.224147
56	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-09-12 13:40:56.663788
57	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-09-12 13:49:11.050735
58	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-09-13 06:25:31.613908
59	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-13 06:46:07.57192
60	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-09-13 12:53:57.436383
61	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-09-13 13:13:28.740556
62	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-09-13 13:46:27.22119
63	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-13 17:08:46.146946
64	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-09-13 17:40:35.075213
65	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-09-13 17:58:18.422516
66	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-13 18:19:21.619918
67	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-09-13 18:29:49.668421
68	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-09-13 18:29:49.945534
69	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-13 18:29:57.036716
70	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-09-14 06:00:06.250766
71	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-14 06:20:18.648334
72	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-09-16 12:51:22.41534
73	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-09-17 04:23:39.683914
74	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-09-17 05:34:52.539335
75	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-09-17 17:53:20.417384
76	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-09-18 01:42:47.302857
77	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-18 01:43:47.939858
78	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-09-18 01:59:15.503283
79	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-09-18 01:59:37.142665
80	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-09-18 02:14:12.688083
81	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-09-18 02:19:33.23863
82	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-09-18 02:34:23.370879
83	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-19 00:52:22.693745
84	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-19 00:54:17.334315
85	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-19 00:56:52.061445
86	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-19 00:59:23.508909
87	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-19 01:02:35.790235
88	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-09-19 01:03:56.609685
89	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-09-19 01:04:30.08884
90	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-09-19 01:04:54.109096
91	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-19 01:06:44.698819
92	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-19 01:19:02.599501
93	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-19 01:21:48.989192
94	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-19 06:30:46.230045
95	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-19 06:31:08.182954
96	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-19 06:31:33.294901
97	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-19 06:31:55.713234
98	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::1	\N	2026-09-19 06:33:19.224313
99	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::1	\N	2026-09-19 06:33:41.243001
100	6	LOGIN	users	6	\N	{"role": "customer", "email": "basith@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-19 06:36:04.108995
101	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-09-19 06:55:34.904841
102	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-09-19 06:55:45.216283
103	17	LOGOUT	users	17	\N	{}	::ffff:127.0.0.1	\N	2026-09-19 06:56:13.670537
104	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-19 06:56:23.787215
105	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-20 07:11:16.929524
106	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-09-20 11:12:06.120991
107	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-20 11:13:23.898079
108	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-09-20 11:24:12.346702
109	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-20 11:41:28.507422
110	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-09-20 11:41:42.756613
111	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-20 16:45:50.692197
112	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-09-20 16:50:01.622505
113	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-20 16:52:06.697426
114	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-09-20 16:52:17.557595
115	18	CREATE_USER	users	18	\N	{"role": "customer", "email": "testreg@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-20 16:57:29.882381
116	18	LOGOUT	users	18	\N	{}	::ffff:127.0.0.1	\N	2026-09-20 17:07:10.165775
117	18	LOGOUT	users	18	\N	{}	::ffff:127.0.0.1	\N	2026-09-20 17:07:12.031292
118	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-20 17:07:22.368338
119	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-09-20 17:10:10.662581
120	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-20 17:10:17.937402
121	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-20 17:11:36.186148
122	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-09-20 17:13:42.892332
123	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-20 17:14:58.778092
124	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-09-21 05:21:46.423563
125	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-21 05:21:56.663815
126	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-09-21 05:23:54.477755
127	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-21 05:24:15.204441
128	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-21 10:36:01.067094
129	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-21 16:31:47.835021
130	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-21 16:32:27.971357
131	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-21 17:48:02.149117
132	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-22 03:13:46.402388
133	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-09-23 20:11:10.070727
134	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-23 20:11:16.558728
135	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-09-23 20:28:13.247087
136	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-23 20:31:05.35132
137	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-09-23 20:43:29.839566
138	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-23 20:43:39.776136
139	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-09-23 21:01:34.669558
140	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-09-23 21:01:36.465044
141	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-23 21:01:42.481425
142	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-09-23 21:04:24.297306
143	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-23 21:05:34.648235
144	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 05:27:33.733513
145	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 05:27:34.349061
146	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-24 05:27:44.787903
147	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 05:27:55.815605
148	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-24 05:28:04.960287
149	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 05:44:57.896651
150	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-24 05:45:09.224904
151	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 05:59:11.989914
152	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-24 05:59:44.670345
153	3	LOGOUT	users	3	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 06:01:20.51264
156	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-24 06:09:37.361224
157	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-24 06:16:50.620808
158	3	LOGOUT	users	3	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 06:19:47.366289
162	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-24 06:24:52.796905
163	3	LOGOUT	users	3	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 06:40:41.662952
164	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::ffff:127.0.0.1	\N	2026-09-24 06:41:49.393113
165	11	LOGOUT	users	11	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 06:50:29.711827
166	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::ffff:127.0.0.1	\N	2026-09-24 06:50:55.757413
167	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::ffff:127.0.0.1	\N	2026-09-24 10:04:47.505358
168	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::ffff:127.0.0.1	\N	2026-09-24 10:05:39.537333
169	11	LOGOUT	users	11	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 10:07:34.733434
170	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::ffff:127.0.0.1	\N	2026-09-24 10:07:50.386015
171	11	LOGOUT	users	11	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 10:09:17.225619
172	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::ffff:127.0.0.1	\N	2026-09-24 10:09:25.585788
173	10	LOGOUT	users	10	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 10:17:16.358315
174	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::ffff:127.0.0.1	\N	2026-09-24 10:17:24.944621
175	11	LOGOUT	users	11	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 10:19:48.11834
176	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-24 10:19:56.812012
177	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 10:20:22.52546
178	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-24 10:43:37.119653
179	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 10:45:37.637627
182	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::ffff:127.0.0.1	\N	2026-09-24 10:46:37.213802
183	11	LOGOUT	users	11	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 10:47:30.944059
184	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-24 10:47:41.941777
185	3	LOGOUT	users	3	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 10:47:53.554876
186	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::ffff:127.0.0.1	\N	2026-09-24 10:48:02.964995
187	10	LOGOUT	users	10	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 10:48:16.56272
188	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-24 10:48:29.148709
189	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-09-25 16:52:27.963321
190	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::ffff:127.0.0.1	\N	2026-09-25 16:53:30.633536
191	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::ffff:127.0.0.1	\N	2026-09-26 10:21:36.567644
192	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::1	\N	2026-09-26 10:43:35.386615
193	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::1	\N	2026-09-26 14:33:15.698529
194	13	LOGOUT	users	13	\N	{}	::ffff:127.0.0.1	\N	2026-09-26 14:38:20.321146
195	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::ffff:127.0.0.1	\N	2026-09-26 14:38:27.431142
196	11	LOGOUT	users	11	\N	{}	::ffff:127.0.0.1	\N	2026-09-26 14:38:44.533085
197	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-09-26 14:53:36.621507
198	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-09-26 15:33:17.798229
199	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::ffff:127.0.0.1	\N	2026-09-26 16:47:24.806688
200	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::ffff:127.0.0.1	\N	2026-09-26 17:28:18.740628
201	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::ffff:127.0.0.1	\N	2026-09-26 17:47:47.269476
202	10	LOGOUT	users	10	\N	{}	::ffff:127.0.0.1	\N	2026-09-26 18:06:47.556493
203	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::ffff:127.0.0.1	\N	2026-09-26 18:07:11.347585
204	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::ffff:127.0.0.1	\N	2026-09-26 18:09:13.712201
205	11	LOGOUT	users	11	\N	{}	::ffff:127.0.0.1	\N	2026-09-27 06:28:57.053713
206	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-27 06:29:06.847578
207	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-27 07:05:20.332769
208	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-27 13:26:33.986555
209	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-09-27 13:30:22.85329
210	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-27 13:31:24.816662
211	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-09-27 13:43:08.457443
212	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-09-27 13:43:23.606665
213	17	LOGOUT	users	17	\N	{}	::ffff:127.0.0.1	\N	2026-09-27 13:44:04.808056
214	17	LOGOUT	users	17	\N	{}	::ffff:127.0.0.1	\N	2026-09-27 13:44:05.404714
215	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-27 13:44:15.869922
216	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-27 18:16:46.521524
217	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-27 18:23:13.341461
218	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-09-27 18:25:06.496855
219	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-27 18:36:59.861072
222	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-28 04:56:43.794929
223	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-28 04:57:00.83888
224	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-29 02:16:02.108149
225	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-09-29 08:37:46.035302
226	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-09-29 08:37:56.418383
227	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-09-29 08:38:06.041804
228	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-09-29 08:43:31.178436
229	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-30 01:50:22.178211
230	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-09-30 02:18:41.903064
231	17	LOGOUT	users	17	\N	{}	::ffff:127.0.0.1	\N	2026-09-30 12:16:31.65402
232	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::ffff:127.0.0.1	\N	2026-09-30 12:17:18.244388
233	13	LOGOUT	users	13	\N	{}	::ffff:127.0.0.1	\N	2026-09-30 12:43:29.075105
234	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-30 12:44:33.894917
235	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-09-30 12:48:06.592806
238	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-01 03:10:25.284477
239	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-01 03:46:18.838146
240	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-01 03:51:50.839071
241	1	CREATE_STAFF	users	19	\N	{"role": "front_desk", "email": "teststaff@aazathplaza.lk"}	::1	\N	2026-10-01 03:54:43.341428
242	1	DEACTIVATE_STAFF	users	2	\N	{"email": "manager@aazathplaza.lk"}	::1	\N	2026-10-01 03:56:41.966246
243	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-01 04:01:46.869754
244	1	UPDATE_STAFF	users	2	\N	{"role": "manager", "full_name": "Manager"}	::1	\N	2026-10-01 04:02:27.614748
245	1	REACTIVATE_STAFF	users	2	\N	{"email": "manager@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-01 04:04:41.521026
246	1	REACTIVATE_STAFF	users	2	\N	{"email": "manager@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-01 04:04:43.128763
247	1	UPDATE_STAFF	users	2	\N	{"role": "manager", "full_name": "Manager"}	::ffff:127.0.0.1	\N	2026-10-01 04:04:52.085266
249	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-01 04:10:14.983371
250	1	DEACTIVATE_STAFF	users	19	\N	{"email": "teststaff@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-01 04:35:33.040142
251	1	REACTIVATE_STAFF	users	19	\N	{"email": "teststaff@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-01 04:35:52.30511
252	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-10-01 04:55:39.764584
253	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-01 04:55:55.518159
254	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-01 09:57:14.584392
255	3	LOGOUT	users	3	\N	{}	::ffff:127.0.0.1	\N	2026-10-01 19:54:36.412741
256	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-01 19:54:46.347329
257	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-01 20:35:43.437975
258	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-10-02 07:30:45.4269
259	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-10-02 07:30:56.30305
260	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-02 07:33:37.292562
261	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-02 07:58:20.566616
262	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-10-02 08:11:36.51449
263	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-02 08:11:55.151146
264	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-10-02 10:04:46.550349
265	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-10-02 10:04:59.330623
266	17	LOGOUT	users	17	\N	{}	::ffff:127.0.0.1	\N	2026-10-02 10:07:34.41914
267	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-02 10:07:45.579136
268	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-02 14:14:44.388617
269	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-03 06:46:14.378205
270	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-03 07:47:42.940488
271	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-10-03 07:48:31.79161
272	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-10-03 07:48:42.735324
273	17	LOGOUT	users	17	\N	{}	::ffff:127.0.0.1	\N	2026-10-03 07:48:59.172587
274	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-03 11:22:22.949876
275	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-03 11:39:10.363199
276	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-10-03 11:40:19.875584
279	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-03 11:40:52.136791
280	3	LOGOUT	users	3	\N	{}	::ffff:127.0.0.1	\N	2026-10-03 11:41:02.078039
281	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-03 16:30:22.804508
282	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-10-04 06:19:09.398547
285	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-04 06:23:08.086251
286	3	LOGOUT	users	3	\N	{}	::ffff:127.0.0.1	\N	2026-10-04 06:25:36.225127
287	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-10-04 06:25:50.187689
288	17	LOGOUT	users	17	\N	{}	::ffff:127.0.0.1	\N	2026-10-04 06:30:01.791384
289	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::ffff:127.0.0.1	\N	2026-10-04 06:30:20.120384
290	11	LOGOUT	users	11	\N	{}	::ffff:127.0.0.1	\N	2026-10-04 06:31:50.535834
291	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::ffff:127.0.0.1	\N	2026-10-04 06:32:25.456098
292	10	LOGOUT	users	10	\N	{}	::ffff:127.0.0.1	\N	2026-10-04 06:33:42.878194
293	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::ffff:127.0.0.1	\N	2026-10-04 06:34:10.110296
294	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com", "provider": "google"}	::ffff:127.0.0.1	\N	2026-10-04 12:54:03.174332
295	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-10-04 12:56:30.634829
296	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-10-04 12:56:41.384971
297	17	LOGOUT	users	17	\N	{}	::ffff:127.0.0.1	\N	2026-10-04 12:58:09.856715
298	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-05 15:52:13.353032
299	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-05 15:58:50.803681
300	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-10-05 16:08:46.532656
301	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com", "provider": "google"}	::ffff:127.0.0.1	\N	2026-10-05 16:09:29.018775
302	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-10-05 16:11:32.874291
303	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::ffff:127.0.0.1	\N	2026-10-05 16:11:42.918275
304	13	LOGOUT	users	13	\N	{}	::ffff:127.0.0.1	\N	2026-10-06 07:31:44.631446
305	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::ffff:127.0.0.1	\N	2026-10-06 07:31:57.726114
306	10	LOGOUT	users	10	\N	{}	::ffff:127.0.0.1	\N	2026-10-06 07:45:04.82645
307	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::ffff:127.0.0.1	\N	2026-10-06 07:45:17.830387
308	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::ffff:127.0.0.1	\N	2026-10-06 18:18:14.769725
309	11	LOGOUT	users	11	\N	{}	::ffff:127.0.0.1	\N	2026-10-07 08:15:30.629661
310	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-10-07 08:15:41.78757
311	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-10-07 08:27:53.839345
312	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::ffff:127.0.0.1	\N	2026-10-07 08:28:05.098386
313	11	LOGOUT	users	11	\N	{}	::ffff:127.0.0.1	\N	2026-10-07 08:34:39.372782
314	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::ffff:127.0.0.1	\N	2026-10-07 08:35:02.275811
315	11	LOGOUT	users	11	\N	{}	::ffff:127.0.0.1	\N	2026-10-07 08:35:11.377588
316	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-10-07 08:35:19.847075
317	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-10-07 08:40:36.513982
318	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::ffff:127.0.0.1	\N	2026-10-07 08:40:44.758306
319	11	LOGOUT	users	11	\N	{}	::ffff:127.0.0.1	\N	2026-10-07 08:56:34.619942
320	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-10-07 08:56:42.76631
321	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-10-07 08:58:35.882064
322	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::ffff:127.0.0.1	\N	2026-10-07 08:58:43.253361
323	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::ffff:127.0.0.1	\N	2026-10-07 09:02:08.399994
324	11	LOGOUT	users	11	\N	{}	::ffff:127.0.0.1	\N	2026-10-07 09:13:07.055275
325	11	LOGOUT	users	11	\N	{}	::ffff:127.0.0.1	\N	2026-10-07 09:13:07.584285
326	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-07 09:15:01.727227
327	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-10-07 09:42:10.532396
330	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-07 09:44:27.208749
331	3	LOGOUT	users	3	\N	{}	::ffff:127.0.0.1	\N	2026-10-07 09:46:51.833765
332	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-10-07 09:47:15.957755
333	17	LOGOUT	users	17	\N	{}	::ffff:127.0.0.1	\N	2026-10-07 10:08:53.987459
334	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::ffff:127.0.0.1	\N	2026-10-07 10:09:12.020028
335	11	LOGOUT	users	11	\N	{}	::ffff:127.0.0.1	\N	2026-10-07 10:12:04.898664
336	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::ffff:127.0.0.1	\N	2026-10-07 10:12:17.207843
337	10	LOGOUT	users	10	\N	{}	::ffff:127.0.0.1	\N	2026-10-07 10:13:41.696768
338	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-07 10:13:47.403603
339	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-10-07 10:15:30.552079
340	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::ffff:127.0.0.1	\N	2026-10-07 10:15:39.444449
341	10	LOGOUT	users	10	\N	{}	::ffff:127.0.0.1	\N	2026-10-07 10:19:16.35517
342	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::ffff:127.0.0.1	\N	2026-10-07 10:19:25.488785
343	6	LOGOUT	users	6	\N	{}	::1	\N	2026-10-08 05:06:48.955946
344	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-08 05:07:20.332802
345	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-08 05:12:08.107394
346	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-08 05:12:16.203034
347	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-08 05:12:53.758511
348	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-08 05:13:05.550454
349	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-08 05:18:30.163225
350	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-08 05:18:40.14299
351	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-08 05:21:30.390588
352	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::1	\N	2026-10-08 05:21:41.038152
353	3	LOGOUT	users	3	\N	{}	::1	\N	2026-10-08 05:21:46.86555
354	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-08 11:10:55.510842
355	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-08 11:15:32.911157
356	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-08 11:17:32.669671
357	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-08 11:17:33.537669
358	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-08 11:17:39.991361
359	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-08 11:28:53.521933
360	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-08 11:29:05.870568
361	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-08 11:30:48.577998
364	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::1	\N	2026-10-08 11:31:31.230278
365	3	LOGOUT	users	3	\N	{}	::1	\N	2026-10-08 11:31:49.19608
366	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::1	\N	2026-10-08 11:31:58.823898
367	11	LOGOUT	users	11	\N	{}	::1	\N	2026-10-08 11:32:20.839164
368	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::1	\N	2026-10-08 11:32:35.529319
369	10	LOGOUT	users	10	\N	{}	::1	\N	2026-10-08 11:32:56.166389
370	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-10-08 11:33:04.558671
371	13	LOGOUT	users	13	\N	{}	::1	\N	2026-10-08 11:40:55.491719
372	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-08 11:41:01.747536
373	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-08 11:49:03.957731
374	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-08 11:58:43.944948
375	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-08 12:02:14.038933
376	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::1	\N	2026-10-08 12:02:22.098097
377	10	LOGOUT	users	10	\N	{}	::1	\N	2026-10-08 12:26:31.122225
378	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-08 12:26:40.099348
379	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-08 12:27:43.414491
380	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::1	\N	2026-10-08 12:27:50.383222
381	10	LOGOUT	users	10	\N	{}	::1	\N	2026-10-08 12:28:42.605716
382	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-08 12:28:48.849418
383	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-08 12:31:12.72535
384	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::1	\N	2026-10-08 12:31:22.944363
385	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::1	\N	2026-10-10 00:49:08.847727
386	10	LOGOUT	users	10	\N	{}	::1	\N	2026-10-10 00:51:02.232944
387	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-10 00:51:16.082517
388	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-10 00:53:18.887935
389	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::1	\N	2026-10-10 00:53:33.378364
390	10	LOGOUT	users	10	\N	{}	::1	\N	2026-10-10 00:54:46.100259
391	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-10 00:54:54.775963
392	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-10 00:55:35.994641
393	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::1	\N	2026-10-10 00:55:46.952535
394	10	LOGOUT	users	10	\N	{}	::1	\N	2026-10-10 00:57:02.446256
395	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-10 00:57:18.088558
396	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-10 01:05:12.754705
397	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-10 09:22:38.878349
398	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com", "provider": "google"}	::1	\N	2026-10-10 09:22:54.766822
399	6	LOGOUT	users	6	\N	{}	::1	\N	2026-10-10 09:27:04.835545
400	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::1	\N	2026-10-10 09:27:13.7384
401	11	LOGOUT	users	11	\N	{}	::1	\N	2026-10-10 09:27:34.681406
402	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-10 09:27:44.086014
403	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-10 09:28:17.634107
406	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-10 09:29:00.186462
407	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-10 09:39:04.355994
408	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-10 09:43:24.494926
409	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::1	\N	2026-10-10 09:43:36.177162
410	10	LOGOUT	users	10	\N	{}	::1	\N	2026-10-10 09:46:00.810611
411	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-10 09:46:16.08373
412	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-10 09:47:04.302831
413	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::1	\N	2026-10-10 09:47:13.053361
414	10	LOGOUT	users	10	\N	{}	::1	\N	2026-10-10 09:47:29.002738
415	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-10 09:47:42.137484
416	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-10 09:59:30.542103
417	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-10 09:59:40.06336
418	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-10 10:19:16.275049
419	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::1	\N	2026-10-10 10:19:25.548348
420	10	LOGOUT	users	10	\N	{}	::1	\N	2026-10-10 10:21:43.507337
421	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-10 10:21:53.515666
422	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-10 10:28:33.185533
423	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-10 10:28:42.958393
424	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-10 10:44:43.586895
425	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-10 10:46:38.145446
426	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::1	\N	2026-10-10 10:46:46.927746
427	11	LOGOUT	users	11	\N	{}	::1	\N	2026-10-10 10:52:49.416054
428	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-10 15:44:44.575903
429	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-10 16:17:18.261791
430	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-10 16:18:25.961916
431	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-10 16:25:33.780155
432	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-10 16:34:00.048782
433	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::1	\N	2026-10-10 16:34:08.958504
434	6	LOGOUT	users	6	\N	{}	::1	\N	2026-10-10 17:13:37.122495
435	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::1	\N	2026-10-10 17:13:51.394858
436	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-10-10 17:40:10.110765
437	13	LOGOUT	users	13	\N	{}	::1	\N	2026-10-10 17:45:57.068159
438	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-10 17:46:04.40934
439	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-11 07:57:03.442546
440	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::1	\N	2026-10-11 07:57:15.986999
441	11	LOGOUT	users	11	\N	{}	::1	\N	2026-10-11 07:58:14.307278
442	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-10-11 07:58:24.884445
443	13	LOGOUT	users	13	\N	{}	::1	\N	2026-10-11 08:05:13.533716
444	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::1	\N	2026-10-11 08:05:25.717131
445	3	LOGOUT	users	3	\N	{}	::1	\N	2026-10-11 08:30:34.582147
446	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::1	\N	2026-10-11 08:30:44.85928
447	6	LOGOUT	users	6	\N	{}	::1	\N	2026-10-11 08:36:39.426619
448	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-11 08:36:55.306606
449	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-11 08:41:56.581393
450	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-10-11 08:42:08.379164
451	13	LOGOUT	users	13	\N	{}	::1	\N	2026-10-11 08:43:12.652283
452	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::1	\N	2026-10-11 08:43:22.996976
453	10	LOGOUT	users	10	\N	{}	::1	\N	2026-10-11 08:44:00.286976
457	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::1	\N	2026-10-11 08:44:52.28485
458	11	LOGOUT	users	11	\N	{}	::1	\N	2026-10-11 08:46:44.92817
459	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::1	\N	2026-10-11 08:46:55.88605
460	3	LOGOUT	users	3	\N	{}	::1	\N	2026-10-11 08:48:12.991767
461	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-11 08:48:24.455246
462	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-11 08:49:21.024097
463	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-11 08:49:30.143084
464	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-11 08:53:31.086789
465	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-11 08:53:39.540797
466	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-11 09:05:16.171231
467	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-11 09:05:28.975387
468	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-11 09:05:55.647421
469	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::1	\N	2026-10-11 09:06:17.409977
471	3	LOGOUT	users	3	\N	{}	::1	\N	2026-10-11 09:17:07.857259
472	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-11 09:17:19.108491
470	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-11 09:10:25.626796
473	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-11 09:54:09.834704
474	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::1	\N	2026-10-11 09:54:20.338202
475	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-11 10:00:39.825516
476	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-11 10:00:53.905732
477	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-11 10:01:03.020465
478	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-11 10:01:17.464542
479	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::1	\N	2026-10-11 10:01:27.961763
480	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-11 10:02:28.317188
481	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::1	\N	2026-10-11 10:20:29.670441
482	6	LOGOUT	users	6	\N	{}	::1	\N	2026-10-11 10:30:49.406983
483	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-11 10:30:55.090332
484	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-11 10:32:14.021632
485	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::1	\N	2026-10-11 10:32:22.063328
486	6	LOGOUT	users	6	\N	{}	::1	\N	2026-10-11 10:49:33.981315
487	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-11 10:49:40.801686
488	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-11 10:51:09.222691
489	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::1	\N	2026-10-11 10:51:17.349283
490	6	LOGOUT	users	6	\N	{}	::1	\N	2026-10-11 10:58:29.83792
491	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::1	\N	2026-10-11 10:58:43.391764
492	6	LOGOUT	users	6	\N	{}	::1	\N	2026-10-11 16:16:55.244056
493	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-11 16:17:05.280249
494	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-11 16:33:04.073749
495	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-11 16:33:14.599473
496	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-11 16:35:29.655359
497	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-11 16:35:41.030476
498	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-11 16:39:11.723925
499	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-11 16:39:20.880998
500	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-12 09:59:35.139004
501	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-12 09:59:46.114033
502	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-12 10:03:20.875685
503	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::1	\N	2026-10-12 10:03:31.600599
504	6	LOGOUT	users	6	\N	{}	::1	\N	2026-10-12 10:12:12.56553
505	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-12 10:13:05.184768
506	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-12 10:19:50.546722
507	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-10-12 10:20:02.165853
508	13	LOGOUT	users	13	\N	{}	::1	\N	2026-10-12 10:21:15.315319
509	13	LOGOUT	users	13	\N	{}	::1	\N	2026-10-12 10:21:15.53829
510	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::1	\N	2026-10-12 10:21:26.394331
511	10	LOGOUT	users	10	\N	{}	::1	\N	2026-10-12 10:26:30.23927
514	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-12 10:31:55.309918
515	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-12 10:33:11.602994
516	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::1	\N	2026-10-12 10:33:20.323907
517	11	LOGOUT	users	11	\N	{}	::1	\N	2026-10-12 10:34:25.801649
518	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::1	\N	2026-10-12 10:34:38.458905
519	3	LOGOUT	users	3	\N	{}	::1	\N	2026-10-12 10:37:49.076267
520	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-12 10:38:00.800073
521	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-13 07:59:59.115649
522	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-13 08:00:08.684452
523	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-13 08:00:18.171897
526	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::1	\N	2026-10-13 08:00:44.942565
527	3	LOGOUT	users	3	\N	{}	::1	\N	2026-10-13 09:19:28.407921
528	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-13 09:19:38.999246
529	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-13 09:19:50.168168
530	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-13 09:21:12.634544
531	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-13 13:53:29.228617
532	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-13 13:53:33.837269
533	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-13 13:54:31.180244
534	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-13 13:54:36.780412
535	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-13 13:54:45.556038
536	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-13 13:59:39.21268
537	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-13 14:14:49.681174
538	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-13 14:18:54.373905
539	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-13 14:25:33.778467
540	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-13 14:27:39.268207
541	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::1	\N	2026-10-13 14:27:48.504314
542	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-13 14:31:49.647676
543	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-10-13 14:41:36.656928
544	13	LOGOUT	users	13	\N	{}	::1	\N	2026-10-13 14:42:14.280941
545	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-13 14:42:37.537283
546	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-13 14:47:21.383928
547	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-13 14:47:34.854512
548	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-13 20:12:53.106263
549	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-13 20:13:04.398241
550	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-13 20:14:30.54302
551	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::1	\N	2026-10-13 20:14:37.39228
552	10	LOGOUT	users	10	\N	{}	::1	\N	2026-10-13 20:15:02.647265
553	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-13 20:15:09.195865
554	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-13 20:15:33.034237
555	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-13 20:15:34.049138
556	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-13 20:15:39.608061
557	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-10-13 21:55:08.823924
558	13	LOGOUT	users	13	\N	{}	::1	\N	2026-10-13 21:55:34.329773
559	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-10-14 07:31:51.184904
560	13	LOGOUT	users	13	\N	{}	::1	\N	2026-10-14 07:33:54.881724
561	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::1	\N	2026-10-14 07:34:07.715756
562	10	LOGOUT	users	10	\N	{}	::1	\N	2026-10-14 07:37:58.939272
563	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-14 07:38:29.390617
564	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-14 07:38:44.822302
565	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::1	\N	2026-10-14 07:41:25.756078
566	6	LOGOUT	users	6	\N	{}	::1	\N	2026-10-14 07:41:41.940903
567	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::1	\N	2026-10-14 07:42:13.470919
568	3	LOGOUT	users	3	\N	{}	::1	\N	2026-10-14 07:42:20.4673
569	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-14 07:43:34.774619
570	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-14 07:47:45.148645
571	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-14 07:47:57.095706
572	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-14 07:48:12.997503
573	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-14 07:48:27.53752
574	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-14 07:48:36.123951
575	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::1	\N	2026-10-14 07:48:55.973229
576	6	LOGOUT	users	6	\N	{}	::1	\N	2026-10-14 07:58:43.879549
577	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-14 07:58:55.590838
578	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-14 08:50:35.131086
579	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-14 08:50:45.497139
580	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-14 09:01:59.503281
581	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-14 14:09:21.829358
582	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-10-14 14:09:44.135943
583	13	LOGOUT	users	13	\N	{}	::1	\N	2026-10-14 14:14:18.081452
584	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-14 14:14:48.226444
585	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-14 14:15:18.500917
586	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-14 14:15:31.37639
587	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-14 14:41:25.70191
588	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-14 14:41:37.047179
589	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-14 14:49:36.755982
590	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-14 14:49:50.041972
591	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-14 14:53:07.302713
592	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-14 14:53:16.043689
593	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-14 14:55:37.382098
594	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-14 14:55:49.624795
595	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-14 15:12:48.916787
596	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-14 15:35:44.138876
597	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-14 15:41:01.757011
598	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-14 15:41:11.31213
599	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-14 20:37:04.128522
601	\N	LOGOUT	users	2	\N	{}	::1	\N	2026-10-14 20:39:45.409871
602	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::1	\N	2026-10-14 20:40:08.969607
603	3	LOGOUT	users	3	\N	{}	::1	\N	2026-10-14 20:46:02.135003
604	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::1	\N	2026-10-14 20:46:14.145631
605	3	LOGOUT	users	3	\N	{}	::1	\N	2026-10-14 20:54:42.608236
608	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-10-14 20:58:54.984325
609	13	LOGOUT	users	13	\N	{}	::1	\N	2026-10-14 21:06:06.270158
610	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-10-14 21:06:25.981758
611	13	LOGOUT	users	13	\N	{}	::1	\N	2026-10-14 21:07:18.984676
612	10	LOGIN	users	10	\N	{"role": "organizer", "email": "fathima@decorations.lk"}	::1	\N	2026-10-14 21:07:30.603548
613	10	LOGOUT	users	10	\N	{}	::1	\N	2026-10-14 21:11:08.422822
614	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::1	\N	2026-10-14 21:11:29.648264
615	11	LOGOUT	users	11	\N	{}	::1	\N	2026-10-14 21:15:46.339271
616	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-15 10:52:51.976625
617	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-15 10:56:37.566278
620	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-16 05:24:45.036929
621	1	DEACTIVATE_STAFF	users	3	\N	{"email": "staff@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-16 05:38:41.953631
622	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-10-16 05:44:33.742744
623	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::ffff:127.0.0.1	\N	2026-10-16 05:44:55.192013
624	13	LOGOUT	users	13	\N	{}	::ffff:127.0.0.1	\N	2026-10-16 05:45:25.421848
625	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-10-16 05:45:48.475577
626	17	LOGOUT	users	17	\N	{}	::ffff:127.0.0.1	\N	2026-10-16 05:53:37.562466
627	20	CREATE_USER	users	20	\N	{"role": "customer", "email": "fathima@gmail.com"}	::1	\N	2026-10-16 08:47:15.437866
628	20	LOGOUT	users	20	\N	{}	::ffff:127.0.0.1	\N	2026-10-16 08:53:25.659535
629	21	CREATE_USER	users	21	\N	{"role": "customer", "email": "sumi@gmail.com"}	::1	\N	2026-10-16 08:54:19.740549
630	21	LOGOUT	users	21	\N	{}	::1	\N	2026-10-16 08:54:32.359349
631	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com", "provider": "google"}	::ffff:127.0.0.1	\N	2026-10-16 08:57:32.151006
632	6	LOGOUT	users	6	\N	{}	::ffff:127.0.0.1	\N	2026-10-16 08:58:36.35128
633	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::ffff:127.0.0.1	\N	2026-10-16 09:07:52.60431
634	17	LOGOUT	users	17	\N	{}	::ffff:127.0.0.1	\N	2026-10-16 09:09:36.472409
635	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-17 09:18:17.15132
636	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com"}	::1	\N	2026-10-17 09:55:21.323235
637	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-17 10:01:34.337515
638	6	LOGOUT	users	6	\N	{}	::1	\N	2026-10-17 10:10:26.208477
639	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-17 10:10:30.837437
640	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-17 10:32:41.542002
641	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-17 10:41:39.991695
642	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-17 10:41:49.188393
643	1	REACTIVATE_STAFF	users	3	\N	{"email": "staff@aazathplaza.lk"}	::1	\N	2026-10-17 10:42:11.133739
644	1	DEACTIVATE_STAFF	users	2	\N	{"email": "manager@aazathplaza.lk"}	::1	\N	2026-10-17 10:42:20.476117
645	1	REACTIVATE_STAFF	users	2	\N	{"email": "manager@aazathplaza.lk"}	::1	\N	2026-10-17 10:56:18.886853
646	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-17 11:04:54.305588
647	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-17 11:06:03.675935
650	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-17 21:18:34.581104
651	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-17 21:18:41.726985
652	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::1	\N	2026-10-17 21:18:47.581532
653	13	LOGOUT	users	13	\N	{}	::1	\N	2026-10-17 21:18:53.548302
655	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-17 21:27:36.960608
656	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-10-17 21:27:41.04657
657	13	LOGIN	users	13	\N	{"role": "restaurant", "email": "althab@restaurant.lk"}	::ffff:127.0.0.1	\N	2026-10-17 21:27:45.812301
658	13	LOGOUT	users	13	\N	{}	::ffff:127.0.0.1	\N	2026-10-17 21:28:05.792145
2	\N	CONFIRM_BOOKING	bookings	1	\N	{"status": "confirmed", "booking_ref": "AP-20260101-0001"}	192.168.1.10	\N	2026-05-29 11:37:44.607889
3	\N	CONFIRM_BOOKING	bookings	2	\N	{"status": "confirmed", "booking_ref": "AP-20260102-0002"}	192.168.1.10	\N	2026-05-29 11:37:44.607889
4	\N	CONFIRM_BOOKING	bookings	5	\N	{"status": "confirmed", "booking_ref": "AP-20260601-0005"}	192.168.1.10	\N	2026-05-29 11:37:44.607889
154	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-24 06:01:57.60436
155	\N	LOGOUT	users	2	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 06:09:20.939937
159	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-24 06:20:00.109425
160	\N	LOGOUT	users	2	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 06:21:31.295723
161	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-24 06:21:40.102202
180	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-24 10:45:50.565094
181	\N	LOGOUT	users	2	\N	{}	::ffff:127.0.0.1	\N	2026-09-24 10:46:27.808339
220	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-27 18:40:00.089161
221	\N	LOGOUT	users	2	\N	{}	::ffff:127.0.0.1	\N	2026-09-27 18:40:43.631132
236	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-09-30 12:48:25.931616
237	\N	LOGOUT	users	2	\N	{}	::ffff:127.0.0.1	\N	2026-10-01 03:10:10.68584
248	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::1	\N	2026-10-01 04:05:12.657407
277	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-03 11:40:30.100678
278	\N	LOGOUT	users	2	\N	{}	::ffff:127.0.0.1	\N	2026-10-03 11:40:41.03279
283	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-04 06:19:20.964872
284	\N	LOGOUT	users	2	\N	{}	::ffff:127.0.0.1	\N	2026-10-04 06:22:48.58937
328	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-07 09:42:20.801172
329	\N	LOGOUT	users	2	\N	{}	::ffff:127.0.0.1	\N	2026-10-07 09:44:15.418375
362	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::1	\N	2026-10-08 11:30:56.050567
363	\N	LOGOUT	users	2	\N	{}	::1	\N	2026-10-08 11:31:17.144979
404	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::1	\N	2026-10-10 09:28:26.985368
405	\N	LOGOUT	users	2	\N	{}	::1	\N	2026-10-10 09:28:44.921036
454	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::1	\N	2026-10-11 08:44:11.530802
455	\N	LOGOUT	users	2	\N	{}	::1	\N	2026-10-11 08:44:41.729333
456	\N	LOGOUT	users	2	\N	{}	::1	\N	2026-10-11 08:44:42.897717
512	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::1	\N	2026-10-12 10:26:40.644576
513	\N	LOGOUT	users	2	\N	{}	::1	\N	2026-10-12 10:31:44.479976
524	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::1	\N	2026-10-13 08:00:27.850666
525	\N	LOGOUT	users	2	\N	{}	::1	\N	2026-10-13 08:00:35.105476
600	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::1	\N	2026-10-14 20:37:21.518172
606	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::1	\N	2026-10-14 20:54:59.627313
607	\N	LOGOUT	users	2	\N	{}	::1	\N	2026-10-14 20:58:42.349518
618	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::1	\N	2026-10-15 10:56:49.635941
619	\N	LOGOUT	users	2	\N	{}	::1	\N	2026-10-15 10:57:00.600581
648	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::1	\N	2026-10-17 11:06:10.613704
649	\N	LOGOUT	users	2	\N	{}	::1	\N	2026-10-17 21:17:58.700398
654	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-17 21:19:02.688135
659	\N	LOGIN	users	2	\N	{"role": "manager", "email": "manager@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-17 21:28:10.936599
660	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::ffff:127.0.0.1	\N	2026-10-17 21:34:11.397583
661	1	LOGOUT	users	1	\N	{}	::ffff:127.0.0.1	\N	2026-10-17 21:47:37.10412
662	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com", "provider": "google"}	::1	\N	2026-10-17 22:21:21.634915
663	6	LOGOUT	users	6	\N	{}	::1	\N	2026-10-17 22:23:02.033138
664	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-17 22:27:07.135719
665	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-17 22:33:06.339048
666	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-17 23:49:28.095735
667	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-18 14:00:47.898196
668	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-18 14:01:40.072548
669	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-18 14:04:24.183779
670	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-18 14:20:49.711611
671	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-18 14:38:00.67126
672	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-18 17:44:19.066975
673	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-18 17:46:56.788023
674	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-18 17:54:57.382058
675	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-18 17:57:44.335373
676	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-18 18:05:09.240203
677	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-18 18:05:24.843955
678	\N	PAYMENT_SIG_INVALID	payments	\N	\N	{"amount": "40000.00", "currency": "LKR", "order_id": "AZP-1-123", "event_type": null, "payment_ref": "TEST1", "status_code": "2", "expected_amount": null}	::1	\N	2026-10-18 19:50:33.853662
679	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-18 20:08:31.238863
680	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-18 20:26:42.246637
681	\N	PAYMENT_SUCCESS	payments	\N	\N	{"amount": "5000.00", "currency": "LKR", "order_id": "ROOM-RG-261018-2C713F", "event_type": "Room Reservation", "payment_ref": "320032674251", "status_code": "2", "expected_amount": "5000.00"}	::1	\N	2026-10-18 20:27:19.441143
682	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com", "provider": "google"}	::1	\N	2026-10-18 21:04:53.953558
683	\N	PAYMENT_SUCCESS	payments	\N	\N	{"amount": "15000.00", "currency": "LKR", "order_id": "ROOM-RG-261018-21A2A6", "event_type": "Room Reservation", "payment_ref": "320032674263", "status_code": "2", "expected_amount": "15000.00"}	::1	\N	2026-10-18 21:13:01.723446
684	\N	PAYMENT_SUCCESS	payments	\N	\N	{"amount": "25000.00", "currency": "LKR", "order_id": "ROOM-RG-261018-5A431D", "event_type": "Room Reservation", "payment_ref": "320032674264", "status_code": "2", "expected_amount": "25000.00"}	::1	\N	2026-10-18 21:15:11.071698
685	6	LOGOUT	users	6	\N	{}	::1	\N	2026-10-18 21:17:05.335069
686	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com", "provider": "google"}	::1	\N	2026-10-18 22:36:36.879355
687	\N	PAYMENT_SUCCESS	payments	62	\N	{"amount": "30000.00", "currency": "LKR", "order_id": "AZP-68-1792343410590", "event_type": "Political Event", "payment_ref": "320032674281", "status_code": "2", "expected_amount": "30000.00"}	::1	\N	2026-10-18 22:41:04.582567
688	6	LOGOUT	users	6	\N	{}	::1	\N	2026-10-18 22:41:59.233953
689	6	LOGIN	users	6	\N	{"role": "customer", "email": "thirayafathima@gmail.com", "provider": "google"}	::1	\N	2026-10-18 23:17:41.409176
690	6	LOGOUT	users	6	\N	{}	::1	\N	2026-10-18 23:18:05.862409
691	22	CREATE_USER	users	22	\N	{"role": "sponsor", "email": "sponsor-test@gmail.com"}	::1	\N	2026-10-19 08:52:12.342997
692	22	LOGOUT	users	22	\N	{}	::1	\N	2026-10-19 09:24:46.015905
693	23	CREATE_USER	users	23	\N	{"role": "sponsor", "email": "sponsor-test2@gmail.com"}	::1	\N	2026-10-19 09:26:28.919943
694	23	LOGOUT	users	23	\N	{}	::1	\N	2026-10-19 09:29:33.605594
695	24	CREATE_USER	users	24	\N	{"role": "organizer", "email": "organizer-test@gmail.com"}	::1	\N	2026-10-19 09:30:53.89896
696	25	CREATE_USER	users	25	\N	{"role": "organizer", "email": "organizer-test2@gmail.com"}	::1	\N	2026-10-19 09:44:54.311164
697	25	LOGOUT	users	25	\N	{}	::1	\N	2026-10-19 09:47:34.601263
698	26	CREATE_USER	users	26	\N	{"role": "restaurant", "email": "restaurant-test@gmail.com"}	::1	\N	2026-10-19 09:49:15.220166
699	26	LOGOUT	users	26	\N	{}	::1	\N	2026-10-19 09:51:04.431257
700	24	LOGIN	users	24	\N	{"role": "organizer", "email": "organizer-test@gmail.com"}	::1	\N	2026-10-19 09:57:26.011491
701	24	LOGOUT	users	24	\N	{}	::1	\N	2026-10-19 09:57:35.036947
702	24	LOGIN	users	24	\N	{"role": "organizer", "email": "organizer-test@gmail.com"}	::1	\N	2026-10-19 10:00:46.334485
703	24	LOGOUT	users	24	\N	{}	::1	\N	2026-10-19 10:11:43.772739
704	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-19 13:56:23.360928
705	\N	PAYMENT_SUCCESS	payments	63	\N	{"amount": "30000.00", "currency": "LKR", "order_id": "AZP-69-1792398487022", "event_type": "Other", "payment_ref": "320032674641", "status_code": "2", "expected_amount": "30000.00"}	::1	\N	2026-10-19 13:58:20.683189
706	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-19 14:00:02.361708
707	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-19 14:00:07.284282
708	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-19 14:00:32.775508
709	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-19 14:00:37.269739
710	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-19 14:40:30.048966
711	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-19 14:43:13.93736
712	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-19 15:53:18.173576
713	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-19 15:53:45.749149
714	1	UPDATE_STAFF	users	19	\N	{"role": "front_desk", "full_name": "Test Staff"}	::1	\N	2026-10-19 18:58:40.190607
715	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-19 18:59:12.75665
716	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-19 18:59:32.106994
717	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-19 19:02:21.21386
718	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-19 19:03:14.549581
719	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-19 19:06:39.210246
720	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::1	\N	2026-10-19 19:08:09.597342
721	3	LOGOUT	users	3	\N	{}	::1	\N	2026-10-19 19:13:14.70349
722	11	LOGIN	users	11	\N	{"role": "sponsor", "email": "sponsor@akbartraders.lk"}	::1	\N	2026-10-19 19:13:19.455849
723	11	LOGOUT	users	11	\N	{}	::1	\N	2026-10-19 21:13:49.671346
724	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-19 21:13:54.711872
725	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-19 21:14:14.874739
726	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-20 00:30:16.935898
727	1	LOGOUT	users	1	\N	{}	::1	\N	2026-10-20 00:31:07.883163
728	3	LOGIN	users	3	\N	{"role": "front_desk", "email": "staff@aazathplaza.lk"}	::1	\N	2026-10-20 00:31:26.211632
729	3	LOGOUT	users	3	\N	{}	::1	\N	2026-10-20 00:32:01.270702
730	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-20 00:32:07.813371
731	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-20 00:44:12.618031
732	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-20 00:45:49.714
733	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-20 00:48:14.256646
734	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-20 01:21:30.584869
735	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-20 01:28:43.46531
736	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-20 01:28:48.464432
737	17	LOGIN	users	17	\N	{"role": "customer", "email": "test@example.com"}	::1	\N	2026-10-20 13:34:10.31169
738	17	LOGOUT	users	17	\N	{}	::1	\N	2026-10-20 13:50:14.908385
739	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-20 13:50:20.113679
740	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-20 14:28:28.41953
741	1	LOGIN	users	1	\N	{"role": "admin", "email": "admin@aazathplaza.lk"}	::1	\N	2026-10-20 14:45:31.252387
\.


--
-- Data for Name: booking_organizers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.booking_organizers (id, booking_id, organizer_id, role_in_event, agreed_fee, status, notes, assigned_at, decline_reason, responded_at) FROM stdin;
1	1	1	Full Wedding Decoration & Stage Setup	55000.00	completed	Traditional Sri Lankan wedding decor	2026-05-29 11:36:43.879936	\N	\N
2	2	2	Floral Arrangements & Engagement Setup	25000.00	completed	Pink and gold floral theme	2026-05-29 11:36:43.879936	\N	\N
3	3	1	Luxury Wedding Decoration	75000.00	completed	Premium floral and lighting setup	2026-05-29 11:36:43.879936	\N	\N
4	5	1	Indoor Garden Wedding Decoration	60000.00	confirmed	Indoor garden theme with fountain	2026-05-29 11:36:43.879936	\N	\N
5	5	2	Floral Centrepieces & Backdrop	30000.00	confirmed	Fresh flower centrepieces for all tables	2026-05-29 11:36:43.879936	\N	\N
6	6	2	Engagement Floral Setup	20000.00	confirmed	Surprise engagement - minimal setup initially	2026-05-29 11:36:43.879936	\N	\N
7	8	1	Lead Event Coordinator	25000.00	assigned	Confirmed via phone, will bring own decor team	2026-07-17 06:22:32.990534	\N	\N
11	31	2	Decoration Lead	15000.00	assigned	Some Random Notes..	2026-10-07 10:15:02.12038	\N	\N
13	50	1	Decorator	20000.00	assigned	\N	2026-10-08 11:44:46.369216	\N	\N
15	51	1	Decoration Lead	18000.00	assigned	\N	2026-10-08 12:01:03.807535	\N	\N
17	29	2	Decoration Lead	25000.00	assigned	\N	2026-10-08 12:27:20.687943	\N	\N
18	49	1	Decoration Lead	23000.00	assigned	\N	2026-10-08 12:29:30.411919	\N	\N
16	51	2	Decoration Lead	18000.00	confirmed	some note..	2026-10-08 12:01:59.425431	\N	2026-10-10 06:20:35.827233+05:30
14	48	2	Decoration Lead	20000.00	declined	Some note..	2026-10-08 12:00:00.750136	Already Booked on that day.	2026-10-10 06:24:19.615311+05:30
12	50	2	Decoration Lead	20000.00	declined	\N	2026-10-08 11:42:15.893095	Already Booked on that day.	2026-10-10 06:26:50.085015+05:30
\.


--
-- Data for Name: booking_sponsors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.booking_sponsors (id, booking_id, sponsor_id, proposed_amount, message, status, responded_by, responded_at, requested_at, direction) FROM stdin;
1	8	1	15000.00	Would love your logo on our event banners	accepted	11	2026-08-02 11:45:56.054191	2026-08-02 11:37:44.908632	customer_to_sponsor
3	8	2	10000.00	test	withdrawn	\N	\N	2026-08-02 11:53:04.987194	customer_to_sponsor
4	40	1	100000.00	Some Note..	accepted	6	2026-10-07 08:27:28.708971	2026-10-06 18:10:10.971434	sponsor_to_customer
5	24	1	50000.00	I would like to support this event.	pending	\N	\N	2026-10-07 08:34:28.61717	sponsor_to_customer
6	21	1	20000.00	Test request	accepted	11	2026-10-07 08:53:05.887839	2026-10-07 08:43:15.114556	customer_to_sponsor
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bookings (booking_id, user_id, booking_ref, event_date, event_start_time, event_end_time, event_type, guest_count, status, base_amount, addon_amount, discount_amount, tax_amount, total_amount, special_requests, internal_notes, confirmed_by, confirmed_at, cancelled_at, cancel_reason, created_at, updated_at, room_count, custom_event_type, reminder_sent_at, reminder_email_sent_at) FROM stdin;
15	17	AP-20260912-0015	2026-09-18	09:00:00	14:00:00	Birthday Function	250	cancelled	60000.00	0.00	0.00	0.00	60000.00	\N	\N	\N	\N	2026-09-13 17:11:59.172758	customer requested to cancel.	2026-09-12 13:49:58.067144	2026-09-13 17:11:59.172758	0	\N	\N	\N
10	8	AP-20260106-0010	2026-04-20	14:00:00	22:00:00	Wedding Function	300	cancelled	130000.00	0.00	0.00	0.00	130000.00	Cancelled due to change of venue.	\N	\N	\N	\N	\N	2026-05-29 11:35:02.45325	2026-06-20 17:31:57.906536	0	\N	\N	\N
42	6	AP-20260924-0042	2026-11-25	09:00:00	17:00:00	School Event	300	confirmed	20000.00	5000.00	0.00	0.00	25000.00	some note..	\N	1	2026-10-01 19:58:11.312416	\N	\N	2026-09-24 10:50:14.826443	2026-10-01 20:13:09.269243	0	\N	\N	\N
14	17	AP-20260912-0014	2026-09-17	09:00:00	14:00:00	Wedding Function	350	pending	40000.00	0.00	0.00	0.00	40000.00	althaf fried rice, decoration required	\N	\N	\N	\N	\N	2026-09-12 13:30:42.383141	2026-09-12 13:30:42.383141	0	\N	\N	\N
23	4	AP-20260913-0023	2026-10-14	10:00:00	15:00:00	Wedding Function	320	cancelled	40000.00	0.00	0.00	0.00	40000.00	\N	\N	\N	\N	\N	\N	2026-09-13 18:28:18.304351	2026-09-13 18:28:18.304351	0	\N	\N	\N
29	17	AP-20260913-0029	2026-10-26	11:00:00	16:00:00	Birthday Function	270	confirmed	60000.00	0.00	0.00	0.00	60000.00	\N	\N	\N	\N	\N	\N	2026-09-13 18:28:19.997106	2026-09-13 18:28:19.997106	0	\N	\N	\N
33	17	AP-20260918-0033	2026-09-26	09:00:00	14:00:00	School Event	100	pending	20000.00	0.00	0.00	0.00	20000.00	note	\N	\N	\N	\N	\N	2026-09-18 02:23:49.559623	2026-09-18 02:23:49.559623	0	\N	\N	\N
31	4	AP-20260913-0031	2026-10-30	10:00:00	15:00:00	Wedding Function	330	confirmed	40000.00	0.00	0.00	0.00	40000.00	\N	\N	1	2026-09-19 07:13:48.497522	\N	\N	2026-09-13 18:28:20.657026	2026-09-19 07:13:48.497522	0	\N	\N	\N
12	1	AP-20260909-0012	2026-11-04	09:00:00	14:00:00	Birthday Function	250	cancelled	60000.00	5000.00	0.00	0.00	65000.00	\N	\N	1	2026-10-02 08:03:24.393955	2026-10-02 08:04:02.351107	\N	2026-09-09 07:29:37.006753	2026-10-02 08:04:02.351107	0	\N	\N	\N
19	4	AP-20260913-0019	2026-10-06	10:00:00	15:00:00	Wedding Function	300	completed	40000.00	5000.00	0.00	0.00	45000.00	\N	\N	\N	\N	\N	\N	2026-09-13 18:28:17.067895	2026-10-11 10:56:20.079472	0	\N	\N	\N
17	17	AP-20260912-0017	2026-09-20	09:00:00	14:00:00	School Event	200	completed	20000.00	0.00	0.00	0.00	20000.00	\N	\N	\N	2026-09-12 14:21:08.735721	\N	\N	2026-09-12 14:20:44.651361	2026-10-11 10:56:20.079472	0	\N	\N	\N
16	17	AP-20260912-0016	2026-09-19	09:00:00	14:00:00	School Event	150	completed	20000.00	0.00	0.00	0.00	20000.00	\N	\N	1	2026-09-13 17:10:36.025892	\N	\N	2026-09-12 14:02:01.011781	2026-10-11 10:56:20.079472	0	\N	\N	\N
8	6	AP-20260704-0008	2026-07-25	16:00:00	22:00:00	Wedding Function	220	completed	85000.00	0.00	0.00	0.00	85000.00	Traditional setup. Separate seating for males and females.	\N	\N	2026-07-05 15:08:55.659468	\N	\N	2026-05-29 11:35:02.45325	2026-10-11 10:56:20.079472	0	\N	\N	\N
40	6	AP-20260922-0040	2026-10-09	09:00:00	14:00:00	School Event	500	completed	20000.00	0.00	0.00	0.00	20000.00	\N	\N	\N	2026-09-22 03:26:47.72479	\N	\N	2026-09-22 03:15:05.558353	2026-10-11 10:56:20.079472	0	\N	\N	\N
21	17	AP-20260913-0021	2026-10-10	11:00:00	16:00:00	Birthday Function	280	completed	60000.00	0.00	2000.00	0.00	58000.00	\N	\N	\N	\N	\N	\N	2026-09-13 18:28:17.689117	2026-10-11 10:56:20.079472	0	\N	\N	\N
7	5	AP-20260703-0007	2026-07-12	15:00:00	21:00:00	Birthday Function	80	completed	45000.00	8000.00	2000.00	5100.00	56100.00	Unicorn theme. 5-year-old birthday. No spicy food.	\N	3	2026-05-01 09:00:00	\N	\N	2026-05-29 11:35:02.45325	2026-10-11 10:56:20.079472	0	\N	\N	\N
39	6	AP-20260921-0039	2026-10-03	09:00:00	14:00:00	School Event	450	completed	20000.00	0.00	0.00	0.00	20000.00	\N	\N	\N	2026-09-21 17:49:12.011062	\N	\N	2026-09-21 17:48:41.775551	2026-10-11 10:56:20.079472	0	\N	\N	2026-10-02 02:09:03.665478+05:30
59	6	AP-20261010-0059	2026-10-11	09:00:00	14:00:00	Other	1100	confirmed	30000.00	0.00	0.00	0.00	30000.00	\N	\N	\N	2026-10-10 16:47:11.210157	\N	\N	2026-10-10 16:38:58.340091	2026-10-10 16:47:11.210157	0	Waleema	\N	\N
54	17	AP-20261008-0054	2026-10-19	09:00:00	14:00:00	Political Event (Large)	500	confirmed	35000.00	25000.00	0.00	0.00	60000.00	\N	\N	3	2026-10-10 17:14:28.264561	\N	\N	2026-10-08 11:29:54.402784	2026-10-10 17:14:28.264561	5	\N	\N	\N
44	1	AP-20260928-0044	2026-10-01	10:00:00	14:00:00	Political Event	400	completed	30000.00	15000.00	0.00	0.00	45000.00	\N	\N	\N	2026-09-28 10:50:15.117542	\N	\N	2026-09-28 10:48:59.250054	2026-10-11 10:56:20.079472	3	\N	\N	\N
24	6	AP-20260913-0024	2026-10-16	09:00:00	13:00:00	Political Event	240	confirmed	35000.00	0.00	0.00	0.00	35000.00	\N	\N	\N	\N	\N	\N	2026-09-13 18:28:18.565165	2026-09-27 13:05:44.363328	0	\N	\N	\N
13	17	AP-20260912-0013	2026-09-17	09:00:00	14:00:00	Birthday Function	300	confirmed	60000.00	0.00	0.00	0.00	60000.00	\N	\N	1	2026-10-19 14:01:43.654569	\N	\N	2026-09-12 13:22:11.787401	2026-10-19 14:01:43.654569	0	\N	\N	\N
11	17	AP-20260621-0011	2026-08-15	10:00:00	14:00:00	Wedding Function	350	confirmed	40000.00	0.00	0.00	0.00	40000.00	\N	\N	1	2026-10-19 14:01:45.771173	\N	\N	2026-06-21 17:31:52.981132	2026-10-19 14:01:45.771173	0	\N	\N	\N
9	7	AP-20260805-0009	2026-08-08	18:00:00	22:00:00	Birthday Function	120	confirmed	50000.00	0.00	0.00	0.00	50000.00	Buffet style. Backdrop with photos.	\N	1	2026-10-19 14:01:46.689501	\N	\N	2026-05-29 11:35:02.45325	2026-10-19 14:01:46.689501	0	\N	\N	\N
38	6	AP-20260921-0038	2026-10-02	09:00:00	14:00:00	School Event	500	confirmed	20000.00	0.00	0.00	0.00	20000.00	pdf download check..	\N	1	2026-10-19 14:01:53.948962	\N	\N	2026-09-21 05:25:07.527505	2026-10-19 14:01:53.948962	0	\N	\N	\N
37	6	AP-20260920-0037	2026-09-30	09:00:00	14:00:00	School Event	400	confirmed	20000.00	0.00	0.00	0.00	20000.00	note..	\N	1	2026-10-19 14:01:55.360922	\N	\N	2026-09-20 17:08:20.841221	2026-10-19 14:01:55.360922	0	\N	\N	\N
43	1	AP-20260927-0043	2026-09-27	09:00:00	14:00:00	Political Event	500	cancelled	30000.00	25000.00	0.00	0.00	55000.00	\N	\N	\N	\N	2026-10-19 14:02:32.665887	cancellation test.	2026-09-27 12:52:15.459184	2026-10-19 14:02:32.665887	0	\N	\N	\N
36	18	AP-20260920-0036	2026-09-25	09:00:00	14:00:00	Birthday Function	300	cancelled	60000.00	15000.00	0.00	0.00	75000.00	some note..	\N	\N	\N	2026-10-19 14:03:00.858006	testing..	2026-09-20 17:06:10.407658	2026-10-19 14:03:00.858006	0	\N	\N	\N
58	1	AP-20261010-0058	2026-11-23	09:00:00	14:00:00	Birthday Function	250	confirmed	60000.00	25000.00	0.00	0.00	85000.00	\N	\N	1	2026-10-19 14:05:13.165625	\N	\N	2026-10-10 10:16:50.822843	2026-10-19 14:05:13.165625	5	\N	\N	\N
57	6	AP-20261010-0057	2026-11-10	09:00:00	14:00:00	Birthday Function	250	confirmed	60000.00	0.00	0.00	0.00	60000.00	\N	\N	1	2026-10-19 14:05:13.276929	\N	\N	2026-10-10 09:24:48.263554	2026-10-19 14:05:13.276929	0	\N	\N	\N
30	11	AP-20260913-0030	2026-10-28	09:00:00	14:00:00	School Event	170	confirmed	20000.00	0.00	0.00	0.00	20000.00	\N	\N	1	2026-10-19 14:05:13.776973	\N	\N	2026-09-13 18:28:20.35202	2026-10-19 14:05:13.776973	0	\N	\N	\N
27	4	AP-20260913-0027	2026-10-22	10:00:00	15:00:00	Wedding Function	340	confirmed	40000.00	0.00	0.00	0.00	40000.00	\N	\N	1	2026-10-19 14:05:13.983489	\N	\N	2026-09-13 18:28:19.480985	2026-10-19 14:05:13.983489	0	\N	\N	\N
22	11	AP-20260913-0022	2026-10-12	09:00:00	14:00:00	School Event	160	confirmed	20000.00	0.00	0.00	0.00	20000.00	\N	\N	1	2026-10-19 14:05:14.874218	\N	\N	2026-09-13 18:28:17.996105	2026-10-19 14:05:14.874218	0	\N	\N	\N
20	6	AP-20260913-0020	2026-10-07	09:00:00	13:00:00	Political Event	220	confirmed	30000.00	0.00	0.00	0.00	30000.00	\N	\N	1	2026-10-19 14:05:15.011706	\N	\N	2026-09-13 18:28:17.380173	2026-10-19 14:05:15.011706	0	\N	\N	\N
18	17	AP-20260913-0018	2026-10-05	09:00:00	14:00:00	School Event	180	confirmed	20000.00	0.00	0.00	0.00	20000.00	\N	\N	1	2026-10-19 14:05:15.075983	\N	\N	2026-09-13 18:28:16.772143	2026-10-19 14:05:15.075983	0	\N	\N	\N
41	6	AP-20260922-0041	2026-09-27	09:00:00	14:00:00	School Event	250	confirmed	20000.00	0.00	0.00	0.00	20000.00	\N	\N	1	2026-10-19 14:05:15.131077	\N	\N	2026-09-22 09:08:21.348787	2026-10-19 14:05:15.131077	0	\N	\N	\N
35	6	AP-20260919-0035	2026-09-26	09:00:00	14:00:00	School Event	400	confirmed	20000.00	0.00	0.00	0.00	20000.00	\N	\N	1	2026-10-19 14:05:15.17929	\N	\N	2026-09-19 00:55:14.200457	2026-10-19 14:05:15.17929	0	\N	\N	\N
34	17	AP-20260919-0034	2026-09-25	09:00:00	14:00:00	School Event	500	confirmed	20000.00	0.00	0.00	0.00	20000.00	\N	\N	1	2026-10-19 14:05:15.298898	\N	\N	2026-09-19 00:51:32.775711	2026-10-19 14:05:15.298898	0	\N	\N	\N
32	17	AP-20260918-0032	2026-09-23	09:00:00	14:00:00	School Event	550	confirmed	20000.00	5000.00	0.00	0.00	25000.00	note	\N	1	2026-10-19 14:05:15.392216	\N	\N	2026-09-18 02:16:24.995477	2026-10-19 14:05:15.392216	0	\N	\N	\N
55	17	AP-20261010-0055	2026-10-21	09:00:00	14:00:00	Political Event	100	confirmed	30000.00	0.00	0.00	0.00	30000.00	\N	\N	1	2026-10-19 14:05:14.03962	\N	\N	2026-10-10 01:33:30.401143	2026-10-20 15:00:02.156965	0	\N	\N	2026-10-20 15:00:02.156965+05:30
56	17	AP-20261010-0056	2026-10-20	09:00:00	14:00:00	School Event	200	cancelled	20000.00	0.00	0.00	0.00	20000.00	\N	\N	\N	\N	2026-10-20 15:06:20.441046	Date conflict. Please Book another date.	2026-10-10 01:34:25.234623	2026-10-20 15:06:20.441046	0	\N	\N	\N
28	6	AP-20260913-0028	2026-10-24	09:00:00	13:00:00	Political Event	210	completed	30000.00	0.00	0.00	0.00	30000.00	\N	\N	\N	\N	\N	\N	2026-09-13 18:28:19.741079	2026-09-27 13:05:44.363328	0	\N	\N	\N
25	17	AP-20260913-0025	2026-10-18	11:00:00	16:00:00	Birthday Function	260	confirmed	60000.00	0.00	0.00	0.00	60000.00	\N	\N	1	2026-09-19 07:13:58.635476	\N	\N	2026-09-13 18:28:18.860393	2026-09-27 13:05:44.363328	0	\N	\N	\N
46	17	AP-20260929-0046	2026-10-15	09:00:00	14:00:00	School Event	150	confirmed	20000.00	0.00	0.00	0.00	20000.00	\N	\N	\N	2026-09-29 08:47:44.711071	\N	\N	2026-09-29 08:45:17.142405	2026-09-29 08:47:44.711071	0	\N	\N	\N
48	17	AP-20260930-0048	2026-11-21	09:00:00	14:00:00	School Event	200	confirmed	20000.00	10000.00	0.00	0.00	30000.00	\N	\N	\N	2026-09-30 07:06:33.024888	\N	\N	2026-09-30 07:06:01.557981	2026-09-30 07:06:33.024888	2	\N	\N	\N
45	17	AP-20260929-0045	2026-11-13	09:00:00	21:00:00	Wedding Function	1000	confirmed	40000.00	15000.00	0.00	0.00	55000.00	Note..	\N	1	2026-10-02 08:14:58.561643	\N	\N	2026-09-29 08:42:36.578396	2026-10-02 08:14:58.561643	3	\N	\N	\N
49	17	AP-20261007-0049	2026-10-15	09:00:00	14:00:00	Birthday Function	450	pending	60000.00	10000.00	0.00	0.00	70000.00	I want special decorations and catering.	\N	\N	\N	\N	\N	2026-10-07 09:56:39.709705	2026-10-07 09:56:39.709705	2	\N	\N	\N
52	6	AP-20261007-0052	2027-01-15	09:00:00	14:00:00	School Event	450	confirmed	20000.00	0.00	0.00	0.00	20000.00	\N	\N	\N	2026-10-07 10:21:13.850363	\N	\N	2026-10-07 10:20:10.485438	2026-10-07 10:21:13.850363	0	\N	\N	\N
61	17	AP-20261014-0061	2026-11-26	09:00:00	14:00:00	School Event	500	confirmed	20000.00	0.00	0.00	0.00	20000.00	\N	\N	\N	2026-10-14 14:28:24.627257	\N	\N	2026-10-14 14:25:33.204911	2026-10-14 14:28:24.627257	0	\N	\N	\N
63	6	AP-20261017-0063	2026-11-02	09:00:00	14:00:00	School Event	150	confirmed	20000.00	0.00	0.00	0.00	20000.00	\N	\N	\N	2026-10-17 10:10:11.899976	\N	\N	2026-10-17 09:55:57.878503	2026-10-17 10:10:11.899976	0	\N	\N	\N
1	4	AP-20260101-0001	2026-01-15	14:00:00	22:00:00	Wedding Function	350	completed	130000.00	25000.00	5000.00	15000.00	165000.00	Vegetarian menu preferred. Flower arch at entrance.	\N	1	2025-12-20 10:00:00	\N	\N	2026-05-29 11:35:02.45325	2026-10-17 21:31:12.988817	0	\N	\N	\N
2	5	AP-20260102-0002	2026-02-10	16:00:00	22:00:00	Wedding Function	200	completed	85000.00	15000.00	0.00	10000.00	110000.00	Pink and gold colour theme.	\N	1	2026-01-05 11:00:00	\N	\N	2026-05-29 11:35:02.45325	2026-10-17 21:31:12.988817	0	\N	\N	\N
3	6	AP-20260103-0003	2026-03-05	12:00:00	22:00:00	Wedding Function	450	completed	200000.00	30000.00	10000.00	22000.00	242000.00	Live nasheeds performance. No music.	\N	1	2026-01-15 09:00:00	\N	\N	2026-05-29 11:35:02.45325	2026-10-17 21:31:12.988817	0	\N	\N	\N
5	8	AP-20260601-0005	2026-06-14	15:00:00	22:00:00	Wedding Function	300	completed	130000.00	20000.00	0.00	15000.00	165000.00	Indoor garden theme. Fountain setup requested.	\N	1	2026-04-10 10:00:00	\N	\N	2026-05-29 11:35:02.45325	2026-10-17 21:31:12.988817	0	\N	\N	\N
6	4	AP-20260602-0006	2026-06-28	17:00:00	22:00:00	Wedding Function	150	completed	75000.00	10000.00	0.00	8500.00	93500.00	Surprise engagement. Keep venue decoration secret.	\N	1	2026-04-15 11:00:00	\N	\N	2026-05-29 11:35:02.45325	2026-10-17 21:31:12.988817	0	\N	\N	\N
4	7	AP-20260104-0004	2026-03-22	08:00:00	16:00:00	Political Event	180	completed	95000.00	10000.00	5000.00	10000.00	110000.00	Projector needed. Tea break at 10:30 AM and 3:00 PM.	\N	1	2026-02-01 14:00:00	\N	\N	2026-05-29 11:35:02.45325	2026-10-17 21:31:12.988817	0	\N	\N	\N
68	6	AP-20261018-0068	2026-11-28	09:00:00	17:00:00	Political Event	250	confirmed	30000.00	0.00	0.00	0.00	30000.00	\N	\N	\N	2026-10-18 22:41:04.573946	\N	\N	2026-10-18 22:40:02.649991	2026-10-18 22:41:04.573946	0	\N	\N	\N
53	17	AP-20261008-0053	2026-10-27	09:00:00	14:00:00	School Event	150	confirmed	20000.00	5000.00	0.00	0.00	25000.00	\N	\N	1	2026-10-19 14:05:13.872802	\N	\N	2026-10-08 05:08:12.584208	2026-10-19 14:05:13.872802	1	\N	\N	\N
65	17	AP-20261018-0065	2026-11-26	09:00:00	14:00:00	School Event	250	cancelled	20000.00	0.00	0.00	0.00	20000.00	\N	\N	\N	\N	2026-10-20 15:39:23.557157	\N	2026-10-18 19:53:25.8643	2026-10-20 15:39:23.557157	0	\N	\N	\N
69	17	AP-20261019-0069	2026-12-20	09:00:00	14:00:00	Other	450	confirmed	30000.00	0.00	0.00	0.00	30000.00	\N	\N	\N	2026-10-19 13:58:20.670285	\N	\N	2026-10-19 13:58:00.85241	2026-10-19 13:58:20.670285	0	Engagement Party	\N	\N
60	1	AP-20261013-0060	2027-01-12	09:00:00	14:00:00	School Event	250	confirmed	20000.00	5000.00	0.00	0.00	25000.00	\N	\N	1	2026-10-19 14:05:12.21235	\N	\N	2026-10-13 21:52:55.961232	2026-10-19 14:05:12.21235	1	\N	\N	\N
50	17	AP-20261007-0050	2026-12-19	09:00:00	14:00:00	School Event	450	confirmed	20000.00	0.00	0.00	0.00	20000.00	\N	\N	1	2026-10-19 14:05:12.336458	\N	\N	2026-10-07 09:58:55.050628	2026-10-19 14:05:12.336458	0	\N	\N	\N
51	17	AP-20261007-0051	2026-12-15	09:00:00	14:00:00	Birthday Function	450	confirmed	60000.00	10000.00	0.00	0.00	70000.00	I want Special Decorations and caterings.	\N	1	2026-10-19 14:05:12.387694	\N	\N	2026-10-07 10:00:46.869445	2026-10-19 14:05:12.387694	2	\N	\N	\N
64	17	AP-20261017-0064	2026-12-01	09:00:00	14:00:00	School Event	300	confirmed	20000.00	0.00	0.00	0.00	20000.00	\N	\N	1	2026-10-19 14:05:12.461108	\N	\N	2026-10-17 23:50:40.583142	2026-10-19 14:05:12.461108	0	\N	\N	\N
66	6	AP-20261018-0066	2026-11-18	09:00:00	14:00:00	Political Event (Large)	400	confirmed	35000.00	15000.00	0.00	0.00	50000.00	\N	\N	1	2026-10-19 14:05:13.238822	\N	\N	2026-10-18 21:06:43.106062	2026-10-19 14:05:13.238822	3	\N	\N	\N
67	6	AP-20261018-0067	2026-11-07	09:00:00	14:00:00	Wedding Function	1000	confirmed	40000.00	25000.00	0.00	0.00	65000.00	\N	\N	1	2026-10-19 14:05:13.320126	\N	\N	2026-10-18 21:10:35.27566	2026-10-19 14:05:13.320126	5	\N	\N	\N
47	17	AP-20260930-0047	2026-10-10	09:00:00	14:00:00	School Event	200	confirmed	20000.00	0.00	0.00	0.00	20000.00	\N	\N	1	2026-10-19 14:05:14.959312	\N	\N	2026-09-30 07:03:57.254158	2026-10-19 14:05:14.959312	0	\N	\N	\N
62	1	AP-20261017-0062	2026-11-02	09:00:00	14:00:00	School Event	250	cancelled	20000.00	0.00	0.00	0.00	20000.00	\N	\N	\N	\N	2026-10-19 14:06:12.848282	test.	2026-10-17 09:20:02.005036	2026-10-19 14:06:12.848282	0	\N	\N	\N
26	11	AP-20260913-0026	2026-10-20	09:00:00	14:00:00	School Event	190	confirmed	20000.00	0.00	0.00	0.00	20000.00	\N	\N	\N	\N	\N	\N	2026-09-13 18:28:19.225116	2026-10-19 15:00:01.871245	0	\N	\N	2026-10-19 09:00:01.351489+05:30
70	17	AP-20261020-0070	2026-12-24	09:00:00	14:00:00	Birthday Function	250	confirmed	60000.00	15000.00	0.00	0.00	75000.00	\N	\N	1	2026-10-20 15:07:37.394084	\N	\N	2026-10-20 13:35:43.696036	2026-10-20 15:07:37.394084	3	\N	\N	\N
\.


--
-- Data for Name: catering_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.catering_orders (order_id, booking_id, menu_items, total_cost, guest_count, status, special_notes, delivery_time, confirmed_at, delivered_at, created_at, updated_at) FROM stdin;
5	8	[{"item_id": 20, "discount": 0, "quantity": 10, "subtotal": 4750, "item_name": "Chicken Biryani", "unit_price": 475}]	4750.00	10	delivered	\N	\N	2026-09-08 08:37:19.460106	2026-09-08 08:39:35.830269	2026-09-08 08:14:39.377323	2026-09-08 08:39:35.830269
7	8	[{"item_id": 20, "discount": 0, "quantity": 10, "subtotal": 4750, "item_name": "Chicken Biryani", "unit_price": 475}]	4750.00	10	cancelled	\N	\N	\N	\N	2026-09-08 08:45:13.164107	2026-09-08 08:47:29.588942
10	33	[{"item_id": 8, "discount": 0, "quantity": 1, "subtotal": 200, "item_name": "Samosa Platter", "unit_price": 200}, {"item_id": 14, "discount": 0, "quantity": 1, "subtotal": 80, "item_name": "Soft Drinks Pack", "unit_price": 80}]	280.00	100	pending	\N	\N	\N	\N	2026-09-18 02:23:50.684025	2026-09-18 02:23:50.684025
11	34	[{"item_id": 16, "discount": 0, "quantity": 1, "subtotal": 120, "item_name": "Faluda", "unit_price": 120}, {"item_id": 18, "discount": 0, "quantity": 1, "subtotal": 6500, "item_name": "Birthday Cake (2kg)", "unit_price": 6500}]	6620.00	500	pending	\N	\N	\N	\N	2026-09-19 00:51:34.003463	2026-09-19 00:51:34.003463
14	37	[{"item_id": 13, "discount": 0, "quantity": 1, "subtotal": 350, "item_name": "Chocolate Fountain", "unit_price": 350}, {"item_id": 15, "discount": 0, "quantity": 1, "subtotal": 150, "item_name": "Fresh Juice Bar", "unit_price": 150}]	500.00	400	delivered	\N	\N	2026-09-20 17:12:46.170666	2026-09-20 17:13:12.585184	2026-09-20 17:08:24.733747	2026-09-20 17:13:12.585184
16	42	[{"item_id": 15, "discount": 0, "quantity": 5, "subtotal": 750, "item_name": "Fresh Juice Bar", "unit_price": 150}]	750.00	300	pending	\N	\N	\N	\N	2026-09-24 10:50:25.074905	2026-09-24 10:50:25.074905
1	1	[{"item_id": 1, "discount": 0, "quantity": 350, "subtotal": 122500, "item_name": "Rice and Curry", "unit_price": 350}, {"item_id": 8, "discount": 0, "quantity": 350, "subtotal": 42000, "item_name": "Watalappan", "unit_price": 120}, {"item_id": 14, "discount": 0, "quantity": 350, "subtotal": 28000, "item_name": "Soft Drinks", "unit_price": 80}, {"item_id": 17, "discount": 0, "quantity": 1, "subtotal": 15000, "item_name": "Wedding Cake 3-tier", "unit_price": 15000}]	178650.00	350	delivered	Vegetarian menu. No beef.	16:00:00	2025-12-20 10:00:00	\N	2026-05-29 11:36:22.715789	2026-09-26 10:29:51.762212
12	35	[{"item_id": 16, "discount": 0, "quantity": 1, "subtotal": 120, "item_name": "Faluda", "unit_price": 120}, {"item_id": 18, "discount": 0, "quantity": 1, "subtotal": 6500, "item_name": "Birthday Cake (2kg)", "unit_price": 6500}]	6620.00	400	cancelled	\N	\N	2026-09-27 13:55:54.387225	\N	2026-09-19 00:55:15.284789	2026-09-27 13:57:34.498981
15	40	[{"item_id": 15, "discount": 0, "quantity": 5, "subtotal": 750, "item_name": "Fresh Juice Bar", "unit_price": 150}]	750.00	500	cancelled	\N	\N	2026-10-06 07:25:58.087275	\N	2026-09-22 03:15:10.413689	2026-10-06 07:29:03.902598
8	1	[{"item_id": 1, "discount": 0, "quantity": 2, "subtotal": 700, "item_name": "Rice and Curry (Full Meal)", "unit_price": 350}]	700.00	50	cancelled	\N	\N	\N	\N	2026-09-17 05:35:24.050512	2026-10-11 08:00:25.261768
6	6	[{"item_id": 20, "discount": 0, "quantity": 10, "subtotal": 4750, "item_name": "Chicken Biryani", "unit_price": 475}]	4750.00	10	delivered	\N	\N	2026-10-11 08:00:45.036266	2026-10-11 08:00:51.964108	2026-09-08 08:21:03.469871	2026-10-11 08:00:51.964108
9	32	[{"item_id": 7, "discount": 0, "quantity": 2, "subtotal": 500, "item_name": "Short Eats Platter", "unit_price": 250}, {"item_id": 16, "discount": 0, "quantity": 1, "subtotal": 120, "item_name": "Faluda", "unit_price": 120}]	620.00	550	cancelled	\N	\N	\N	\N	2026-09-18 02:16:26.099353	2026-10-11 08:01:20.477534
13	36	[{"item_id": 15, "discount": 0, "quantity": 3, "subtotal": 450, "item_name": "Fresh Juice Bar", "unit_price": 150}, {"item_id": 17, "discount": 0, "quantity": 1, "subtotal": 15000, "item_name": "Wedding Cake (3-tier)", "unit_price": 15000}]	15450.00	300	delivered	\N	\N	2026-09-20 17:13:35.113573	2026-10-11 08:01:41.31129	2026-09-20 17:06:14.597766	2026-10-11 08:01:41.31129
2	2	[{"item_id": 2, "discount": 0, "quantity": 200, "subtotal": 90000, "item_name": "Chicken Biriyani", "unit_price": 450}, {"item_id": 11, "discount": 0, "quantity": 200, "subtotal": 30000, "item_name": "Fruit Salad", "unit_price": 150}, {"item_id": 15, "discount": 0, "quantity": 200, "subtotal": 30000, "item_name": "Fresh Juice", "unit_price": 150}, {"item_id": 19, "discount": 0, "quantity": 1, "subtotal": 5500, "item_name": "Engagement Cake", "unit_price": 5500}]	131500.00	200	delivered	Pink colour theme cake.	17:00:00	2026-01-05 11:00:00	\N	2026-05-29 11:36:22.715789	2026-09-26 10:29:51.762212
18	45	[{"item_id": 17, "discount": 0, "quantity": 1, "subtotal": 15000, "item_name": "Wedding Cake (3-tier)", "unit_price": 15000}]	15000.00	1000	pending	\N	\N	\N	\N	2026-09-29 08:42:47.005894	2026-09-29 08:42:47.005894
21	48	[{"item_id": 14, "discount": 0, "quantity": 200, "subtotal": 16000, "item_name": "Soft Drinks Pack", "unit_price": 80}]	16000.00	200	delivered	\N	\N	2026-10-05 16:12:14.930406	2026-10-05 16:12:21.994502	2026-09-30 07:06:12.012037	2026-10-05 16:12:21.994502
19	46	[{"item_id": 12, "discount": 0, "quantity": 150, "subtotal": 27000, "item_name": "Ice Cream (3 scoops)", "unit_price": 180}]	27000.00	150	confirmed	\N	\N	2026-10-05 16:12:30.743406	\N	2026-09-29 08:45:24.208076	2026-10-05 16:12:30.743406
17	44	[{"item_id": 15, "discount": 0, "quantity": 400, "subtotal": 60000, "item_name": "Fresh Juice Bar", "unit_price": 150}]	60000.00	400	cancelled	\N	\N	\N	\N	2026-09-28 10:49:03.998362	2026-10-05 16:12:40.664696
22	49	[{"item_id": 18, "discount": 0, "quantity": 1, "subtotal": 6500, "item_name": "Birthday Cake (2kg)", "unit_price": 6500}]	6500.00	450	pending	\N	\N	\N	\N	2026-10-07 09:56:47.149065	2026-10-07 09:56:47.149065
23	51	[{"item_id": 18, "discount": 0, "quantity": 1, "subtotal": 6500, "item_name": "Birthday Cake (2kg)", "unit_price": 6500}]	6500.00	450	pending	\N	\N	\N	\N	2026-10-07 10:00:51.322035	2026-10-07 10:00:51.322035
24	58	[{"item_id": 9, "discount": 0, "quantity": 250, "subtotal": 45000, "item_name": "Bruschetta", "unit_price": 180}]	45000.00	250	pending	\N	\N	\N	\N	2026-10-10 10:16:55.630313	2026-10-10 10:16:55.630313
20	47	[{"item_id": 14, "discount": 0, "quantity": 200, "subtotal": 16000, "item_name": "Soft Drinks Pack", "unit_price": 80}]	16000.00	200	delivered	\N	\N	2026-10-10 17:41:56.090417	2026-10-10 17:42:12.604415	2026-09-30 07:04:06.674338	2026-10-10 17:42:12.604415
25	59	[{"item_id": 6, "discount": 0, "quantity": 1100, "subtotal": 418000, "item_name": "Fried Rice with Chicken", "unit_price": 380}]	418000.00	1100	delivered	\N	\N	2026-10-10 17:42:24.663966	2026-10-11 07:59:28.648812	2026-10-10 16:39:04.591902	2026-10-11 07:59:28.648812
3	5	[{"item_id": 1, "discount": 0, "quantity": 300, "subtotal": 105000, "item_name": "Rice and Curry", "unit_price": 350}, {"item_id": 7, "discount": 0, "quantity": 300, "subtotal": 75000, "item_name": "Short Eats", "unit_price": 250}, {"item_id": 10, "discount": 0, "quantity": 300, "subtotal": 36000, "item_name": "Watalappan", "unit_price": 120}, {"item_id": 14, "discount": 0, "quantity": 300, "subtotal": 24000, "item_name": "Soft Drinks", "unit_price": 80}, {"item_id": 17, "discount": 0, "quantity": 1, "subtotal": 15000, "item_name": "Wedding Cake", "unit_price": 15000}]	243000.00	300	cancelled	Indoor garden theme. Fountain display.	17:30:00	2026-04-10 10:00:00	\N	2026-05-29 11:36:22.715789	2026-10-11 08:00:32.982099
4	7	[{"item_id": 6, "discount": 0, "quantity": 1, "subtotal": 6500, "item_name": "Birthday Cake 2kg", "unit_price": 6500}, {"item_id": 12, "discount": 0, "quantity": 80, "subtotal": 14400, "item_name": "Ice Cream", "unit_price": 180}, {"item_id": 13, "discount": 0, "quantity": 80, "subtotal": 28000, "item_name": "Chocolate Fountain", "unit_price": 350}, {"item_id": 14, "discount": 0, "quantity": 80, "subtotal": 6400, "item_name": "Soft Drinks", "unit_price": 80}]	54900.00	80	delivered	Unicorn theme cake. No nuts.	15:30:00	2026-10-11 08:01:05.87354	2026-10-11 08:01:09.920668	2026-05-29 11:36:22.715789	2026-10-11 08:01:09.920668
26	60	[{"item_id": 7, "discount": 0, "quantity": 250, "subtotal": 62500, "item_name": "Short Eats Platter", "unit_price": 250}]	62500.00	250	pending	\N	\N	\N	\N	2026-10-13 21:53:00.217398	2026-10-13 21:53:00.217398
27	61	[{"item_id": 7, "discount": 0, "quantity": 500, "subtotal": 125000, "item_name": "Short Eats Platter", "unit_price": 250}]	125000.00	500	pending	\N	\N	\N	\N	2026-10-14 14:25:39.045106	2026-10-14 14:25:39.045106
28	66	[{"item_id": 10, "discount": 0, "quantity": 400, "subtotal": 48000, "item_name": "Watalappan", "unit_price": 120}]	48000.00	400	pending	\N	\N	\N	\N	2026-10-18 21:06:43.547938	2026-10-18 21:06:43.547938
29	68	[{"item_id": 6, "discount": 0, "quantity": 250, "subtotal": 95000, "item_name": "Fried Rice with Chicken", "unit_price": 380}]	95000.00	250	pending	\N	\N	\N	\N	2026-10-18 22:40:06.987764	2026-10-18 22:40:06.987764
30	69	[{"item_id": 13, "discount": 0, "quantity": 450, "subtotal": 157500, "item_name": "Chocolate Fountain", "unit_price": 350}]	157500.00	450	pending	\N	\N	\N	\N	2026-10-19 13:58:04.984758	2026-10-19 13:58:04.984758
31	70	[{"item_id": 18, "discount": 0, "quantity": 1, "subtotal": 6500, "item_name": "Birthday Cake (2kg)", "unit_price": 6500}]	6500.00	250	pending	\N	\N	\N	\N	2026-10-20 13:35:46.115	2026-10-20 13:35:46.115
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
1	1	Guest Arrival & Registration	14:00:00	14:30:00	Front Desk Staff	Welcome guests at entrance	1	2026-05-29 11:36:00.511961	other	\N
2	1	Nikah Ceremony	14:30:00	15:30:00	Islamic Scholar	Ceremony at stage area	2	2026-05-29 11:36:00.511961	other	\N
3	1	Family Photo Session	15:30:00	16:00:00	Photographer	Group photos at backdrop	3	2026-05-29 11:36:00.511961	other	\N
4	1	Dinner Buffet Opens	16:00:00	18:00:00	Catering Team	Althab Restaurant service	4	2026-05-29 11:36:00.511961	other	\N
5	1	Cultural Programme	18:00:00	20:00:00	Event Organizer	Nasheeds and speeches	5	2026-05-29 11:36:00.511961	other	\N
6	1	Cake Cutting & Desserts	20:00:00	21:00:00	Event Organizer	Wedding cake cutting	6	2026-05-29 11:36:00.511961	other	\N
7	1	Farewell & Cleanup	21:00:00	22:00:00	Hall Staff	Guest departure	7	2026-05-29 11:36:00.511961	other	\N
8	5	Venue Setup & Decoration	10:00:00	14:00:00	Riyaz Events	Indoor garden setup	1	2026-05-29 11:36:00.511961	other	\N
9	5	Guest Arrival	15:00:00	15:30:00	Front Desk Staff	Welcome at entrance arch	2	2026-05-29 11:36:00.511961	other	\N
10	5	Wedding Ceremony	15:30:00	17:00:00	Event Coordinator	Main ceremony at stage	3	2026-05-29 11:36:00.511961	other	\N
11	5	Photography Session	17:00:00	17:30:00	Photographer	Couple and family photos	4	2026-05-29 11:36:00.511961	other	\N
12	5	Dinner Service	17:30:00	20:00:00	Catering Team	Catering by Althab	5	2026-05-29 11:36:00.511961	other	\N
13	5	Entertainment	20:00:00	21:30:00	DJ / Nasheed	Cultural entertainment	6	2026-05-29 11:36:00.511961	other	\N
14	5	Cake & Sweets	21:30:00	22:00:00	Event Organizer	Dessert and farewell	7	2026-05-29 11:36:00.511961	other	\N
15	17	Setup	08:00:00	12:00:00	Event Coordinator	just time has been changed to 12.00pm.	1	2026-09-13 06:29:48.324355	other	\N
16	17	Cleanup	12:30:00	13:30:00	\N	\N	2	2026-09-13 06:49:58.411553	other	\N
17	59	Chair Arrangement	09:00:00	10:00:00	Event Coordinator / Customer	Arrange minimum 1100 chairs.	1	2026-10-11 08:10:15.481238	setup	\N
20	59	Hall & Floor Cleanup.	15:00:00	17:00:00	Event Coordinator / Cleaning Workers (Azath Plaza)	Clean the hall properly as it is before the event.	4	2026-10-11 08:23:12.907708	cleanup	\N
18	59	Decorations, Hall Arrangement	10:00:00	23:30:00	Event Coordinator	For Waleema, Arrange the hall properly to manage foods and other related activities smoothly.	2	2026-10-11 08:14:58.751755	decoration	\N
19	59	Food Supply Arrangements.	11:45:00	12:30:00	Althaf Hotel / Event Organizer	Arrange foods for all event attendees in a timely manner.	3	2026-10-11 08:19:05.860629	catering	\N
21	49	Stage Setup	07:00:00	09:00:00	Event Organizer	\N	1	2026-10-14 20:48:53.349504	setup	\N
22	49	Dinner Service	12:00:00	13:00:00	Althaf Hotel	\N	2	2026-10-14 20:50:16.306046	catering	\N
23	49	Floor Cleanup	16:00:00	17:00:00	Event Coordinator	\N	3	2026-10-14 20:51:55.014848	cleanup	\N
\.


--
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.feedback (feedback_id, booking_id, user_id, rating, title, comment, is_public, admin_reply, replied_at, created_at, reply_read_at, event_name, event_date, hall_name) FROM stdin;
1	1	4	5	Absolutely Perfect Wedding!	Aazath Plaza made our wedding day truly unforgettable. The hall was beautifully decorated, the catering from Althab was excellent, and the staff were so helpful and professional. Highly recommended!	t	\N	\N	2026-05-29 11:37:05.661111	\N	\N	\N	\N
12	8	6	5	A smooth and memorable wedding day.	Hall 1 was nicely decorated, and all our guests were seated comfortably. The staff were helpful from the booking to the end of the event, and the setup was ready on time. The only small issue was limited parking near the entrance. Overall, we were very happy with the service and would recommend Aazath Plaza.	t	Thank you very much for your feedback!	2026-10-12 10:03:13.792566	2026-10-11 16:16:05.236759	\N	\N	\N	\N
3	3	6	4	Grand Wedding Reception	Our wedding reception was grand and well-organised. The Platinum Package was worth every rupee. Only minor issue was parking space was a bit limited. Overall excellent experience.	t	Thank you for your feedback!	2026-10-11 10:50:42.141956	2026-05-29 11:37:05.661111	2026-10-12 15:34:05.7104+05:30	\N	\N	\N
14	21	17	5	My First Feedback ... !	some info ..	t	Admin Reply for the Feedback !	2026-10-14 14:55:07.225456	2026-10-14 14:52:44.378848	\N	\N	\N	\N
13	17	17	3	Good venue, but the event ran into some delays.	Hall 1 was clean and large enough for all the students and parents, and the staff were polite throughout. However, the sound system had problems at the start, which delayed our program by about 20 minutes. The air conditioning was also not cool enough once the hall filled up. With these fixed, it would be a much better experience for school events.	f	Dear Test Customer,\n\nThank you for choosing Aazath Plaza for your school event and for your honest feedback. We'll pass your kind words on to our staff.\n\nWe apologise for the sound system problem that delayed your program, and for the air conditioning not keeping up once the hall filled. Both issues have been shared with our maintenance team, and we will test the sound system and cooling before every event.\n\nWe hope to welcome you again.\n\nWarm regards,\nAazath Plaza Management	2026-10-11 16:38:41.828172	2026-10-11 16:34:57.939278	2026-10-14 20:09:34.18637+05:30	\N	\N	\N
4	4	7	5	Excellent Corporate Event	We held our annual company seminar at Aazath Plaza. The corporate setup was professional, AV equipment worked perfectly, and the staff were very cooperative. Will book again for next year.	t	Thank you very much for your feedback. Always welcome.	2026-10-03 07:42:51.206708	2026-05-29 11:37:05.661111	\N	\N	\N	\N
2	2	5	5	Dream Engagement Ceremony	We had our engagement at Aazath Plaza and it was beyond our expectations. The pink and gold decoration was stunning. The team handled everything perfectly. Will definitely book again!	t	Glad to see your feedback. Always Welcome.	2026-10-11 09:13:29.717941	2026-05-29 11:37:05.661111	\N	\N	\N	\N
5	28	6	5	This is my first feedback.	\N	t	This is admin first reply.	2026-10-11 10:31:31.763913	2026-09-19 01:01:14.518354	2026-10-11 16:03:00.213296+05:30	\N	\N	\N
\.


--
-- Data for Name: hall_bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hall_bookings (hall_booking_id, hall_id, booking_id, event_date, event_start_time, event_end_time, status, assigned_by, notes, created_at, updated_at, is_complimentary) FROM stdin;
4	6	14	2026-09-17	09:00:00	14:00:00	pending	\N	\N	2026-09-12 13:30:42.681925	2026-09-12 13:30:42.681925	f
7	5	17	2026-09-20	09:00:00	14:00:00	pending	\N	\N	2026-09-12 14:20:44.959344	2026-09-12 14:20:44.959344	f
6	5	16	2026-09-19	09:00:00	14:00:00	confirmed	\N	\N	2026-09-12 14:02:01.318741	2026-09-13 17:10:36.025892	f
5	6	15	2026-09-18	09:00:00	14:00:00	cancelled	\N	\N	2026-09-12 13:49:58.379079	2026-09-13 17:11:59.172758	f
9	6	19	2026-10-06	10:00:00	15:00:00	confirmed	\N	\N	2026-09-13 18:28:17.067895	2026-09-13 18:28:17.067895	f
11	6	21	2026-10-10	11:00:00	16:00:00	confirmed	\N	\N	2026-09-13 18:28:17.689117	2026-09-13 18:28:17.689117	f
13	6	23	2026-10-14	10:00:00	15:00:00	cancelled	\N	\N	2026-09-13 18:28:18.304351	2026-09-13 18:28:18.304351	f
14	5	24	2026-10-16	09:00:00	13:00:00	confirmed	\N	\N	2026-09-13 18:28:18.565165	2026-09-13 18:28:18.565165	f
16	5	26	2026-10-20	09:00:00	14:00:00	confirmed	\N	\N	2026-09-13 18:28:19.225116	2026-09-13 18:28:19.225116	f
18	5	28	2026-10-24	09:00:00	13:00:00	completed	\N	\N	2026-09-13 18:28:19.741079	2026-09-13 18:28:19.741079	f
19	6	29	2026-10-26	11:00:00	16:00:00	confirmed	\N	\N	2026-09-13 18:28:19.997106	2026-09-13 18:28:19.997106	f
23	5	33	2026-09-26	09:00:00	14:00:00	pending	\N	\N	2026-09-18 02:23:49.812218	2026-09-18 02:23:49.812218	f
21	6	31	2026-10-30	10:00:00	15:00:00	confirmed	\N	\N	2026-09-13 18:28:20.657026	2026-09-19 07:13:48.497522	f
15	6	25	2026-10-18	11:00:00	16:00:00	confirmed	\N	\N	2026-09-13 18:28:18.860393	2026-09-19 07:13:58.635476	f
29	6	39	2026-10-02	09:00:00	14:00:00	pending	\N	\N	2026-09-21 17:48:42.113106	2026-09-21 17:48:42.113106	f
30	5	40	2026-10-09	09:00:00	14:00:00	pending	\N	\N	2026-09-22 03:15:05.859562	2026-09-22 03:15:05.859562	f
34	6	44	2026-10-01	10:00:00	14:00:00	pending	\N	\N	2026-09-28 10:48:59.552028	2026-09-28 10:48:59.552028	f
37	5	46	2026-10-15	09:00:00	14:00:00	pending	\N	\N	2026-09-29 08:45:17.388092	2026-09-29 08:45:17.388092	f
39	5	48	2026-11-21	09:00:00	14:00:00	pending	\N	\N	2026-09-30 07:06:01.871426	2026-09-30 07:06:01.871426	f
32	5	42	2026-10-30	09:00:00	17:00:00	confirmed	\N	\N	2026-09-24 10:50:15.140119	2026-10-01 19:58:11.312416	f
55	5	54	2026-10-19	09:00:00	14:00:00	confirmed	\N	\N	2026-10-08 11:29:54.710221	2026-10-10 17:14:28.264561	f
2	5	12	2026-11-04	09:00:00	14:00:00	cancelled	\N	\N	2026-09-09 07:29:37.31051	2026-10-02 08:04:02.351107	f
35	5	45	2026-11-13	09:00:00	21:00:00	confirmed	\N	\N	2026-09-29 08:42:36.885225	2026-10-02 08:14:58.561643	f
36	6	45	2026-11-13	09:00:00	21:00:00	confirmed	\N	\N	2026-09-29 08:42:37.19544	2026-10-02 08:14:58.561643	t
40	5	1	2026-01-15	14:00:00	22:00:00	completed	\N	Backfilled: historical seed booking	2026-10-04 06:04:50.588717	2026-10-04 06:04:50.588717	f
41	5	10	2026-04-20	14:00:00	22:00:00	cancelled	\N	Backfilled: historical seed booking	2026-10-04 06:04:50.588717	2026-10-04 06:04:50.588717	f
43	5	8	2026-07-25	16:00:00	22:00:00	confirmed	\N	Backfilled: historical seed booking	2026-10-04 06:04:50.588717	2026-10-04 06:04:50.588717	f
44	5	2	2026-02-10	16:00:00	22:00:00	completed	\N	Backfilled: historical seed booking	2026-10-04 06:04:50.588717	2026-10-04 06:04:50.588717	f
45	5	3	2026-03-05	12:00:00	22:00:00	completed	\N	Backfilled: historical seed booking	2026-10-04 06:04:50.588717	2026-10-04 06:04:50.588717	f
46	6	7	2026-07-12	15:00:00	21:00:00	confirmed	\N	Backfilled: historical seed booking	2026-10-04 06:04:50.588717	2026-10-04 06:04:50.588717	f
47	5	5	2026-06-14	15:00:00	22:00:00	confirmed	\N	Backfilled: historical seed booking	2026-10-04 06:04:50.588717	2026-10-04 06:04:50.588717	f
48	5	6	2026-06-28	17:00:00	22:00:00	confirmed	\N	Backfilled: historical seed booking	2026-10-04 06:04:50.588717	2026-10-04 06:04:50.588717	f
49	5	4	2026-03-22	08:00:00	16:00:00	completed	\N	Backfilled: historical seed booking	2026-10-04 06:04:50.588717	2026-10-04 06:04:50.588717	f
50	6	49	2026-10-15	09:00:00	14:00:00	pending	\N	\N	2026-10-07 09:56:40.081393	2026-10-07 09:56:40.081393	f
53	5	52	2027-01-15	09:00:00	14:00:00	pending	\N	\N	2026-10-07 10:20:10.853838	2026-10-07 10:20:10.853838	f
60	5	59	2026-10-11	09:00:00	14:00:00	pending	\N	\N	2026-10-10 16:38:58.648322	2026-10-10 16:38:58.648322	f
61	6	59	2026-10-11	09:00:00	14:00:00	pending	\N	\N	2026-10-10 16:38:58.956043	2026-10-10 16:38:58.956043	t
63	5	61	2026-11-26	09:00:00	14:00:00	pending	\N	\N	2026-10-14 14:25:33.565731	2026-10-14 14:25:33.565731	f
65	6	63	2026-11-02	09:00:00	14:00:00	pending	\N	\N	2026-10-17 09:55:57.905099	2026-10-17 09:55:57.905099	f
71	5	68	2026-11-28	09:00:00	17:00:00	pending	\N	\N	2026-10-18 22:40:02.673993	2026-10-18 22:40:02.673993	f
72	5	69	2026-12-20	09:00:00	14:00:00	pending	\N	\N	2026-10-19 13:58:00.875458	2026-10-19 13:58:00.875458	f
3	5	13	2026-09-17	09:00:00	14:00:00	confirmed	\N	\N	2026-09-12 13:22:12.059902	2026-10-19 14:01:43.654569	f
1	5	11	2026-08-15	10:00:00	14:00:00	confirmed	\N	\N	2026-06-21 17:31:53.361137	2026-10-19 14:01:45.771173	f
42	6	9	2026-08-08	18:00:00	22:00:00	confirmed	\N	Backfilled: historical seed booking	2026-10-04 06:04:50.588717	2026-10-19 14:01:46.689501	f
28	5	38	2026-10-02	09:00:00	14:00:00	confirmed	\N	\N	2026-09-21 05:25:07.835023	2026-10-19 14:01:53.948962	f
27	5	37	2026-09-30	09:00:00	14:00:00	confirmed	\N	\N	2026-09-20 17:08:21.145757	2026-10-19 14:01:55.360922	f
33	6	43	2026-09-27	09:00:00	14:00:00	cancelled	\N	\N	2026-09-27 12:52:15.83759	2026-10-19 14:02:32.665887	f
26	6	36	2026-09-25	09:00:00	14:00:00	cancelled	\N	\N	2026-09-20 17:06:10.698312	2026-10-19 14:03:00.858006	f
62	5	60	2027-01-12	09:00:00	14:00:00	confirmed	\N	\N	2026-10-13 21:52:56.325878	2026-10-19 14:05:12.21235	f
51	5	50	2026-12-19	09:00:00	14:00:00	confirmed	\N	\N	2026-10-07 09:58:55.35323	2026-10-19 14:05:12.336458	f
52	5	51	2026-12-15	09:00:00	14:00:00	confirmed	\N	\N	2026-10-07 10:00:47.178081	2026-10-19 14:05:12.387694	f
66	5	64	2026-12-01	09:00:00	14:00:00	confirmed	\N	\N	2026-10-17 23:50:40.594929	2026-10-19 14:05:12.461108	f
59	6	58	2026-11-23	09:00:00	14:00:00	confirmed	\N	\N	2026-10-10 10:16:51.230524	2026-10-19 14:05:13.165625	f
68	5	66	2026-11-18	09:00:00	14:00:00	confirmed	\N	\N	2026-10-18 21:06:43.14712	2026-10-19 14:05:13.238822	f
58	5	57	2026-11-10	09:00:00	14:00:00	confirmed	\N	\N	2026-10-10 09:24:48.541591	2026-10-19 14:05:13.276929	f
69	5	67	2026-11-07	09:00:00	14:00:00	confirmed	\N	\N	2026-10-18 21:10:35.328692	2026-10-19 14:05:13.320126	f
70	6	67	2026-11-07	09:00:00	14:00:00	confirmed	\N	\N	2026-10-18 21:10:35.338057	2026-10-19 14:05:13.320126	t
20	5	30	2026-10-28	09:00:00	14:00:00	confirmed	\N	\N	2026-09-13 18:28:20.35202	2026-10-19 14:05:13.776973	f
54	5	53	2026-10-27	09:00:00	14:00:00	confirmed	\N	\N	2026-10-08 05:08:12.892893	2026-10-19 14:05:13.872802	f
17	6	27	2026-10-22	10:00:00	15:00:00	confirmed	\N	\N	2026-09-13 18:28:19.480985	2026-10-19 14:05:13.983489	f
56	5	55	2026-10-21	09:00:00	14:00:00	confirmed	\N	\N	2026-10-10 01:33:30.715173	2026-10-19 14:05:14.03962	f
12	5	22	2026-10-12	09:00:00	14:00:00	confirmed	\N	\N	2026-09-13 18:28:17.996105	2026-10-19 14:05:14.874218	f
38	5	47	2026-10-10	09:00:00	14:00:00	confirmed	\N	\N	2026-09-30 07:03:57.574566	2026-10-19 14:05:14.959312	f
10	5	20	2026-10-07	09:00:00	13:00:00	confirmed	\N	\N	2026-09-13 18:28:17.380173	2026-10-19 14:05:15.011706	f
8	5	18	2026-10-05	09:00:00	14:00:00	confirmed	\N	\N	2026-09-13 18:28:16.772143	2026-10-19 14:05:15.075983	f
31	5	41	2026-09-27	09:00:00	14:00:00	confirmed	\N	\N	2026-09-22 09:08:21.694287	2026-10-19 14:05:15.131077	f
25	6	35	2026-09-26	09:00:00	14:00:00	confirmed	\N	\N	2026-09-19 00:55:14.468862	2026-10-19 14:05:15.17929	f
24	5	34	2026-09-25	09:00:00	14:00:00	confirmed	\N	\N	2026-09-19 00:51:33.082048	2026-10-19 14:05:15.298898	f
22	5	32	2026-09-23	09:00:00	14:00:00	confirmed	\N	\N	2026-09-18 02:16:25.299373	2026-10-19 14:05:15.392216	f
64	5	62	2026-11-02	09:00:00	14:00:00	cancelled	\N	\N	2026-10-17 09:20:02.016771	2026-10-19 14:06:12.848282	f
57	6	56	2026-10-20	09:00:00	14:00:00	cancelled	\N	\N	2026-10-10 01:34:25.598528	2026-10-20 15:06:20.441046	f
73	5	70	2026-12-24	09:00:00	14:00:00	confirmed	\N	\N	2026-10-20 13:35:43.719667	2026-10-20 15:07:37.394084	f
67	6	65	2026-11-26	09:00:00	14:00:00	cancelled	\N	\N	2026-10-18 19:53:25.92675	2026-10-20 15:39:23.557157	f
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
1	4	1	booking_confirmation	both	Booking Confirmed - AP-20260101-0001	Dear Mohamed Rifkan, your booking for Wedding Reception on 15 Jan 2026 has been confirmed. Booking Ref: AP-20260101-0001. Total: LKR 165,000.	rifkan@gmail.com	+94774567890	t	2025-12-20 10:05:00	\N	2026-05-29 11:37:25.840002	f
2	4	1	payment_receipt	email	Payment Receipt - INV-2026-0001	Dear Mohamed Rifkan, we have received your payment of LKR 165,000 for booking AP-20260101-0001. Invoice: INV-2026-0001.	rifkan@gmail.com	\N	t	2026-01-15 13:05:00	\N	2026-05-29 11:37:25.840002	f
3	5	2	booking_confirmation	both	Booking Confirmed - AP-20260102-0002	Dear Fathima Zahira, your booking for Engagement Ceremony on 10 Feb 2026 has been confirmed. Total: LKR 110,000.	zahira@gmail.com	+94775678901	t	2026-01-05 11:05:00	\N	2026-05-29 11:37:25.840002	f
4	8	5	booking_confirmation	both	Booking Confirmed - AP-20260601-0005	Dear Hassan Mueen, your booking for Wedding Reception on 14 Jun 2026 has been confirmed. Total: LKR 165,000.	mueen@gmail.com	+94778901234	t	2026-04-10 10:05:00	\N	2026-05-29 11:37:25.840002	f
5	8	5	event_reminder	sms	Event Reminder - Tomorrow!	Dear Hassan Mueen, this is a reminder that your Wedding Reception at Aazath Plaza is scheduled for TOMORROW 14 Jun 2026 at 3:00 PM.	\N	+94778901234	t	2026-06-13 09:00:00	\N	2026-05-29 11:37:25.840002	f
6	6	8	booking_confirmation	email	Booking Received - AP-20260704-0008	Dear Abdul Basith, your booking request for Valima Ceremony on 25 Jul 2026 has been received and is pending confirmation.	basith@gmail.com	\N	t	2026-05-20 14:00:00	\N	2026-05-29 11:37:25.840002	t
8	17	53	booking_confirmation	sms	\N	Aazath Plaza: Booking request received (AP-20261008-0053) for Hall 1 - Grand on 2026-10-27. Status: pending confirmation. We'll text you once it's confirmed.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-08 05:08:17.297173	f
7	17	53	booking_confirmation	email	Booking request received — AP-20261008-0053	Hi Test Customer,\n\nWe've received your booking request for Aazath Plaza. Here are the details:\n\nReference: AP-20261008-0053\nHall: Hall 1 - Grand\nDate: 2026-10-27\nTime: 09:00 - 14:00\nEvent type: School Event\nGuests: 150\nTotal: LKR 25000\n\nYour booking is currently pending confirmation from our team. We'll notify you once it's confirmed.	test@example.com	\N	t	2026-10-08 05:08:16.216227	\N	2026-10-08 05:08:16.216227	t
9	17	54	booking_confirmation	sms	\N	Aazath Plaza: Booking request received (AP-20261008-0054) for Hall 1 - Grand on 2026-10-19. Status: pending confirmation. We'll text you once it's confirmed.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-08 11:29:58.597109	f
10	17	54	booking_confirmation	email	Booking request received — AP-20261008-0054	Hi Test Customer,\n\nWe've received your booking request for Aazath Plaza. Here are the details:\n\nReference: AP-20261008-0054\nHall: Hall 1 - Grand\nDate: 2026-10-19\nTime: 09:00 - 14:00\nEvent type: Political Event (Large)\nGuests: 500\nTotal: LKR 60000\n\nYour booking is currently pending confirmation from our team. We'll notify you once it's confirmed.	test@example.com	\N	t	2026-10-08 11:29:59.349032	\N	2026-10-08 11:29:59.349032	f
11	3	54	booking_confirmation	in_app	New booking request — AP-20261008-0054	Test Customer requested Hall 1 - Grand for Political Event (Large) on 2026-10-19 (500 guests).	\N	\N	t	2026-10-08 11:29:59.630747	\N	2026-10-08 11:29:59.630747	f
12	1	54	booking_confirmation	in_app	New booking request — AP-20261008-0054	Test Customer requested Hall 1 - Grand for Political Event (Large) on 2026-10-19 (500 guests).	\N	\N	t	2026-10-08 11:29:59.630747	\N	2026-10-08 11:29:59.630747	f
14	19	54	booking_confirmation	in_app	New booking request — AP-20261008-0054	Test Customer requested Hall 1 - Grand for Political Event (Large) on 2026-10-19 (500 guests).	\N	\N	t	2026-10-08 11:29:59.630747	\N	2026-10-08 11:29:59.630747	f
15	10	48	general	in_app	New assignment — AP-20260930-0048	You were assigned to a School Event on 2026-11-21 as Decoration Lead. Please review it in Event Requests.	\N	\N	t	2026-10-08 12:00:01.365468	\N	2026-10-08 12:00:01.365468	f
16	9	51	general	in_app	New assignment — AP-20261007-0051	You were assigned to a Birthday Function on 2026-12-15 as Decoration Lead. Please review it in Event Requests.	\N	\N	t	2026-10-08 12:01:04.547109	\N	2026-10-08 12:01:04.547109	f
17	10	51	general	in_app	New assignment — AP-20261007-0051	You were assigned to a Birthday Function on 2026-12-15 as Decoration Lead. Please review it in Event Requests.	\N	\N	t	2026-10-08 12:02:00.876133	\N	2026-10-08 12:02:00.876133	f
18	10	29	general	in_app	New assignment — AP-20260913-0029	You were assigned to a Birthday Function on 2026-10-26 as Decoration Lead. Please review it in Event Requests.	\N	\N	t	2026-10-08 12:27:23.258739	\N	2026-10-08 12:27:23.258739	f
19	9	49	general	in_app	New assignment — AP-20261007-0049	You were assigned to a Birthday Function on 2026-10-15 as Decoration Lead. Please review it in Event Requests.	\N	\N	t	2026-10-08 12:29:31.046827	\N	2026-10-08 12:29:31.046827	f
20	3	55	booking_confirmation	in_app	New booking request — AP-20261010-0055	Test Customer requested Hall 1 - Grand for Political Event on 2026-10-21 (100 guests).	\N	\N	t	2026-10-10 01:33:34.939013	\N	2026-10-10 01:33:34.939013	f
21	19	55	booking_confirmation	in_app	New booking request — AP-20261010-0055	Test Customer requested Hall 1 - Grand for Political Event on 2026-10-21 (100 guests).	\N	\N	t	2026-10-10 01:33:34.939013	\N	2026-10-10 01:33:34.939013	f
23	1	55	booking_confirmation	in_app	New booking request — AP-20261010-0055	Test Customer requested Hall 1 - Grand for Political Event on 2026-10-21 (100 guests).	\N	\N	t	2026-10-10 01:33:34.939013	\N	2026-10-10 01:33:34.939013	f
24	17	55	booking_confirmation	email	Booking request received — AP-20261010-0055	Hi Test Customer,\n\nWe've received your booking request for Aazath Plaza. Here are the details:\n\nReference: AP-20261010-0055\nHall: Hall 1 - Grand\nDate: 2026-10-21\nTime: 09:00 - 14:00\nEvent type: Political Event\nGuests: 100\nTotal: LKR 30000\n\nYour booking is currently pending confirmation from our team. We'll notify you once it's confirmed.	test@example.com	\N	t	2026-10-10 01:33:35.255011	\N	2026-10-10 01:33:35.255011	f
25	17	55	booking_confirmation	sms	\N	Aazath Plaza: Booking request received (AP-20261010-0055) for Hall 1 - Grand on 2026-10-21. Status: pending confirmation. We'll text you once it's confirmed.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-10 01:33:35.610584	f
26	3	56	booking_confirmation	in_app	New booking request — AP-20261010-0056	Test Customer requested Hall 2 - Banquet for School Event on 2026-10-20 (200 guests).	\N	\N	t	2026-10-10 01:34:28.367224	\N	2026-10-10 01:34:28.367224	f
27	19	56	booking_confirmation	in_app	New booking request — AP-20261010-0056	Test Customer requested Hall 2 - Banquet for School Event on 2026-10-20 (200 guests).	\N	\N	t	2026-10-10 01:34:28.367224	\N	2026-10-10 01:34:28.367224	f
29	1	56	booking_confirmation	in_app	New booking request — AP-20261010-0056	Test Customer requested Hall 2 - Banquet for School Event on 2026-10-20 (200 guests).	\N	\N	t	2026-10-10 01:34:28.367224	\N	2026-10-10 01:34:28.367224	f
30	17	56	booking_confirmation	sms	\N	Aazath Plaza: Booking request received (AP-20261010-0056) for Hall 2 - Banquet on 2026-10-20. Status: pending confirmation. We'll text you once it's confirmed.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-10 01:34:29.195291	f
62	3	59	payment_receipt	in_app	Payment received — AP-20261010-0059	Customer-01 paid LKR 30,000.00 for the event on 11/10/2026. Invoice INV-20261010-53.	\N	\N	t	2026-10-10 16:47:17.652359	\N	2026-10-10 16:47:17.652359	f
31	17	56	booking_confirmation	email	Booking request received — AP-20261010-0056	Hi Test Customer,\n\nWe've received your booking request for Aazath Plaza. Here are the details:\n\nReference: AP-20261010-0056\nHall: Hall 2 - Banquet\nDate: 2026-10-20\nTime: 09:00 - 14:00\nEvent type: School Event\nGuests: 200\nTotal: LKR 20000\n\nYour booking is currently pending confirmation from our team. We'll notify you once it's confirmed.	test@example.com	\N	t	2026-10-10 01:34:30.119154	\N	2026-10-10 01:34:30.119154	f
32	6	57	booking_confirmation	email	Booking request received — AP-20261010-0057	Hi Customer-01,\n\nWe've received your booking request for Aazath Plaza. Here are the details:\n\nReference: AP-20261010-0057\nHall: Hall 1 - Grand\nDate: 2026-11-10\nTime: 09:00 - 14:00\nEvent type: Birthday Function\nGuests: 250\nTotal: LKR 60000\n\nYour booking is currently pending confirmation from our team. We'll notify you once it's confirmed.	thirayafathima@gmail.com	\N	t	2026-10-10 09:24:52.63767	\N	2026-10-10 09:24:52.63767	f
33	6	57	booking_confirmation	sms	\N	Aazath Plaza: Booking request received (AP-20261010-0057) for Hall 1 - Grand on 2026-11-10. Status: pending confirmation. We'll text you once it's confirmed.	\N	+94779972423	f	\N	You have exceeded your sending limit.	2026-10-10 09:24:53.642	f
34	3	57	booking_confirmation	in_app	New booking request — AP-20261010-0057	Customer-01 requested Hall 1 - Grand for Birthday Function on 2026-11-10 (250 guests).	\N	\N	t	2026-10-10 09:24:54.411275	\N	2026-10-10 09:24:54.411275	f
35	19	57	booking_confirmation	in_app	New booking request — AP-20261010-0057	Customer-01 requested Hall 1 - Grand for Birthday Function on 2026-11-10 (250 guests).	\N	\N	t	2026-10-10 09:24:54.411275	\N	2026-10-10 09:24:54.411275	f
37	1	57	booking_confirmation	in_app	New booking request — AP-20261010-0057	Customer-01 requested Hall 1 - Grand for Birthday Function on 2026-11-10 (250 guests).	\N	\N	t	2026-10-10 09:24:54.411275	\N	2026-10-10 09:24:54.411275	f
38	3	58	booking_confirmation	in_app	New booking request — AP-20261010-0058	Admin requested Hall 2 - Banquet for Birthday Function on 2026-11-23 (250 guests).	\N	\N	t	2026-10-10 10:16:54.439691	\N	2026-10-10 10:16:54.439691	f
40	19	58	booking_confirmation	in_app	New booking request — AP-20261010-0058	Admin requested Hall 2 - Banquet for Birthday Function on 2026-11-23 (250 guests).	\N	\N	t	2026-10-10 10:16:54.439691	\N	2026-10-10 10:16:54.439691	f
41	1	58	booking_confirmation	in_app	New booking request — AP-20261010-0058	Admin requested Hall 2 - Banquet for Birthday Function on 2026-11-23 (250 guests).	\N	\N	t	2026-10-10 10:16:54.439691	\N	2026-10-10 10:16:54.439691	f
42	1	58	booking_confirmation	email	Booking request received — AP-20261010-0058	Hi Admin,\n\nWe've received your booking request for Aazath Plaza. Here are the details:\n\nReference: AP-20261010-0058\nHall: Hall 2 - Banquet\nDate: 2026-11-23\nTime: 09:00 - 14:00\nEvent type: Birthday Function\nGuests: 250\nTotal: LKR 85000\n\nYour booking is currently pending confirmation from our team. We'll notify you once it's confirmed.	admin@aazathplaza.lk	\N	t	2026-10-10 10:16:55.735031	\N	2026-10-10 10:16:55.735031	f
43	1	58	booking_confirmation	sms	\N	Aazath Plaza: Booking request received (AP-20261010-0058) for Hall 2 - Banquet on 2026-11-23. Status: pending confirmation. We'll text you once it's confirmed.	\N	+94771234567	f	\N	You have exceeded your sending limit.	2026-10-10 10:16:57.044247	f
44	1	58	catering_update	email	Catering order #24 received — AP-20261010-0058	Hi Admin,\n\nWe received your catering order #24 for booking AP-20261010-0058.\n\n- 250 x Bruschetta\n\nGuests: 250\nTotal: LKR 45,000.00\nCatering is billed separately by the restaurant. We'll email you as the order progresses.	admin@aazathplaza.lk	\N	t	2026-10-10 10:16:58.834651	\N	2026-10-10 10:16:58.834651	f
45	13	58	catering_update	in_app	New catering order #24 — AP-20261010-0058	Admin ordered catering for 250 guests (LKR 45,000.00).	\N	\N	t	2026-10-10 10:16:59.08307	\N	2026-10-10 10:16:59.08307	f
46	3	58	catering_update	in_app	New catering order #24 — AP-20261010-0058	Admin ordered catering for 250 guests (LKR 45,000.00).	\N	\N	t	2026-10-10 10:16:59.08307	\N	2026-10-10 10:16:59.08307	f
48	19	58	catering_update	in_app	New catering order #24 — AP-20261010-0058	Admin ordered catering for 250 guests (LKR 45,000.00).	\N	\N	t	2026-10-10 10:16:59.08307	\N	2026-10-10 10:16:59.08307	f
49	1	58	catering_update	in_app	New catering order #24 — AP-20261010-0058	Admin ordered catering for 250 guests (LKR 45,000.00).	\N	\N	t	2026-10-10 10:16:59.08307	\N	2026-10-10 10:16:59.08307	f
50	3	59	booking_confirmation	in_app	New booking request — AP-20261010-0059	Customer-01 requested Hall 1 - Grand + Hall 2 - Banquet for Waleema on 2026-10-11 (1100 guests).	\N	\N	t	2026-10-10 16:39:03.263255	\N	2026-10-10 16:39:03.263255	f
51	1	59	booking_confirmation	in_app	New booking request — AP-20261010-0059	Customer-01 requested Hall 1 - Grand + Hall 2 - Banquet for Waleema on 2026-10-11 (1100 guests).	\N	\N	t	2026-10-10 16:39:03.263255	\N	2026-10-10 16:39:03.263255	f
53	19	59	booking_confirmation	in_app	New booking request — AP-20261010-0059	Customer-01 requested Hall 1 - Grand + Hall 2 - Banquet for Waleema on 2026-10-11 (1100 guests).	\N	\N	t	2026-10-10 16:39:03.263255	\N	2026-10-10 16:39:03.263255	f
54	6	59	booking_confirmation	email	Booking request received — AP-20261010-0059	Hi Customer-01,\n\nWe've received your booking request for Aazath Plaza. Here are the details:\n\nReference: AP-20261010-0059\nHall: Hall 1 - Grand + Hall 2 - Banquet\nDate: 2026-10-11\nTime: 09:00 - 14:00\nEvent type: Waleema\nGuests: 1100\nTotal: LKR 30000\n\nYour booking is currently pending confirmation from our team. We'll notify you once it's confirmed.	thirayafathima@gmail.com	\N	t	2026-10-10 16:39:03.569335	\N	2026-10-10 16:39:03.569335	f
55	6	59	booking_confirmation	sms	\N	Aazath Plaza: Booking request received (AP-20261010-0059) for Hall 1 - Grand + Hall 2 - Banquet on 2026-10-11. Status: pending confirmation. We'll text you once it's confirmed.	\N	+94779972423	f	\N	You have exceeded your sending limit.	2026-10-10 16:39:04.284145	f
56	6	59	catering_update	email	Catering order #25 received — AP-20261010-0059	Hi Customer-01,\n\nWe received your catering order #25 for booking AP-20261010-0059.\n\n- 1100 x Fried Rice with Chicken\n\nGuests: 1100\nTotal: LKR 418,000.00\nCatering is billed separately by the restaurant. We'll email you as the order progresses.	thirayafathima@gmail.com	\N	t	2026-10-10 16:39:07.834684	\N	2026-10-10 16:39:07.834684	f
57	13	59	catering_update	in_app	New catering order #25 — AP-20261010-0059	Customer-01 ordered catering for 1100 guests (LKR 418,000.00).	\N	\N	t	2026-10-10 16:39:08.090745	\N	2026-10-10 16:39:08.090745	f
58	3	59	catering_update	in_app	New catering order #25 — AP-20261010-0059	Customer-01 ordered catering for 1100 guests (LKR 418,000.00).	\N	\N	t	2026-10-10 16:39:08.090745	\N	2026-10-10 16:39:08.090745	f
59	1	59	catering_update	in_app	New catering order #25 — AP-20261010-0059	Customer-01 ordered catering for 1100 guests (LKR 418,000.00).	\N	\N	t	2026-10-10 16:39:08.090745	\N	2026-10-10 16:39:08.090745	f
61	19	59	catering_update	in_app	New catering order #25 — AP-20261010-0059	Customer-01 ordered catering for 1100 guests (LKR 418,000.00).	\N	\N	t	2026-10-10 16:39:08.090745	\N	2026-10-10 16:39:08.090745	f
63	1	59	payment_receipt	in_app	Payment received — AP-20261010-0059	Customer-01 paid LKR 30,000.00 for the event on 11/10/2026. Invoice INV-20261010-53.	\N	\N	t	2026-10-10 16:47:17.652359	\N	2026-10-10 16:47:17.652359	f
65	19	59	payment_receipt	in_app	Payment received — AP-20261010-0059	Customer-01 paid LKR 30,000.00 for the event on 11/10/2026. Invoice INV-20261010-53.	\N	\N	t	2026-10-10 16:47:17.652359	\N	2026-10-10 16:47:17.652359	f
66	6	59	payment_receipt	email	Payment received — AP-20261010-0059 (Invoice INV-20261010-53)	Hi Customer-01,\n\nWe received your payment of LKR 30,000.00 for booking AP-20261010-0059. Your booking for 11/10/2026 is confirmed. Invoice INV-20261010-53 is attached.	thirayafathima@gmail.com	\N	t	2026-10-10 16:47:18.195707	\N	2026-10-10 16:47:18.195707	f
67	6	59	payment_receipt	sms	\N	Aazath Plaza: Payment of LKR 30,000 received for AP-20261010-0059. Your booking for 11/10/2026 is confirmed. Invoice: INV-20261010-53.	\N	+94779972423	f	\N	You have exceeded your sending limit.	2026-10-10 16:47:18.605382	f
68	17	54	booking_confirmation	email	Booking confirmed — AP-20261008-0054	Hi Test Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20261008-0054\nHall: Hall 1 - Grand\nDate: 19/10/2026	test@example.com	\N	t	2026-10-10 17:14:34.611689	\N	2026-10-10 17:14:34.611689	f
69	17	54	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20261008-0054 for 19/10/2026 has been confirmed. We look forward to hosting you.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-10 17:14:35.56832	f
70	17	47	catering_update	email	Catering order #20 confirmed — AP-20260930-0047	Hi Test Customer,\n\nThe restaurant has confirmed your catering order.\n\nOrder: #20\nBooking: AP-20260930-0047	test@example.com	\N	t	2026-10-10 17:42:00.139514	\N	2026-10-10 17:42:00.139514	f
71	17	47	catering_update	email	Catering order #20 preparing — AP-20260930-0047	Hi Test Customer,\n\nThe restaurant has started preparing your catering order.\n\nOrder: #20\nBooking: AP-20260930-0047	test@example.com	\N	t	2026-10-10 17:42:12.334941	\N	2026-10-10 17:42:12.334941	f
72	17	47	catering_update	email	Catering order #20 delivered — AP-20260930-0047	Hi Test Customer,\n\nYour catering order has been delivered. Enjoy your event!\n\nOrder: #20\nBooking: AP-20260930-0047	test@example.com	\N	t	2026-10-10 17:42:16.695863	\N	2026-10-10 17:42:16.695863	f
73	6	59	catering_update	email	Catering order #25 confirmed — AP-20261010-0059	Hi Customer-01,\n\nThe restaurant has confirmed your catering order.\n\nOrder: #25\nBooking: AP-20261010-0059	thirayafathima@gmail.com	\N	t	2026-10-10 17:42:27.877613	\N	2026-10-10 17:42:27.877613	f
74	6	59	catering_update	email	Catering order #25 preparing — AP-20261010-0059	Hi Customer-01,\n\nThe restaurant has started preparing your catering order.\n\nOrder: #25\nBooking: AP-20261010-0059	thirayafathima@gmail.com	\N	t	2026-10-10 17:42:32.997622	\N	2026-10-10 17:42:32.997622	f
75	6	59	catering_update	email	Catering order #25 delivered — AP-20261010-0059	Hi Customer-01,\n\nYour catering order has been delivered. Enjoy your event!\n\nOrder: #25\nBooking: AP-20261010-0059	thirayafathima@gmail.com	\N	t	2026-10-11 07:59:32.847957	\N	2026-10-11 07:59:32.847957	f
76	4	1	catering_update	email	Catering order #8 cancelled — AP-20260101-0001	Hi Mohamed Rifkan,\n\nYour catering order has been cancelled.\n\nOrder: #8\nBooking: AP-20260101-0001	rifkan@gmail.com	\N	t	2026-10-11 08:00:28.650778	\N	2026-10-11 08:00:28.650778	f
77	8	5	catering_update	email	Catering order #3 cancelled — AP-20260601-0005	Hi Hassan Mueen,\n\nYour catering order has been cancelled.\n\nOrder: #3\nBooking: AP-20260601-0005	mueen@gmail.com	\N	t	2026-10-11 08:00:34.812848	\N	2026-10-11 08:00:34.812848	f
78	4	6	catering_update	email	Catering order #6 confirmed — AP-20260602-0006	Hi Mohamed Rifkan,\n\nThe restaurant has confirmed your catering order.\n\nOrder: #6\nBooking: AP-20260602-0006	rifkan@gmail.com	\N	t	2026-10-11 08:00:46.749851	\N	2026-10-11 08:00:46.749851	f
79	4	6	catering_update	email	Catering order #6 preparing — AP-20260602-0006	Hi Mohamed Rifkan,\n\nThe restaurant has started preparing your catering order.\n\nOrder: #6\nBooking: AP-20260602-0006	rifkan@gmail.com	\N	t	2026-10-11 08:00:52.619684	\N	2026-10-11 08:00:52.619684	f
80	4	6	catering_update	email	Catering order #6 delivered — AP-20260602-0006	Hi Mohamed Rifkan,\n\nYour catering order has been delivered. Enjoy your event!\n\nOrder: #6\nBooking: AP-20260602-0006	rifkan@gmail.com	\N	t	2026-10-11 08:00:55.477902	\N	2026-10-11 08:00:55.477902	f
81	5	7	catering_update	email	Catering order #4 confirmed — AP-20260703-0007	Hi Fathima Zahira,\n\nThe restaurant has confirmed your catering order.\n\nOrder: #4\nBooking: AP-20260703-0007	zahira@gmail.com	\N	t	2026-10-11 08:01:09.245228	\N	2026-10-11 08:01:09.245228	f
82	5	7	catering_update	email	Catering order #4 preparing — AP-20260703-0007	Hi Fathima Zahira,\n\nThe restaurant has started preparing your catering order.\n\nOrder: #4\nBooking: AP-20260703-0007	zahira@gmail.com	\N	t	2026-10-11 08:01:11.535189	\N	2026-10-11 08:01:11.535189	f
83	5	7	catering_update	email	Catering order #4 delivered — AP-20260703-0007	Hi Fathima Zahira,\n\nYour catering order has been delivered. Enjoy your event!\n\nOrder: #4\nBooking: AP-20260703-0007	zahira@gmail.com	\N	t	2026-10-11 08:01:11.596436	\N	2026-10-11 08:01:11.596436	f
84	17	32	catering_update	email	Catering order #9 cancelled — AP-20260918-0032	Hi Test Customer,\n\nYour catering order has been cancelled.\n\nOrder: #9\nBooking: AP-20260918-0032	test@example.com	\N	t	2026-10-11 08:01:26.614863	\N	2026-10-11 08:01:26.614863	f
85	18	36	catering_update	email	Catering order #13 delivered — AP-20260920-0036	Hi Reg-Testing,\n\nYour catering order has been delivered. Enjoy your event!\n\nOrder: #13\nBooking: AP-20260920-0036	testreg@gmail.com	\N	t	2026-10-11 08:01:44.172985	\N	2026-10-11 08:01:44.172985	f
86	6	59	general	email	Event schedule updated — AP-20261010-0059	Hi Customer-01,\n\nAn activity was added to the schedule for your event.\n\nBooking: AP-20261010-0059\nHall: Hall 1 - Grand + Hall 2 - Banquet\nDate: 11/10/2026\nActivity: Chair Arrangement (setup)\nTime: 09:00 - 10:00	thirayafathima@gmail.com	\N	t	2026-10-11 08:10:20.93207	\N	2026-10-11 08:10:20.93207	f
87	6	59	general	email	Event schedule updated — AP-20261010-0059	Hi Customer-01,\n\nAn activity was added to the schedule for your event.\n\nBooking: AP-20261010-0059\nHall: Hall 1 - Grand + Hall 2 - Banquet\nDate: 11/10/2026\nActivity: Decorations, Hall Arrangement (setup)\nTime: 10:00 - 12:30	thirayafathima@gmail.com	\N	t	2026-10-11 08:15:03.557847	\N	2026-10-11 08:15:03.557847	f
88	6	59	general	email	Event schedule updated — AP-20261010-0059	Hi Customer-01,\n\nAn activity was added to the schedule for your event.\n\nBooking: AP-20261010-0059\nHall: Hall 1 - Grand + Hall 2 - Banquet\nDate: 11/10/2026\nActivity: Food Supply Arrangements. (setup)\nTime: 12:45 - 13:30	thirayafathima@gmail.com	\N	t	2026-10-11 08:19:13.931848	\N	2026-10-11 08:19:13.931848	f
89	6	59	general	email	Event schedule updated — AP-20261010-0059	Hi Customer-01,\n\nAn activity was added to the schedule for your event.\n\nBooking: AP-20261010-0059\nHall: Hall 1 - Grand + Hall 2 - Banquet\nDate: 11/10/2026\nActivity: Hall & Floor Cleanup. (cleanup)\nTime: 15:00 - 17:00	thirayafathima@gmail.com	\N	t	2026-10-11 08:23:15.898342	\N	2026-10-11 08:23:15.898342	f
90	6	59	general	email	Event schedule updated — AP-20261010-0059	Hi Customer-01,\n\nAn activity was updated in the schedule for your event.\n\nBooking: AP-20261010-0059\nHall: Hall 1 - Grand + Hall 2 - Banquet\nDate: 11/10/2026\nActivity: Decorations, Hall Arrangement (decoration)\nTime: 10:00 - 12:30	thirayafathima@gmail.com	\N	t	2026-10-11 08:24:06.178573	\N	2026-10-11 08:24:06.178573	f
155	6	66	booking_confirmation	sms	\N	Aazath Plaza: Booking request received (AP-20261018-0066) for Hall 1 - Grand on 2026-11-18. Status: pending confirmation. We'll text you once it's confirmed.	\N	+94779972423	f	\N	fetch failed	2026-10-18 21:06:43.544962	f
157	19	66	catering_update	in_app	New catering order #28 — AP-20261018-0066	Customer-01 ordered catering for 400 guests (LKR 48,000.00).	\N	\N	t	2026-10-18 21:06:43.666884	\N	2026-10-18 21:06:43.666884	f
91	6	59	general	email	Event schedule updated — AP-20261010-0059	Hi Customer-01,\n\nAn activity was updated in the schedule for your event.\n\nBooking: AP-20261010-0059\nHall: Hall 1 - Grand + Hall 2 - Banquet\nDate: 11/10/2026\nActivity: Decorations, Hall Arrangement (decoration)\nTime: 10:00 - 23:30	thirayafathima@gmail.com	\N	t	2026-10-11 08:24:33.932326	\N	2026-10-11 08:24:33.932326	f
92	6	59	general	email	Event schedule updated — AP-20261010-0059	Hi Customer-01,\n\nAn activity was updated in the schedule for your event.\n\nBooking: AP-20261010-0059\nHall: Hall 1 - Grand + Hall 2 - Banquet\nDate: 11/10/2026\nActivity: Food Supply Arrangements. (catering)\nTime: 11:45 - 12:30	thirayafathima@gmail.com	\N	t	2026-10-11 08:25:22.976889	\N	2026-10-11 08:25:22.976889	f
93	1	60	booking_confirmation	email	Booking request received — AP-20261013-0060	Hi Admin,\n\nWe've received your booking request for Aazath Plaza. Here are the details:\n\nReference: AP-20261013-0060\nHall: Hall 1 - Grand\nDate: 2027-01-12\nTime: 09:00 - 14:00\nEvent type: School Event\nGuests: 250\nTotal: LKR 25000\n\nYour booking is currently pending confirmation from our team. We'll notify you once it's confirmed.	admin@aazathplaza.lk	\N	t	2026-10-13 21:52:58.973016	\N	2026-10-13 21:52:58.973016	f
95	1	60	booking_confirmation	in_app	New booking request — AP-20261013-0060	Admin requested Hall 1 - Grand for School Event on 2027-01-12 (250 guests).	\N	\N	t	2026-10-13 21:52:59.225228	\N	2026-10-13 21:52:59.225228	f
96	19	60	booking_confirmation	in_app	New booking request — AP-20261013-0060	Admin requested Hall 1 - Grand for School Event on 2027-01-12 (250 guests).	\N	\N	t	2026-10-13 21:52:59.225228	\N	2026-10-13 21:52:59.225228	f
97	3	60	booking_confirmation	in_app	New booking request — AP-20261013-0060	Admin requested Hall 1 - Grand for School Event on 2027-01-12 (250 guests).	\N	\N	t	2026-10-13 21:52:59.225228	\N	2026-10-13 21:52:59.225228	f
98	1	60	booking_confirmation	sms	\N	Aazath Plaza: Booking request received (AP-20261013-0060) for Hall 1 - Grand on 2027-01-12. Status: pending confirmation. We'll text you once it's confirmed.	\N	+94771234567	f	\N	You have exceeded your sending limit.	2026-10-13 21:52:59.922517	f
99	1	60	catering_update	email	Catering order #26 received — AP-20261013-0060	Hi Admin,\n\nWe received your catering order #26 for booking AP-20261013-0060.\n\n- 250 x Short Eats Platter\n\nGuests: 250\nTotal: LKR 62,500.00\nCatering is billed separately by the restaurant. We'll email you as the order progresses.	admin@aazathplaza.lk	\N	t	2026-10-13 21:53:02.076069	\N	2026-10-13 21:53:02.076069	f
101	1	60	catering_update	in_app	New catering order #26 — AP-20261013-0060	Admin ordered catering for 250 guests (LKR 62,500.00).	\N	\N	t	2026-10-13 21:53:03.442119	\N	2026-10-13 21:53:03.442119	f
102	13	60	catering_update	in_app	New catering order #26 — AP-20261013-0060	Admin ordered catering for 250 guests (LKR 62,500.00).	\N	\N	t	2026-10-13 21:53:03.442119	\N	2026-10-13 21:53:03.442119	f
103	19	60	catering_update	in_app	New catering order #26 — AP-20261013-0060	Admin ordered catering for 250 guests (LKR 62,500.00).	\N	\N	t	2026-10-13 21:53:03.442119	\N	2026-10-13 21:53:03.442119	f
104	3	60	catering_update	in_app	New catering order #26 — AP-20261013-0060	Admin ordered catering for 250 guests (LKR 62,500.00).	\N	\N	t	2026-10-13 21:53:03.442119	\N	2026-10-13 21:53:03.442119	f
105	1	61	booking_confirmation	in_app	New booking request — AP-20261014-0061	Test Customer requested Hall 1 - Grand for School Event on 2026-11-26 (500 guests).	\N	\N	t	2026-10-14 14:25:37.844515	\N	2026-10-14 14:25:37.844515	f
107	3	61	booking_confirmation	in_app	New booking request — AP-20261014-0061	Test Customer requested Hall 1 - Grand for School Event on 2026-11-26 (500 guests).	\N	\N	t	2026-10-14 14:25:37.844515	\N	2026-10-14 14:25:37.844515	f
108	19	61	booking_confirmation	in_app	New booking request — AP-20261014-0061	Test Customer requested Hall 1 - Grand for School Event on 2026-11-26 (500 guests).	\N	\N	t	2026-10-14 14:25:37.844515	\N	2026-10-14 14:25:37.844515	f
109	17	61	booking_confirmation	email	Booking request received — AP-20261014-0061	Hi Test Customer,\n\nWe've received your booking request for Aazath Plaza. Here are the details:\n\nReference: AP-20261014-0061\nHall: Hall 1 - Grand\nDate: 2026-11-26\nTime: 09:00 - 14:00\nEvent type: School Event\nGuests: 500\nTotal: LKR 20000\n\nYour booking is currently pending confirmation from our team. We'll notify you once it's confirmed.	test@example.com	\N	t	2026-10-14 14:25:38.22868	\N	2026-10-14 14:25:38.22868	f
110	17	61	booking_confirmation	sms	\N	Aazath Plaza: Booking request received (AP-20261014-0061) for Hall 1 - Grand on 2026-11-26. Status: pending confirmation. We'll text you once it's confirmed.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-14 14:25:38.732568	f
111	17	61	catering_update	email	Catering order #27 received — AP-20261014-0061	Hi Test Customer,\n\nWe received your catering order #27 for booking AP-20261014-0061.\n\n- 500 x Short Eats Platter\n\nGuests: 500\nTotal: LKR 125,000.00\nCatering is billed separately by the restaurant. We'll email you as the order progresses.	test@example.com	\N	t	2026-10-14 14:25:41.969699	\N	2026-10-14 14:25:41.969699	f
112	1	61	catering_update	in_app	New catering order #27 — AP-20261014-0061	Test Customer ordered catering for 500 guests (LKR 125,000.00).	\N	\N	t	2026-10-14 14:25:42.294046	\N	2026-10-14 14:25:42.294046	f
114	3	61	catering_update	in_app	New catering order #27 — AP-20261014-0061	Test Customer ordered catering for 500 guests (LKR 125,000.00).	\N	\N	t	2026-10-14 14:25:42.294046	\N	2026-10-14 14:25:42.294046	f
115	19	61	catering_update	in_app	New catering order #27 — AP-20261014-0061	Test Customer ordered catering for 500 guests (LKR 125,000.00).	\N	\N	t	2026-10-14 14:25:42.294046	\N	2026-10-14 14:25:42.294046	f
116	13	61	catering_update	in_app	New catering order #27 — AP-20261014-0061	Test Customer ordered catering for 500 guests (LKR 125,000.00).	\N	\N	t	2026-10-14 14:25:42.294046	\N	2026-10-14 14:25:42.294046	f
117	17	61	payment_receipt	sms	\N	Aazath Plaza: Payment of LKR 20,000 received for AP-20261014-0061. Your booking for 26/11/2026 is confirmed. Invoice: INV-20261014-56.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-14 14:28:30.553445	f
118	1	61	payment_receipt	in_app	Payment received — AP-20261014-0061	Test Customer paid LKR 20,000.00 for the event on 26/11/2026. Invoice INV-20261014-56.	\N	\N	t	2026-10-14 14:28:31.35416	\N	2026-10-14 14:28:31.35416	f
120	3	61	payment_receipt	in_app	Payment received — AP-20261014-0061	Test Customer paid LKR 20,000.00 for the event on 26/11/2026. Invoice INV-20261014-56.	\N	\N	t	2026-10-14 14:28:31.35416	\N	2026-10-14 14:28:31.35416	f
121	19	61	payment_receipt	in_app	Payment received — AP-20261014-0061	Test Customer paid LKR 20,000.00 for the event on 26/11/2026. Invoice INV-20261014-56.	\N	\N	t	2026-10-14 14:28:31.35416	\N	2026-10-14 14:28:31.35416	f
122	17	61	payment_receipt	email	Payment received — AP-20261014-0061 (Invoice INV-20261014-56)	Hi Test Customer,\n\nWe received your payment of LKR 20,000.00 for booking AP-20261014-0061. Your booking for 26/11/2026 is confirmed. Invoice INV-20261014-56 is attached.	test@example.com	\N	t	2026-10-14 14:28:32.007542	\N	2026-10-14 14:28:32.007542	f
123	1	62	booking_confirmation	email	Booking request received — AP-20261017-0062	Hi Admin,\n\nWe've received your booking request for Aazath Plaza. Here are the details:\n\nReference: AP-20261017-0062\nHall: Hall 1 - Grand\nDate: 2026-11-02\nTime: 09:00 - 14:00\nEvent type: School Event\nGuests: 250\nTotal: LKR 20000\n\nYour booking is currently pending confirmation from our team. We'll notify you once it's confirmed.	admin@aazathplaza.lk	\N	f	\N	getaddrinfo ENOTFOUND smtp.sendgrid.net	2026-10-17 09:20:02.305012	f
124	3	62	booking_confirmation	in_app	New booking request — AP-20261017-0062	Admin requested Hall 1 - Grand for School Event on 2026-11-02 (250 guests).	\N	\N	t	2026-10-17 09:20:02.459051	\N	2026-10-17 09:20:02.459051	f
125	19	62	booking_confirmation	in_app	New booking request — AP-20261017-0062	Admin requested Hall 1 - Grand for School Event on 2026-11-02 (250 guests).	\N	\N	t	2026-10-17 09:20:02.459051	\N	2026-10-17 09:20:02.459051	f
127	1	62	booking_confirmation	in_app	New booking request — AP-20261017-0062	Admin requested Hall 1 - Grand for School Event on 2026-11-02 (250 guests).	\N	\N	t	2026-10-17 09:20:02.459051	\N	2026-10-17 09:20:02.459051	f
128	1	62	booking_confirmation	sms	\N	Aazath Plaza: Booking request received (AP-20261017-0062) for Hall 1 - Grand on 2026-11-02. Status: pending confirmation. We'll text you once it's confirmed.	\N	+94771234567	f	\N	fetch failed	2026-10-17 09:20:02.474221	f
129	6	63	booking_confirmation	email	Booking request received — AP-20261017-0063	Hi Customer-01,\n\nWe've received your booking request for Aazath Plaza. Here are the details:\n\nReference: AP-20261017-0063\nHall: Hall 2 - Banquet\nDate: 2026-11-02\nTime: 09:00 - 14:00\nEvent type: School Event\nGuests: 150\nTotal: LKR 20000\n\nYour booking is currently pending confirmation from our team. We'll notify you once it's confirmed.	thirayafathima@gmail.com	\N	t	2026-10-17 09:55:59.941058	\N	2026-10-17 09:55:59.941058	f
130	3	63	booking_confirmation	in_app	New booking request — AP-20261017-0063	Customer-01 requested Hall 2 - Banquet for School Event on 2026-11-02 (150 guests).	\N	\N	t	2026-10-17 09:56:00.050769	\N	2026-10-17 09:56:00.050769	f
131	19	63	booking_confirmation	in_app	New booking request — AP-20261017-0063	Customer-01 requested Hall 2 - Banquet for School Event on 2026-11-02 (150 guests).	\N	\N	t	2026-10-17 09:56:00.050769	\N	2026-10-17 09:56:00.050769	f
133	1	63	booking_confirmation	in_app	New booking request — AP-20261017-0063	Customer-01 requested Hall 2 - Banquet for School Event on 2026-11-02 (150 guests).	\N	\N	t	2026-10-17 09:56:00.050769	\N	2026-10-17 09:56:00.050769	f
134	6	63	booking_confirmation	sms	\N	Aazath Plaza: Booking request received (AP-20261017-0063) for Hall 2 - Banquet on 2026-11-02. Status: pending confirmation. We'll text you once it's confirmed.	\N	+94779972423	f	\N	You have exceeded your sending limit.	2026-10-17 09:56:01.347154	f
135	6	63	payment_receipt	email	Payment received — AP-20261017-0063 (Invoice INV-20261017-58)	Hi Customer-01,\n\nWe received your payment of LKR 20,000.00 for booking AP-20261017-0063. Your booking for 02/11/2026 is confirmed. Invoice INV-20261017-58 is attached.	thirayafathima@gmail.com	\N	t	2026-10-17 10:10:14.791287	\N	2026-10-17 10:10:14.791287	f
136	3	63	payment_receipt	in_app	Payment received — AP-20261017-0063	Customer-01 paid LKR 20,000.00 for the event on 02/11/2026. Invoice INV-20261017-58.	\N	\N	t	2026-10-17 10:10:15.088255	\N	2026-10-17 10:10:15.088255	f
137	19	63	payment_receipt	in_app	Payment received — AP-20261017-0063	Customer-01 paid LKR 20,000.00 for the event on 02/11/2026. Invoice INV-20261017-58.	\N	\N	t	2026-10-17 10:10:15.088255	\N	2026-10-17 10:10:15.088255	f
139	1	63	payment_receipt	in_app	Payment received — AP-20261017-0063	Customer-01 paid LKR 20,000.00 for the event on 02/11/2026. Invoice INV-20261017-58.	\N	\N	t	2026-10-17 10:10:15.088255	\N	2026-10-17 10:10:15.088255	f
140	6	63	payment_receipt	sms	\N	Aazath Plaza: Payment of LKR 20,000 received for AP-20261017-0063. Your booking for 02/11/2026 is confirmed. Invoice: INV-20261017-58.	\N	+94779972423	f	\N	You have exceeded your sending limit.	2026-10-17 10:10:15.412996	f
141	17	64	booking_confirmation	email	Booking request received — AP-20261017-0064	Hi Test Customer,\n\nWe've received your booking request for Aazath Plaza. Here are the details:\n\nReference: AP-20261017-0064\nHall: Hall 1 - Grand\nDate: 2026-12-01\nTime: 09:00 - 14:00\nEvent type: School Event\nGuests: 300\nTotal: LKR 20000\n\nYour booking is currently pending confirmation from our team. We'll notify you once it's confirmed.	test@example.com	\N	t	2026-10-17 23:50:42.332127	\N	2026-10-17 23:50:42.332127	f
142	19	64	booking_confirmation	in_app	New booking request — AP-20261017-0064	Test Customer requested Hall 1 - Grand for School Event on 2026-12-01 (300 guests).	\N	\N	t	2026-10-17 23:50:42.412411	\N	2026-10-17 23:50:42.412411	f
143	3	64	booking_confirmation	in_app	New booking request — AP-20261017-0064	Test Customer requested Hall 1 - Grand for School Event on 2026-12-01 (300 guests).	\N	\N	t	2026-10-17 23:50:42.412411	\N	2026-10-17 23:50:42.412411	f
144	1	64	booking_confirmation	in_app	New booking request — AP-20261017-0064	Test Customer requested Hall 1 - Grand for School Event on 2026-12-01 (300 guests).	\N	\N	t	2026-10-17 23:50:42.412411	\N	2026-10-17 23:50:42.412411	f
145	17	64	booking_confirmation	sms	\N	Aazath Plaza: Booking request received (AP-20261017-0064) for Hall 1 - Grand on 2026-12-01. Status: pending confirmation. We'll text you once it's confirmed.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-17 23:50:43.282696	f
146	17	65	booking_confirmation	email	Booking request received — AP-20261018-0065	Hi Test Customer,\n\nWe've received your booking request for Aazath Plaza. Here are the details:\n\nReference: AP-20261018-0065\nHall: Hall 2 - Banquet\nDate: 2026-11-26\nTime: 09:00 - 14:00\nEvent type: School Event\nGuests: 250\nTotal: LKR 20000\n\nYour booking is currently pending confirmation from our team. We'll notify you once it's confirmed.	test@example.com	\N	t	2026-10-18 19:53:28.329378	\N	2026-10-18 19:53:28.329378	f
147	19	65	booking_confirmation	in_app	New booking request — AP-20261018-0065	Test Customer requested Hall 2 - Banquet for School Event on 2026-11-26 (250 guests).	\N	\N	t	2026-10-18 19:53:28.493742	\N	2026-10-18 19:53:28.493742	f
148	3	65	booking_confirmation	in_app	New booking request — AP-20261018-0065	Test Customer requested Hall 2 - Banquet for School Event on 2026-11-26 (250 guests).	\N	\N	t	2026-10-18 19:53:28.493742	\N	2026-10-18 19:53:28.493742	f
149	1	65	booking_confirmation	in_app	New booking request — AP-20261018-0065	Test Customer requested Hall 2 - Banquet for School Event on 2026-11-26 (250 guests).	\N	\N	t	2026-10-18 19:53:28.493742	\N	2026-10-18 19:53:28.493742	f
150	17	65	booking_confirmation	sms	\N	Aazath Plaza: Booking request received (AP-20261018-0065) for Hall 2 - Banquet on 2026-11-26. Status: pending confirmation. We'll text you once it's confirmed.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-18 19:53:29.096135	f
151	6	66	booking_confirmation	email	Booking request received — AP-20261018-0066	Hi Customer-01,\n\nWe've received your booking request for Aazath Plaza. Here are the details:\n\nReference: AP-20261018-0066\nHall: Hall 1 - Grand\nDate: 2026-11-18\nTime: 09:00 - 14:00\nEvent type: Political Event (Large)\nGuests: 400\nTotal: LKR 50000\n\nYour booking is currently pending confirmation from our team. We'll notify you once it's confirmed.	thirayafathima@gmail.com	\N	f	\N	getaddrinfo ENOTFOUND smtp.sendgrid.net	2026-10-18 21:06:43.301203	f
152	19	66	booking_confirmation	in_app	New booking request — AP-20261018-0066	Customer-01 requested Hall 1 - Grand for Political Event (Large) on 2026-11-18 (400 guests).	\N	\N	t	2026-10-18 21:06:43.536091	\N	2026-10-18 21:06:43.536091	f
153	3	66	booking_confirmation	in_app	New booking request — AP-20261018-0066	Customer-01 requested Hall 1 - Grand for Political Event (Large) on 2026-11-18 (400 guests).	\N	\N	t	2026-10-18 21:06:43.536091	\N	2026-10-18 21:06:43.536091	f
154	1	66	booking_confirmation	in_app	New booking request — AP-20261018-0066	Customer-01 requested Hall 1 - Grand for Political Event (Large) on 2026-11-18 (400 guests).	\N	\N	t	2026-10-18 21:06:43.536091	\N	2026-10-18 21:06:43.536091	f
158	3	66	catering_update	in_app	New catering order #28 — AP-20261018-0066	Customer-01 ordered catering for 400 guests (LKR 48,000.00).	\N	\N	t	2026-10-18 21:06:43.666884	\N	2026-10-18 21:06:43.666884	f
159	13	66	catering_update	in_app	New catering order #28 — AP-20261018-0066	Customer-01 ordered catering for 400 guests (LKR 48,000.00).	\N	\N	t	2026-10-18 21:06:43.666884	\N	2026-10-18 21:06:43.666884	f
160	1	66	catering_update	in_app	New catering order #28 — AP-20261018-0066	Customer-01 ordered catering for 400 guests (LKR 48,000.00).	\N	\N	t	2026-10-18 21:06:43.666884	\N	2026-10-18 21:06:43.666884	f
156	6	66	catering_update	email	Catering order #28 received — AP-20261018-0066	Hi Customer-01,\n\nWe received your catering order #28 for booking AP-20261018-0066.\n\n- 400 x Watalappan\n\nGuests: 400\nTotal: LKR 48,000.00\nCatering is billed separately by the restaurant. We'll email you as the order progresses.	thirayafathima@gmail.com	\N	f	\N	getaddrinfo ENOTFOUND smtp.sendgrid.net	2026-10-18 21:06:43.666132	f
161	6	67	booking_confirmation	email	Booking request received — AP-20261018-0067	Hi Customer-01,\n\nWe've received your booking request for Aazath Plaza. Here are the details:\n\nReference: AP-20261018-0067\nHall: Hall 1 - Grand + Hall 2 - Banquet\nDate: 2026-11-07\nTime: 09:00 - 14:00\nEvent type: Wedding Function\nGuests: 1000\nTotal: LKR 65000\n\nYour booking is currently pending confirmation from our team. We'll notify you once it's confirmed.	thirayafathima@gmail.com	\N	t	2026-10-18 21:10:37.24711	\N	2026-10-18 21:10:37.24711	f
162	19	67	booking_confirmation	in_app	New booking request — AP-20261018-0067	Customer-01 requested Hall 1 - Grand + Hall 2 - Banquet for Wedding Function on 2026-11-07 (1000 guests).	\N	\N	t	2026-10-18 21:10:37.514126	\N	2026-10-18 21:10:37.514126	f
163	3	67	booking_confirmation	in_app	New booking request — AP-20261018-0067	Customer-01 requested Hall 1 - Grand + Hall 2 - Banquet for Wedding Function on 2026-11-07 (1000 guests).	\N	\N	t	2026-10-18 21:10:37.514126	\N	2026-10-18 21:10:37.514126	f
164	1	67	booking_confirmation	in_app	New booking request — AP-20261018-0067	Customer-01 requested Hall 1 - Grand + Hall 2 - Banquet for Wedding Function on 2026-11-07 (1000 guests).	\N	\N	t	2026-10-18 21:10:37.514126	\N	2026-10-18 21:10:37.514126	f
165	6	67	booking_confirmation	sms	\N	Aazath Plaza: Booking request received (AP-20261018-0067) for Hall 1 - Grand + Hall 2 - Banquet on 2026-11-07. Status: pending confirmation. We'll text you once it's confirmed.	\N	+94779972423	f	\N	You have exceeded your sending limit.	2026-10-18 21:10:38.092691	f
166	6	68	booking_confirmation	email	Booking request received — AP-20261018-0068	Hi Customer-01,\n\nWe've received your booking request for Aazath Plaza. Here are the details:\n\nReference: AP-20261018-0068\nHall: Hall 1 - Grand\nDate: 2026-11-28\nTime: 09:00 - 17:00\nEvent type: Political Event\nGuests: 250\nTotal: LKR 30000\n\nYour booking is currently pending confirmation from our team. We'll notify you once it's confirmed.	thirayafathima@gmail.com	\N	t	2026-10-18 22:40:05.939229	\N	2026-10-18 22:40:05.939229	f
167	19	68	booking_confirmation	in_app	New booking request — AP-20261018-0068	Customer-01 requested Hall 1 - Grand for Political Event on 2026-11-28 (250 guests).	\N	\N	t	2026-10-18 22:40:06.209919	\N	2026-10-18 22:40:06.209919	f
168	3	68	booking_confirmation	in_app	New booking request — AP-20261018-0068	Customer-01 requested Hall 1 - Grand for Political Event on 2026-11-28 (250 guests).	\N	\N	t	2026-10-18 22:40:06.209919	\N	2026-10-18 22:40:06.209919	f
169	1	68	booking_confirmation	in_app	New booking request — AP-20261018-0068	Customer-01 requested Hall 1 - Grand for Political Event on 2026-11-28 (250 guests).	\N	\N	t	2026-10-18 22:40:06.209919	\N	2026-10-18 22:40:06.209919	f
170	6	68	booking_confirmation	sms	\N	Aazath Plaza: Booking request received (AP-20261018-0068) for Hall 1 - Grand on 2026-11-28. Status: pending confirmation. We'll text you once it's confirmed.	\N	+94779972423	f	\N	You have exceeded your sending limit.	2026-10-18 22:40:06.96059	f
171	6	68	catering_update	email	Catering order #29 received — AP-20261018-0068	Hi Customer-01,\n\nWe received your catering order #29 for booking AP-20261018-0068.\n\n- 250 x Fried Rice with Chicken\n\nGuests: 250\nTotal: LKR 95,000.00\nCatering is billed separately by the restaurant. We'll email you as the order progresses.	thirayafathima@gmail.com	\N	t	2026-10-18 22:40:08.569669	\N	2026-10-18 22:40:08.569669	f
172	19	68	catering_update	in_app	New catering order #29 — AP-20261018-0068	Customer-01 ordered catering for 250 guests (LKR 95,000.00).	\N	\N	t	2026-10-18 22:40:08.573591	\N	2026-10-18 22:40:08.573591	f
173	3	68	catering_update	in_app	New catering order #29 — AP-20261018-0068	Customer-01 ordered catering for 250 guests (LKR 95,000.00).	\N	\N	t	2026-10-18 22:40:08.573591	\N	2026-10-18 22:40:08.573591	f
174	13	68	catering_update	in_app	New catering order #29 — AP-20261018-0068	Customer-01 ordered catering for 250 guests (LKR 95,000.00).	\N	\N	t	2026-10-18 22:40:08.573591	\N	2026-10-18 22:40:08.573591	f
175	1	68	catering_update	in_app	New catering order #29 — AP-20261018-0068	Customer-01 ordered catering for 250 guests (LKR 95,000.00).	\N	\N	t	2026-10-18 22:40:08.573591	\N	2026-10-18 22:40:08.573591	f
176	6	68	payment_receipt	email	Payment received — AP-20261018-0068 (Invoice INV-20261018-62)	Hi Customer-01,\n\nWe received your payment of LKR 30,000.00 for booking AP-20261018-0068. Your booking for 28/11/2026 is confirmed. Invoice INV-20261018-62 is attached.	thirayafathima@gmail.com	\N	t	2026-10-18 22:41:06.928233	\N	2026-10-18 22:41:06.928233	f
177	19	68	payment_receipt	in_app	Payment received — AP-20261018-0068	Customer-01 paid LKR 30,000.00 for the event on 28/11/2026. Invoice INV-20261018-62.	\N	\N	t	2026-10-18 22:41:07.114463	\N	2026-10-18 22:41:07.114463	f
178	3	68	payment_receipt	in_app	Payment received — AP-20261018-0068	Customer-01 paid LKR 30,000.00 for the event on 28/11/2026. Invoice INV-20261018-62.	\N	\N	t	2026-10-18 22:41:07.114463	\N	2026-10-18 22:41:07.114463	f
179	1	68	payment_receipt	in_app	Payment received — AP-20261018-0068	Customer-01 paid LKR 30,000.00 for the event on 28/11/2026. Invoice INV-20261018-62.	\N	\N	t	2026-10-18 22:41:07.114463	\N	2026-10-18 22:41:07.114463	f
180	6	68	payment_receipt	sms	\N	Aazath Plaza: Payment of LKR 30,000 received for AP-20261018-0068. Your booking for 28/11/2026 is confirmed. Invoice: INV-20261018-62.	\N	+94779972423	f	\N	You have exceeded your sending limit.	2026-10-18 22:41:07.761706	f
181	11	26	event_reminder	sms	\N	Aazath Plaza: Reminder - your event (AP-20260913-0026) is tomorrow, 20/10/2026 from 09:00. We look forward to hosting you.	\N	+94771122334	f	\N	You have exceeded your sending limit.	2026-10-19 09:00:01.117153	f
182	11	26	event_reminder	email	Reminder: your event is tomorrow — AP-20260913-0026	Hi Akbar Traders,\n\nA reminder that your event (AP-20260913-0026) at Hall 1 - Grand is tomorrow, 20 Oct 2026 from 09:00. We look forward to hosting you.	sponsor@akbartraders.lk	\N	t	2026-10-19 09:00:04.452986	\N	2026-10-19 09:00:04.452986	f
183	17	69	booking_confirmation	email	Booking request received — AP-20261019-0069	Hi Test Customer,\n\nWe've received your booking request for Aazath Plaza. Here are the details:\n\nReference: AP-20261019-0069\nHall: Hall 1 - Grand\nDate: 2026-12-20\nTime: 09:00 - 14:00\nEvent type: Engagement Party\nGuests: 450\nTotal: LKR 30000\n\nYour booking is currently pending confirmation from our team. We'll notify you once it's confirmed.	test@example.com	\N	t	2026-10-19 13:58:03.848224	\N	2026-10-19 13:58:03.848224	f
184	19	69	booking_confirmation	in_app	New booking request — AP-20261019-0069	Test Customer requested Hall 1 - Grand for Engagement Party on 2026-12-20 (450 guests).	\N	\N	t	2026-10-19 13:58:04.053356	\N	2026-10-19 13:58:04.053356	f
185	3	69	booking_confirmation	in_app	New booking request — AP-20261019-0069	Test Customer requested Hall 1 - Grand for Engagement Party on 2026-12-20 (450 guests).	\N	\N	t	2026-10-19 13:58:04.053356	\N	2026-10-19 13:58:04.053356	f
186	1	69	booking_confirmation	in_app	New booking request — AP-20261019-0069	Test Customer requested Hall 1 - Grand for Engagement Party on 2026-12-20 (450 guests).	\N	\N	t	2026-10-19 13:58:04.053356	\N	2026-10-19 13:58:04.053356	f
187	17	69	booking_confirmation	sms	\N	Aazath Plaza: Booking request received (AP-20261019-0069) for Hall 1 - Grand on 2026-12-20. Status: pending confirmation. We'll text you once it's confirmed.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-19 13:58:04.960138	f
188	17	69	catering_update	email	Catering order #30 received — AP-20261019-0069	Hi Test Customer,\n\nWe received your catering order #30 for booking AP-20261019-0069.\n\n- 450 x Chocolate Fountain\n\nGuests: 450\nTotal: LKR 157,500.00\nCatering is billed separately by the restaurant. We'll email you as the order progresses.	test@example.com	\N	t	2026-10-19 13:58:07.736535	\N	2026-10-19 13:58:07.736535	f
189	19	69	catering_update	in_app	New catering order #30 — AP-20261019-0069	Test Customer ordered catering for 450 guests (LKR 157,500.00).	\N	\N	t	2026-10-19 13:58:07.739658	\N	2026-10-19 13:58:07.739658	f
190	3	69	catering_update	in_app	New catering order #30 — AP-20261019-0069	Test Customer ordered catering for 450 guests (LKR 157,500.00).	\N	\N	t	2026-10-19 13:58:07.739658	\N	2026-10-19 13:58:07.739658	f
191	13	69	catering_update	in_app	New catering order #30 — AP-20261019-0069	Test Customer ordered catering for 450 guests (LKR 157,500.00).	\N	\N	t	2026-10-19 13:58:07.739658	\N	2026-10-19 13:58:07.739658	f
192	1	69	catering_update	in_app	New catering order #30 — AP-20261019-0069	Test Customer ordered catering for 450 guests (LKR 157,500.00).	\N	\N	t	2026-10-19 13:58:07.739658	\N	2026-10-19 13:58:07.739658	f
193	26	69	catering_update	in_app	New catering order #30 — AP-20261019-0069	Test Customer ordered catering for 450 guests (LKR 157,500.00).	\N	\N	t	2026-10-19 13:58:07.739658	\N	2026-10-19 13:58:07.739658	f
194	17	69	payment_receipt	email	Payment received — AP-20261019-0069 (Invoice INV-20261019-63)	Hi Test Customer,\n\nWe received your payment of LKR 30,000.00 for booking AP-20261019-0069. Your booking for 20/12/2026 is confirmed. Invoice INV-20261019-63 is attached.	test@example.com	\N	t	2026-10-19 13:58:22.400089	\N	2026-10-19 13:58:22.400089	f
195	19	69	payment_receipt	in_app	Payment received — AP-20261019-0069	Test Customer paid LKR 30,000.00 for the event on 20/12/2026. Invoice INV-20261019-63.	\N	\N	t	2026-10-19 13:58:22.761775	\N	2026-10-19 13:58:22.761775	f
196	3	69	payment_receipt	in_app	Payment received — AP-20261019-0069	Test Customer paid LKR 30,000.00 for the event on 20/12/2026. Invoice INV-20261019-63.	\N	\N	t	2026-10-19 13:58:22.761775	\N	2026-10-19 13:58:22.761775	f
197	1	69	payment_receipt	in_app	Payment received — AP-20261019-0069	Test Customer paid LKR 30,000.00 for the event on 20/12/2026. Invoice INV-20261019-63.	\N	\N	t	2026-10-19 13:58:22.761775	\N	2026-10-19 13:58:22.761775	f
198	17	69	payment_receipt	sms	\N	Aazath Plaza: Payment of LKR 30,000 received for AP-20261019-0069. Your booking for 20/12/2026 is confirmed. Invoice: INV-20261019-63.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-19 13:58:23.414243	f
199	17	13	booking_confirmation	email	Booking confirmed — AP-20260912-0013	Hi Test Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20260912-0013\nHall: Hall 1 - Grand\nDate: 17/09/2026	test@example.com	\N	t	2026-10-19 14:01:45.244371	\N	2026-10-19 14:01:45.244371	f
200	17	13	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20260912-0013 for 17/09/2026 has been confirmed. We look forward to hosting you.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-19 14:01:45.859113	f
201	7	9	booking_confirmation	email	Booking confirmed — AP-20260805-0009	Hi Nusaibah Farhan,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20260805-0009\nHall: Hall 2 - Banquet\nDate: 08/08/2026	nusaibah@gmail.com	\N	t	2026-10-19 14:01:47.400698	\N	2026-10-19 14:01:47.400698	f
202	7	9	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20260805-0009 for 08/08/2026 has been confirmed. We look forward to hosting you.	\N	+94777890123	f	\N	You have exceeded your sending limit.	2026-10-19 14:01:47.769468	f
203	17	11	booking_confirmation	email	Booking confirmed — AP-20260621-0011	Hi Test Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20260621-0011\nHall: Hall 1 - Grand\nDate: 15/08/2026	test@example.com	\N	t	2026-10-19 14:01:47.806312	\N	2026-10-19 14:01:47.806312	f
204	17	11	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20260621-0011 for 15/08/2026 has been confirmed. We look forward to hosting you.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-19 14:01:48.210035	f
205	6	38	booking_confirmation	email	Booking confirmed — AP-20260921-0038	Hi Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20260921-0038\nHall: Hall 1 - Grand\nDate: 02/10/2026	thirayafathima@gmail.com	\N	t	2026-10-19 14:01:55.576272	\N	2026-10-19 14:01:55.576272	f
206	6	38	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20260921-0038 for 02/10/2026 has been confirmed. We look forward to hosting you.	\N	+94779972423	f	\N	You have exceeded your sending limit.	2026-10-19 14:01:55.832312	f
207	6	37	booking_confirmation	email	Booking confirmed — AP-20260920-0037	Hi Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20260920-0037\nHall: Hall 1 - Grand\nDate: 30/09/2026	thirayafathima@gmail.com	\N	t	2026-10-19 14:01:57.146124	\N	2026-10-19 14:01:57.146124	f
208	6	37	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20260920-0037 for 30/09/2026 has been confirmed. We look forward to hosting you.	\N	+94779972423	f	\N	You have exceeded your sending limit.	2026-10-19 14:01:57.526962	f
209	1	43	cancellation	email	Booking cancelled — AP-20260927-0043	Hi Admin,\n\nYour booking has been cancelled. Please contact us if you have any questions.\n\nReference: AP-20260927-0043\nHall: Hall 2 - Banquet\nDate: 27/09/2026\nReason: cancellation test.	admin@aazathplaza.lk	\N	t	2026-10-19 14:02:33.336743	\N	2026-10-19 14:02:33.336743	f
210	1	43	cancellation	sms	\N	Aazath Plaza: Your booking AP-20260927-0043 for 27/09/2026 has been cancelled. Reason: cancellation test.. Please contact us if you have questions.	\N	+94771234567	f	\N	You have exceeded your sending limit.	2026-10-19 14:02:33.935222	f
211	18	36	cancellation	email	Booking cancelled — AP-20260920-0036	Hi Reg-Testing,\n\nYour booking has been cancelled. Please contact us if you have any questions.\n\nReference: AP-20260920-0036\nHall: Hall 2 - Banquet\nDate: 25/09/2026\nReason: testing..	testreg@gmail.com	\N	t	2026-10-19 14:03:01.585677	\N	2026-10-19 14:03:01.585677	f
212	17	50	booking_confirmation	email	Booking confirmed — AP-20261007-0050	Hi Test Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20261007-0050\nHall: Hall 1 - Grand\nDate: 19/12/2026	test@example.com	\N	t	2026-10-19 14:05:14.296477	\N	2026-10-19 14:05:14.296477	f
213	17	51	booking_confirmation	email	Booking confirmed — AP-20261007-0051	Hi Test Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20261007-0051\nHall: Hall 1 - Grand\nDate: 15/12/2026	test@example.com	\N	t	2026-10-19 14:05:14.349516	\N	2026-10-19 14:05:14.349516	f
214	1	60	booking_confirmation	email	Booking confirmed — AP-20261013-0060	Hi Admin,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20261013-0060\nHall: Hall 1 - Grand\nDate: 12/01/2027	admin@aazathplaza.lk	\N	t	2026-10-19 14:05:14.470676	\N	2026-10-19 14:05:14.470676	f
215	17	51	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20261007-0051 for 15/12/2026 has been confirmed. We look forward to hosting you.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:14.48083	f
216	1	58	booking_confirmation	email	Booking confirmed — AP-20261010-0058	Hi Admin,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20261010-0058\nHall: Hall 2 - Banquet\nDate: 23/11/2026	admin@aazathplaza.lk	\N	t	2026-10-19 14:05:14.546567	\N	2026-10-19 14:05:14.546567	f
217	6	67	booking_confirmation	email	Booking confirmed — AP-20261018-0067	Hi Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20261018-0067\nHall: Hall 1 - Grand + Hall 2 - Banquet\nDate: 07/11/2026	thirayafathima@gmail.com	\N	t	2026-10-19 14:05:14.583714	\N	2026-10-19 14:05:14.583714	f
218	1	60	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20261013-0060 for 12/01/2027 has been confirmed. We look forward to hosting you.	\N	+94771234567	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:14.642211	f
219	11	30	booking_confirmation	email	Booking confirmed — AP-20260913-0030	Hi Akbar Traders,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20260913-0030\nHall: Hall 1 - Grand\nDate: 28/10/2026	sponsor@akbartraders.lk	\N	t	2026-10-19 14:05:14.736262	\N	2026-10-19 14:05:14.736262	f
220	17	64	booking_confirmation	email	Booking confirmed — AP-20261017-0064	Hi Test Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20261017-0064\nHall: Hall 1 - Grand\nDate: 01/12/2026	test@example.com	\N	t	2026-10-19 14:05:14.774897	\N	2026-10-19 14:05:14.774897	f
221	6	57	booking_confirmation	email	Booking confirmed — AP-20261010-0057	Hi Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20261010-0057\nHall: Hall 1 - Grand\nDate: 10/11/2026	thirayafathima@gmail.com	\N	t	2026-10-19 14:05:14.830068	\N	2026-10-19 14:05:14.830068	f
222	1	58	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20261010-0058 for 23/11/2026 has been confirmed. We look forward to hosting you.	\N	+94771234567	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:14.941768	f
223	6	66	booking_confirmation	email	Booking confirmed — AP-20261018-0066	Hi Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20261018-0066\nHall: Hall 1 - Grand\nDate: 18/11/2026	thirayafathima@gmail.com	\N	t	2026-10-19 14:05:14.97513	\N	2026-10-19 14:05:14.97513	f
224	11	30	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20260913-0030 for 28/10/2026 has been confirmed. We look forward to hosting you.	\N	+94771122334	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:15.089059	f
228	17	50	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20261007-0050 for 19/12/2026 has been confirmed. We look forward to hosting you.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:15.330444	f
229	6	66	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20261018-0066 for 18/11/2026 has been confirmed. We look forward to hosting you.	\N	+94779972423	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:15.513858	f
225	6	67	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20261018-0067 for 07/11/2026 has been confirmed. We look forward to hosting you.	\N	+94779972423	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:15.097143	f
226	6	57	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20261010-0057 for 10/11/2026 has been confirmed. We look forward to hosting you.	\N	+94779972423	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:15.143745	f
227	17	64	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20261017-0064 for 01/12/2026 has been confirmed. We look forward to hosting you.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:15.241945	f
230	17	53	booking_confirmation	email	Booking confirmed — AP-20261008-0053	Hi Test Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20261008-0053\nHall: Hall 1 - Grand\nDate: 27/10/2026	test@example.com	\N	t	2026-10-19 14:05:15.527332	\N	2026-10-19 14:05:15.527332	f
231	11	22	booking_confirmation	email	Booking confirmed — AP-20260913-0022	Hi Akbar Traders,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20260913-0022\nHall: Hall 1 - Grand\nDate: 12/10/2026	sponsor@akbartraders.lk	\N	t	2026-10-19 14:05:15.637892	\N	2026-10-19 14:05:15.637892	f
232	17	55	booking_confirmation	email	Booking confirmed — AP-20261010-0055	Hi Test Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20261010-0055\nHall: Hall 1 - Grand\nDate: 21/10/2026	test@example.com	\N	t	2026-10-19 14:05:15.658407	\N	2026-10-19 14:05:15.658407	f
233	17	47	booking_confirmation	email	Booking confirmed — AP-20260930-0047	Hi Test Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20260930-0047\nHall: Hall 1 - Grand\nDate: 10/10/2026	test@example.com	\N	t	2026-10-19 14:05:15.695497	\N	2026-10-19 14:05:15.695497	f
234	4	27	booking_confirmation	email	Booking confirmed — AP-20260913-0027	Hi Mohamed Rifkan,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20260913-0027\nHall: Hall 2 - Banquet\nDate: 22/10/2026	rifkan@gmail.com	\N	t	2026-10-19 14:05:15.753463	\N	2026-10-19 14:05:15.753463	f
235	17	53	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20261008-0053 for 27/10/2026 has been confirmed. We look forward to hosting you.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:15.818455	f
236	6	41	booking_confirmation	email	Booking confirmed — AP-20260922-0041	Hi Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20260922-0041\nHall: Hall 1 - Grand\nDate: 27/09/2026	thirayafathima@gmail.com	\N	t	2026-10-19 14:05:15.854338	\N	2026-10-19 14:05:15.854338	f
237	6	35	booking_confirmation	email	Booking confirmed — AP-20260919-0035	Hi Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20260919-0035\nHall: Hall 2 - Banquet\nDate: 26/09/2026	thirayafathima@gmail.com	\N	t	2026-10-19 14:05:15.855138	\N	2026-10-19 14:05:15.855138	f
238	17	55	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20261010-0055 for 21/10/2026 has been confirmed. We look forward to hosting you.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:15.952668	f
239	11	22	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20260913-0022 for 12/10/2026 has been confirmed. We look forward to hosting you.	\N	+94771122334	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:15.993686	f
240	17	34	booking_confirmation	email	Booking confirmed — AP-20260919-0034	Hi Test Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20260919-0034\nHall: Hall 1 - Grand\nDate: 25/09/2026	test@example.com	\N	t	2026-10-19 14:05:16.001623	\N	2026-10-19 14:05:16.001623	f
241	17	47	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20260930-0047 for 10/10/2026 has been confirmed. We look forward to hosting you.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:16.060558	f
242	6	41	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20260922-0041 for 27/09/2026 has been confirmed. We look forward to hosting you.	\N	+94779972423	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:16.137361	f
243	6	35	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20260919-0035 for 26/09/2026 has been confirmed. We look forward to hosting you.	\N	+94779972423	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:16.223617	f
244	6	20	booking_confirmation	email	Booking confirmed — AP-20260913-0020	Hi Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20260913-0020\nHall: Hall 1 - Grand\nDate: 07/10/2026	thirayafathima@gmail.com	\N	t	2026-10-19 14:05:16.383269	\N	2026-10-19 14:05:16.383269	f
245	17	34	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20260919-0034 for 25/09/2026 has been confirmed. We look forward to hosting you.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:16.415366	f
246	4	27	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20260913-0027 for 22/10/2026 has been confirmed. We look forward to hosting you.	\N	+94774567890	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:16.434264	f
247	17	18	booking_confirmation	email	Booking confirmed — AP-20260913-0018	Hi Test Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20260913-0018\nHall: Hall 1 - Grand\nDate: 05/10/2026	test@example.com	\N	t	2026-10-19 14:05:16.598031	\N	2026-10-19 14:05:16.598031	f
248	6	20	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20260913-0020 for 07/10/2026 has been confirmed. We look forward to hosting you.	\N	+94779972423	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:16.670641	f
249	17	32	booking_confirmation	email	Booking confirmed — AP-20260918-0032	Hi Test Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20260918-0032\nHall: Hall 1 - Grand\nDate: 23/09/2026	test@example.com	\N	t	2026-10-19 14:05:16.77478	\N	2026-10-19 14:05:16.77478	f
250	17	18	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20260913-0018 for 05/10/2026 has been confirmed. We look forward to hosting you.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:16.907045	f
251	17	32	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20260918-0032 for 23/09/2026 has been confirmed. We look forward to hosting you.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-19 14:05:17.105952	f
252	1	62	cancellation	email	Booking cancelled — AP-20261017-0062	Hi Admin,\n\nYour booking has been cancelled. Please contact us if you have any questions.\n\nReference: AP-20261017-0062\nHall: Hall 1 - Grand\nDate: 02/11/2026\nReason: test.	admin@aazathplaza.lk	\N	t	2026-10-19 14:06:13.504418	\N	2026-10-19 14:06:13.504418	f
253	1	62	cancellation	sms	\N	Aazath Plaza: Your booking AP-20261017-0062 for 02/11/2026 has been cancelled. Reason: test.. Please contact us if you have questions.	\N	+94771234567	f	\N	You have exceeded your sending limit.	2026-10-19 14:06:14.184929	f
254	11	26	event_reminder	sms	\N	Aazath Plaza: Reminder - your event (AP-20260913-0026) is tomorrow, 20/10/2026 from 09:00. We look forward to hosting you.	\N	+94771122334	f	\N	You have exceeded your sending limit.	2026-10-19 15:00:01.55228	f
255	17	70	booking_confirmation	email	Booking request received — AP-20261020-0070	Hi Test Customer,\n\nWe've received your booking request for Aazath Plaza. Here are the details:\n\nReference: AP-20261020-0070\nHall: Hall 1 - Grand\nDate: 2026-12-24\nTime: 09:00 - 14:00\nEvent type: Birthday Function\nGuests: 250\nTotal: LKR 75000\n\nYour booking is currently pending confirmation from our team. We'll notify you once it's confirmed.	test@example.com	\N	t	2026-10-20 13:35:45.487339	\N	2026-10-20 13:35:45.487339	f
256	19	70	booking_confirmation	in_app	New booking request — AP-20261020-0070	Test Customer requested Hall 1 - Grand for Birthday Function on 2026-12-24 (250 guests).	\N	\N	t	2026-10-20 13:35:45.627784	\N	2026-10-20 13:35:45.627784	f
257	1	70	booking_confirmation	in_app	New booking request — AP-20261020-0070	Test Customer requested Hall 1 - Grand for Birthday Function on 2026-12-24 (250 guests).	\N	\N	t	2026-10-20 13:35:45.627784	\N	2026-10-20 13:35:45.627784	f
258	3	70	booking_confirmation	in_app	New booking request — AP-20261020-0070	Test Customer requested Hall 1 - Grand for Birthday Function on 2026-12-24 (250 guests).	\N	\N	t	2026-10-20 13:35:45.627784	\N	2026-10-20 13:35:45.627784	f
259	17	70	booking_confirmation	sms	\N	Aazath Plaza: Booking request received (AP-20261020-0070) for Hall 1 - Grand on 2026-12-24. Status: pending confirmation. We'll text you once it's confirmed.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-20 13:35:46.094473	f
261	13	70	catering_update	in_app	New catering order #31 — AP-20261020-0070	Test Customer ordered catering for 250 guests (LKR 6,500.00).	\N	\N	t	2026-10-20 13:35:47.54419	\N	2026-10-20 13:35:47.54419	f
260	17	70	catering_update	email	Catering order #31 received — AP-20261020-0070	Hi Test Customer,\n\nWe received your catering order #31 for booking AP-20261020-0070.\n\n- 1 x Birthday Cake (2kg)\n\nGuests: 250\nTotal: LKR 6,500.00\nCatering is billed separately by the restaurant. We'll email you as the order progresses.	test@example.com	\N	t	2026-10-20 13:35:47.540851	\N	2026-10-20 13:35:47.540851	f
262	19	70	catering_update	in_app	New catering order #31 — AP-20261020-0070	Test Customer ordered catering for 250 guests (LKR 6,500.00).	\N	\N	t	2026-10-20 13:35:47.54419	\N	2026-10-20 13:35:47.54419	f
263	1	70	catering_update	in_app	New catering order #31 — AP-20261020-0070	Test Customer ordered catering for 250 guests (LKR 6,500.00).	\N	\N	t	2026-10-20 13:35:47.54419	\N	2026-10-20 13:35:47.54419	f
264	3	70	catering_update	in_app	New catering order #31 — AP-20261020-0070	Test Customer ordered catering for 250 guests (LKR 6,500.00).	\N	\N	t	2026-10-20 13:35:47.54419	\N	2026-10-20 13:35:47.54419	f
265	26	70	catering_update	in_app	New catering order #31 — AP-20261020-0070	Test Customer ordered catering for 250 guests (LKR 6,500.00).	\N	\N	t	2026-10-20 13:35:47.54419	\N	2026-10-20 13:35:47.54419	f
266	17	55	event_reminder	sms	\N	Aazath Plaza: Reminder - your event (AP-20261010-0055) is tomorrow, 21/10/2026 from 09:00. We look forward to hosting you.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-20 15:00:01.86635	f
267	17	55	event_reminder	email	Reminder: your event is tomorrow — AP-20261010-0055	Hi Test Customer,\n\nA reminder that your event (AP-20261010-0055) at Hall 1 - Grand is tomorrow, 21 Oct 2026 from 09:00. We look forward to hosting you.	test@example.com	\N	t	2026-10-20 15:00:04.839988	\N	2026-10-20 15:00:04.839988	f
268	17	56	cancellation	email	Booking cancelled — AP-20261010-0056	Hi Test Customer,\n\nYour booking has been cancelled. Please contact us if you have any questions.\n\nReference: AP-20261010-0056\nHall: Hall 2 - Banquet\nDate: 20/10/2026\nReason: Date conflict. Please Book another date.	test@example.com	\N	t	2026-10-20 15:06:22.09805	\N	2026-10-20 15:06:22.09805	f
269	17	56	cancellation	sms	\N	Aazath Plaza: Your booking AP-20261010-0056 for 20/10/2026 has been cancelled. Reason: Date conflict. Please Book another date.. Please contact us if you have questions.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-20 15:06:23.168551	f
270	17	70	booking_confirmation	email	Booking confirmed — AP-20261020-0070	Hi Test Customer,\n\nGood news — your booking has been confirmed. We look forward to hosting you.\n\nReference: AP-20261020-0070\nHall: Hall 1 - Grand\nDate: 24/12/2026	test@example.com	\N	t	2026-10-20 15:07:39.903979	\N	2026-10-20 15:07:39.903979	f
271	17	70	booking_confirmation	sms	\N	Aazath Plaza: Your booking AP-20261020-0070 for 24/12/2026 has been confirmed. We look forward to hosting you.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-20 15:07:40.989078	f
272	17	65	cancellation	email	Booking cancelled — AP-20261018-0065	Hi Test Customer,\n\nYour booking has been cancelled. Please contact us if you have any questions.\n\nReference: AP-20261018-0065\nHall: Hall 2 - Banquet\nDate: 26/11/2026	test@example.com	\N	t	2026-10-20 15:39:26.657887	\N	2026-10-20 15:39:26.657887	f
273	17	65	cancellation	sms	\N	Aazath Plaza: Your booking AP-20261018-0065 for 26/11/2026 has been cancelled. Please contact us if you have questions.	\N	0771234567	f	\N	You have exceeded your sending limit.	2026-10-20 15:39:27.286383	f
\.


--
-- Data for Name: organizers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organizers (organizer_id, user_id, business_name, specialty, experience_years, portfolio_url, bio, service_areas, price_range, avg_rating, total_reviews, is_verified, is_available, created_at, updated_at) FROM stdin;
1	9	Riyaz Events & Decorations	Wedding & Reception Decoration	8	https://riyazevents.lk	Specialising in traditional Sri Lankan and modern wedding decorations. Over 500 successful events.	\N	LKR 25,000 - 80,000	4.80	45	t	t	2026-05-29 11:34:23.064997	2026-05-29 11:34:23.064997
2	10	Fathima Floral Designs	Floral Arrangements & Stage Setup	5	https://fathimaflorals.lk	Expert in fresh floral arrangements, stage backdrops and table centrepieces for all occasions.		LKR 15,000 - 50,000	4.60	28	t	t	2026-05-29 11:34:23.064997	2026-10-12 10:22:22.107063
3	24	organizer-test	General	0	\N	\N	\N	\N	0.00	0	f	t	2026-10-19 09:39:00.458409	2026-10-19 09:39:00.458409
4	25	organizer-test2	General	0	\N	\N	\N	\N	0.00	0	f	t	2026-10-19 09:44:54.292227	2026-10-19 09:44:54.292227
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_tokens (id, user_id, token, expires_at, used_at, created_at) FROM stdin;
10	6	0bea74b43455f5eb9cbcf155701e0b27af1cfcd0590bbf33389de8aefb3cd607	2026-10-19 11:12:36.442	2026-10-19 10:13:44.246267	2026-10-19 10:12:36.479343
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (payment_id, booking_id, amount, payment_method, transaction_id, payhere_order_id, status, currency, invoice_url, invoice_number, paid_at, refunded_at, refund_reason, gateway_response, created_at, updated_at) FROM stdin;
1	1	165000.00	bank_transfer	TXN-2026-001-BT	\N	completed	LKR	\N	INV-2026-0001	2026-01-15 13:00:00	\N	\N	\N	2026-05-29 11:35:38.935811	2026-05-29 11:35:38.935811
2	2	110000.00	credit_card	TXN-2026-002-CC	\N	completed	LKR	\N	INV-2026-0002	2026-02-10 15:30:00	\N	\N	\N	2026-05-29 11:35:38.935811	2026-05-29 11:35:38.935811
3	3	242000.00	bank_transfer	TXN-2026-003-BT	\N	completed	LKR	\N	INV-2026-0003	2026-03-05 11:00:00	\N	\N	\N	2026-05-29 11:35:38.935811	2026-05-29 11:35:38.935811
4	4	110000.00	credit_card	TXN-2026-004-CC	\N	completed	LKR	\N	INV-2026-0004	2026-03-22 08:00:00	\N	\N	\N	2026-05-29 11:35:38.935811	2026-05-29 11:35:38.935811
5	5	165000.00	bank_transfer	TXN-2026-005-BT	\N	completed	LKR	\N	INV-2026-0005	2026-04-10 12:00:00	\N	\N	\N	2026-05-29 11:35:38.935811	2026-05-29 11:35:38.935811
6	6	93500.00	mobile_wallet	TXN-2026-006-MW	\N	completed	LKR	\N	INV-2026-0006	2026-04-15 16:00:00	\N	\N	\N	2026-05-29 11:35:38.935811	2026-05-29 11:35:38.935811
7	7	56100.00	credit_card	TXN-2026-007-CC	\N	completed	LKR	\N	INV-2026-0007	2026-05-01 10:00:00	\N	\N	\N	2026-05-29 11:35:38.935811	2026-05-29 11:35:38.935811
8	8	42500.00	bank_transfer	TXN-2026-008-BT	\N	pending	LKR	\N	INV-2026-0008	\N	\N	\N	\N	2026-05-29 11:35:38.935811	2026-05-29 11:35:38.935811
9	10	65000.00	bank_transfer	TXN-2026-010-BT	\N	refunded	LKR	\N	INV-2026-0010	2026-04-01 09:00:00	\N	\N	\N	2026-05-29 11:35:38.935811	2026-05-29 11:35:38.935811
11	8	85000.00	credit_card	\N	AZP-8-1783048935145	pending	LKR	\N	\N	\N	\N	\N	\N	2026-07-03 03:22:00.269961	2026-07-03 03:22:00.269961
10	8	85000.00	credit_card	TEST_PAYMENT_1783263014411	AZP-8-1783048758088	completed	LKR	\N	\N	2026-07-05 15:08:53.435252	\N	\N	{"md5sig": "CBE3CADD775D08464B9DB8B9341CAC95", "method": "VISA", "order_id": "AZP-8-1783048758088", "payment_id": "TEST_PAYMENT_1783263014411", "merchant_id": "1236612", "status_code": "2", "payhere_amount": "85000.00", "status_message": "Successfully completed the payment.", "payhere_currency": "LKR"}	2026-07-03 03:19:03.181182	2026-07-05 15:08:53.435252
12	13	60000.00	credit_card	\N	AZP-13-1789219391399	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-12 13:22:41.538319	2026-09-12 13:22:41.538319
13	13	60000.00	credit_card	\N	AZP-13-1789219422296	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-12 13:23:12.353458	2026-09-12 13:23:12.353458
14	13	60000.00	credit_card	\N	AZP-13-1789219540520	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-12 13:25:10.573164	2026-09-12 13:25:10.573164
15	13	60000.00	credit_card	\N	AZP-13-1789219569987	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-12 13:25:40.039535	2026-09-12 13:25:40.039535
16	14	40000.00	credit_card	\N	AZP-14-1789219876728	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-12 13:30:46.78705	2026-09-12 13:30:46.78705
17	14	40000.00	credit_card	\N	AZP-14-1789220116654	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-12 13:34:46.710246	2026-09-12 13:34:46.710246
18	14	40000.00	credit_card	\N	AZP-14-1789220289973	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-12 13:37:40.032041	2026-09-12 13:37:40.032041
19	15	60000.00	credit_card	\N	AZP-15-1789221031704	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-12 13:50:01.854649	2026-09-12 13:50:01.854649
20	15	60000.00	credit_card	\N	AZP-15-1789221118401	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-12 13:51:28.45593	2026-09-12 13:51:28.45593
21	15	60000.00	credit_card	\N	AZP-15-1789221228824	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-12 13:53:18.879415	2026-09-12 13:53:18.879415
22	16	20000.00	credit_card	\N	AZP-16-1789221754035	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-12 14:02:04.084767	2026-09-12 14:02:04.084767
23	17	20000.00	credit_card	320032653601	AZP-17-1789222877575	completed	LKR	\N	\N	2026-09-12 14:21:06.836406	\N	\N	{"md5sig": "EECF57F655C5770DC00FD8C4D407E66A", "method": "VISA", "card_no": "************1292", "custom_1": "", "custom_2": "", "order_id": "AZP-17-1789222877575", "recurring": "0", "payment_id": "320032653601", "card_expiry": "11/26", "merchant_id": "1236612", "status_code": "2", "payhere_amount": "20000.00", "status_message": "Successfully received the VISA payment", "captured_amount": "20000.00", "card_holder_name": "test", "payhere_currency": "LKR"}	2026-09-12 14:20:47.699352	2026-09-12 14:21:06.836406
24	32	25000.00	credit_card	\N	AZP-32-1789697830456	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-18 02:16:36.074779	2026-09-18 02:16:36.074779
25	32	25000.00	credit_card	\N	AZP-32-1789697847693	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-18 02:16:53.225065	2026-09-18 02:16:53.225065
26	35	20000.00	credit_card	\N	AZP-35-1789779355567	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-19 00:55:20.569058	2026-09-19 00:55:20.569058
27	36	75000.00	credit_card	\N	AZP-36-1789924020054	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-20 17:06:24.041032	2026-09-20 17:06:24.041032
28	36	75000.00	credit_card	\N	AZP-36-1789924036169	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-20 17:06:40.082345	2026-09-20 17:06:40.082345
29	38	20000.00	credit_card	\N	AZP-38-1789968355099	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-21 05:25:18.588607	2026-09-21 05:25:18.588607
30	38	20000.00	credit_card	\N	AZP-38-1789986623798	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-21 10:29:46.513154	2026-09-21 10:29:46.513154
31	38	20000.00	credit_card	\N	AZP-38-1789987037337	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-21 10:36:40.046141	2026-09-21 10:36:40.046141
32	39	20000.00	credit_card	320032658067	AZP-39-1790012970204	completed	LKR	\N	INV-20260921-32	2026-09-21 17:49:10.015447	\N	\N	{"md5sig": "12804618A6A3AFB27A3EADEE9737A91C", "method": "VISA", "card_no": "************1292", "custom_1": "", "custom_2": "", "order_id": "AZP-39-1790012970204", "recurring": "0", "payment_id": "320032658067", "card_expiry": "11/26", "merchant_id": "1236612", "status_code": "2", "payhere_amount": "20000.00", "status_message": "Successfully received the VISA payment", "captured_amount": "20000.00", "card_holder_name": "test3", "payhere_currency": "LKR"}	2026-09-21 17:48:52.837226	2026-09-21 17:49:12.290416
33	40	20000.00	credit_card	\N	AZP-40-1790046956775	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-22 03:15:19.901433	2026-09-22 03:15:19.901433
34	40	20000.00	credit_card	\N	AZP-40-1790047139109	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-22 03:18:22.243435	2026-09-22 03:18:22.243435
35	40	20000.00	credit_card	320032658215	AZP-40-1790047623667	completed	LKR	\N	INV-20260922-35	2026-09-22 03:26:46.796994	\N	\N	{"md5sig": "A66E4EC5D43CB60D1B7485EC26C3451E", "method": "VISA", "card_no": "************1292", "custom_1": "", "custom_2": "", "order_id": "AZP-40-1790047623667", "recurring": "0", "payment_id": "320032658215", "card_expiry": "11/26", "merchant_id": "1236612", "status_code": "2", "payhere_amount": "20000.00", "status_message": "Successfully received the VISA payment", "captured_amount": "20000.00", "card_holder_name": "test", "payhere_currency": "LKR"}	2026-09-22 03:26:26.714888	2026-09-22 03:26:48.019992
36	41	20000.00	credit_card	\N	AZP-41-1790068280362	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-22 09:10:42.593575	2026-09-22 09:10:42.593575
37	41	20000.00	credit_card	\N	AZP-41-1790068479119	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-22 09:14:01.330032	2026-09-22 09:14:01.330032
38	42	25000.00	credit_card	\N	AZP-42-1790247072699	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-24 10:50:33.310366	2026-09-24 10:50:33.310366
39	42	25000.00	credit_card	320032659761	AZP-42-1790247405104	completed	LKR	\N	\N	2026-09-24 10:56:24.627951	\N	\N	{"md5sig": "620514C7873B3F2F59FA4FB52BD88607", "method": "VISA", "card_no": "************1292", "custom_1": "", "custom_2": "", "order_id": "AZP-42-1790247405104", "recurring": "0", "payment_id": "320032659761", "card_expiry": "11/26", "merchant_id": "1236612", "status_code": "2", "payhere_amount": "25000.00", "status_message": "Successfully received the VISA payment", "captured_amount": "25000.00", "card_holder_name": "test", "payhere_currency": "LKR"}	2026-09-24 10:56:05.770441	2026-09-24 10:56:24.627951
40	44	45000.00	credit_card	320032661831	AZP-44-1790592561150	completed	LKR	\N	INV-20260928-40	2026-09-28 10:50:12.994378	\N	\N	{"md5sig": "6A4DED7CD1A0C70A429F9C113BA159A6", "method": "VISA", "card_no": "************1292", "custom_1": "", "custom_2": "", "order_id": "AZP-44-1790592561150", "recurring": "0", "payment_id": "320032661831", "card_expiry": "11/26", "merchant_id": "1236612", "status_code": "2", "payhere_amount": "45000.00", "status_message": "Successfully received the VISA payment", "captured_amount": "45000.00", "card_holder_name": "test", "payhere_currency": "LKR"}	2026-09-28 10:49:20.62272	2026-09-28 10:50:15.373845
41	45	55000.00	credit_card	\N	AZP-45-1790671371226	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-29 08:42:50.49804	2026-09-29 08:42:50.49804
42	46	20000.00	credit_card	\N	AZP-46-1790671527602	pending	LKR	\N	\N	\N	\N	\N	\N	2026-09-29 08:45:26.776916	2026-09-29 08:45:26.776916
43	46	20000.00	credit_card	320032662390	AZP-46-1790671652432	completed	LKR	\N	INV-20260929-43	2026-09-29 08:47:42.760506	\N	\N	{"md5sig": "30718014E66BE33757B435333280EFEC", "method": "VISA", "card_no": "************1292", "custom_1": "", "custom_2": "", "order_id": "AZP-46-1790671652432", "recurring": "0", "payment_id": "320032662390", "card_expiry": "11/26", "merchant_id": "1236612", "status_code": "2", "payhere_amount": "20000.00", "status_message": "Successfully received the VISA payment", "captured_amount": "20000.00", "card_holder_name": "test", "payhere_currency": "LKR"}	2026-09-29 08:47:31.651985	2026-09-29 08:47:45.013776
44	48	30000.00	credit_card	320032663073	AZP-48-1790751978237	completed	LKR	\N	INV-20260930-44	2026-09-30 07:06:30.761072	\N	\N	{"md5sig": "57ED319BEEE26FCD981A46B357257EE6", "method": "VISA", "card_no": "************1292", "custom_1": "", "custom_2": "", "order_id": "AZP-48-1790751978237", "recurring": "0", "payment_id": "320032663073", "card_expiry": "11/26", "merchant_id": "1236612", "status_code": "2", "payhere_amount": "30000.00", "status_message": "Successfully received the VISA payment", "captured_amount": "30000.00", "card_holder_name": "test", "payhere_currency": "LKR"}	2026-09-30 07:06:16.302642	2026-09-30 07:06:33.303244
45	51	70000.00	credit_card	\N	AZP-51-1791367271378	pending	LKR	\N	\N	\N	\N	\N	\N	2026-10-07 10:01:05.14181	2026-10-07 10:01:05.14181
47	53	25000.00	credit_card	\N	AZP-53-1791436107688	pending	LKR	\N	\N	\N	\N	\N	\N	2026-10-08 05:08:20.382133	2026-10-08 05:08:20.382133
48	54	60000.00	credit_card	\N	AZP-54-1791459010020	pending	LKR	\N	\N	\N	\N	\N	\N	2026-10-08 11:30:03.177612	2026-10-08 11:30:03.177612
49	57	60000.00	credit_card	\N	AZP-57-1791624317756	pending	LKR	\N	\N	\N	\N	\N	\N	2026-10-10 09:25:09.15297	2026-10-10 09:25:09.15297
50	59	30000.00	credit_card	\N	AZP-59-1791650357119	pending	LKR	\N	\N	\N	\N	\N	\N	2026-10-10 16:39:08.596751	2026-10-10 16:39:08.596751
51	59	30000.00	credit_card	\N	AZP-59-1791650449944	pending	LKR	\N	\N	\N	\N	\N	\N	2026-10-10 16:40:40.611037	2026-10-10 16:40:40.611037
52	59	30000.00	credit_card	\N	AZP-59-1791650779373	pending	LKR	\N	\N	\N	\N	\N	\N	2026-10-10 16:46:10.005596	2026-10-10 16:46:10.005596
53	59	30000.00	credit_card	320032669789	AZP-59-1791650825098	completed	LKR	\N	INV-20261010-53	2026-10-10 16:47:09.273456	\N	\N	{"md5sig": "477C2DAB4E589E05C0016F1C11F92D58", "method": "VISA", "card_no": "************1292", "custom_1": "", "custom_2": "", "order_id": "AZP-59-1791650825098", "recurring": "0", "payment_id": "320032669789", "card_expiry": "11/26", "merchant_id": "1236612", "status_code": "2", "payhere_amount": "30000.00", "status_message": "Successfully received the VISA payment", "captured_amount": "30000.00", "card_holder_name": "test", "payhere_currency": "LKR"}	2026-10-10 16:46:55.728918	2026-10-10 16:47:11.601162
54	60	25000.00	credit_card	\N	AZP-60-1791928389083	pending	LKR	\N	\N	\N	\N	\N	\N	2026-10-13 21:53:09.255914	2026-10-13 21:53:09.255914
55	60	25000.00	credit_card	\N	AZP-60-1791928469966	pending	LKR	\N	\N	\N	\N	\N	\N	2026-10-13 21:54:30.114772	2026-10-13 21:54:30.114772
56	61	20000.00	credit_card	320032672030	AZP-61-1791988032823	completed	LKR	\N	INV-20261014-56	2026-10-14 14:28:23.821398	\N	\N	{"md5sig": "8601825781385ED12B19F71DCB7E818A", "method": "VISA", "card_no": "************1292", "custom_1": "", "custom_2": "", "order_id": "AZP-61-1791988032823", "recurring": "0", "payment_id": "320032672030", "card_expiry": "11/26", "merchant_id": "1236612", "status_code": "2", "payhere_amount": "20000.00", "status_message": "Successfully received the VISA payment", "captured_amount": "20000.00", "card_holder_name": "test", "payhere_currency": "LKR"}	2026-10-14 14:27:11.776643	2026-10-14 14:28:24.898471
57	63	20000.00	credit_card	\N	AZP-63-1792211163535	pending	LKR	\N	\N	\N	\N	\N	\N	2026-10-17 09:56:03.564384	2026-10-17 09:56:03.564384
58	63	20000.00	credit_card	320032673682	AZP-63-1792211922143	completed	LKR	\N	INV-20261017-58	2026-10-17 10:10:11.882911	\N	\N	{"md5sig": "0BF0881DAB18627F4D4526A085E8A99A", "method": "VISA", "card_no": "************1292", "custom_1": "", "custom_2": "", "order_id": "AZP-63-1792211922143", "recurring": "0", "payment_id": "320032673682", "card_expiry": "11/26", "merchant_id": "1236612", "status_code": "2", "payhere_amount": "20000.00", "status_message": "Successfully received the VISA payment", "captured_amount": "20000.00", "card_holder_name": "test", "payhere_currency": "LKR"}	2026-10-17 10:08:42.159301	2026-10-17 10:10:11.908412
59	64	20000.00	credit_card	\N	AZP-64-1792261264746	pending	LKR	\N	\N	\N	\N	\N	\N	2026-10-17 23:51:04.754936	2026-10-17 23:51:04.754936
60	66	50000.00	credit_card	\N	AZP-66-1792337805925	pending	LKR	\N	\N	\N	\N	\N	\N	2026-10-18 21:06:45.927932	2026-10-18 21:06:45.927932
61	67	65000.00	credit_card	\N	AZP-67-1792338039940	pending	LKR	\N	\N	\N	\N	\N	\N	2026-10-18 21:10:39.942133	2026-10-18 21:10:39.942133
62	68	30000.00	credit_card	320032674281	AZP-68-1792343410590	completed	LKR	\N	INV-20261018-62	2026-10-18 22:41:04.553045	\N	\N	{"md5sig": "3FBA2EA0EEA4D28476C9E5E79BF79B94", "method": "VISA", "card_no": "************1292", "custom_1": "", "custom_2": "", "order_id": "AZP-68-1792343410590", "recurring": "0", "payment_id": "320032674281", "card_expiry": "11/26", "merchant_id": "1236612", "status_code": "2", "payhere_amount": "30000.00", "status_message": "Successfully received the VISA payment", "captured_amount": "30000.00", "card_holder_name": "test", "payhere_currency": "LKR"}	2026-10-18 22:40:10.593556	2026-10-18 22:41:04.578324
63	69	30000.00	credit_card	320032674641	AZP-69-1792398487022	completed	LKR	\N	INV-20261019-63	2026-10-19 13:58:20.644317	\N	\N	{"md5sig": "969C7BB22D7CC70F5810E8BE181490EC", "method": "VISA", "card_no": "************1292", "custom_1": "", "custom_2": "", "order_id": "AZP-69-1792398487022", "recurring": "0", "payment_id": "320032674641", "card_expiry": "11/26", "merchant_id": "1236612", "status_code": "2", "payhere_amount": "30000.00", "status_message": "Successfully received the VISA payment", "captured_amount": "30000.00", "card_holder_name": "test", "payhere_currency": "LKR"}	2026-10-19 13:58:07.025356	2026-10-19 13:58:20.676539
64	70	75000.00	credit_card	\N	AZP-70-1792483560365	pending	LKR	\N	\N	\N	\N	\N	\N	2026-10-20 13:36:00.366746	2026-10-20 13:36:00.366746
46	52	20000.00	credit_card	320032668066	AZP-52-1791368426105	completed	LKR	\N	INV-20261007-46	2026-10-07 10:21:11.594784	\N	\N	{"md5sig": "34D4C8362A5563833851B805DA2C84CF", "method": "VISA", "card_no": "************1292", "custom_1": "", "custom_2": "", "order_id": "AZP-52-1791368426105", "recurring": "0", "payment_id": "320032668066", "card_expiry": "11/26", "merchant_id": "1236612", "status_code": "2", "payhere_amount": "20000.00", "status_message": "Successfully received the VISA payment", "captured_amount": "20000.00", "card_holder_name": "test", "payhere_currency": "LKR"}	2026-10-07 10:20:19.873176	2026-10-20 14:50:02.869087
\.


--
-- Data for Name: room_reservations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.room_reservations (reservation_id, reservation_ref, user_id, room_id, booking_id, check_in, check_out, guests, total_amount, status, payment_status, created_at, group_ref, transaction_id, payment_method, paid_at) FROM stdin;
1	RM-261018-BB8F0	17	1	\N	2026-12-10	2026-12-15	4	25000.00	cancelled	unpaid	2026-10-18 14:41:01.971015+05:30	RM-261018-BB8F0	\N	\N	\N
2	RM-261018-261C6	17	2	\N	2026-12-10	2026-12-15	4	25000.00	cancelled	unpaid	2026-10-18 14:41:01.971015+05:30	RM-261018-261C6	\N	\N	\N
3	RM-261018-FF9B5	17	5	\N	2026-10-19	2026-10-20	1	5000.00	cancelled	unpaid	2026-10-18 17:47:28.264819+05:30	RG-261018-CEE300	\N	\N	\N
4	RM-261018-3822A	17	3	\N	2026-10-20	2026-10-22	1	10000.00	cancelled	unpaid	2026-10-18 18:05:45.804027+05:30	RG-261018-170F60	\N	\N	\N
5	RM-261018-36B46	17	2	\N	2026-10-21	2026-10-22	1	5000.00	cancelled	unpaid	2026-10-18 18:23:58.136242+05:30	RG-261018-7EEA7B	\N	\N	\N
6	RM-261018-DC7FA	17	1	\N	2026-10-22	2026-10-24	1	10000.00	cancelled	unpaid	2026-10-18 20:08:53.48083+05:30	RG-261018-9CDEA5	\N	\N	\N
7	RM-261018-6BC3C	17	2	\N	2026-10-23	2026-10-24	1	5000.00	confirmed	paid	2026-10-18 20:27:04.36473+05:30	RG-261018-2C713F	320032674251	VISA	2026-10-18 20:27:19.402746+05:30
8	RM-261018-46DA2	6	3	\N	2026-10-22	2026-10-25	1	15000.00	confirmed	paid	2026-10-18 21:12:45.777971+05:30	RG-261018-21A2A6	320032674263	VISA	2026-10-18 21:13:01.682597+05:30
12	RM-261018-08E4F	6	2	\N	2026-11-15	2026-11-20	2	25000.00	confirmed	paid	2026-10-18 21:14:57.020714+05:30	RG-261018-5A431D	320032674264	VISA	2026-10-18 21:15:11.006424+05:30
9	RM-261018-2AD30	6	3	\N	2026-12-25	2026-12-30	5	25000.00	cancelled	unpaid	2026-10-18 21:14:04.790759+05:30	RG-261018-57F2EE	\N	\N	\N
10	RM-261018-20BD1	6	4	\N	2026-12-25	2026-12-30	5	25000.00	cancelled	unpaid	2026-10-18 21:14:04.790759+05:30	RG-261018-57F2EE	\N	\N	\N
11	RM-261018-C0E42	6	5	\N	2026-12-25	2026-12-30	5	25000.00	cancelled	unpaid	2026-10-18 21:14:04.790759+05:30	RG-261018-57F2EE	\N	\N	\N
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
3	22	Sponsor-test	\N	\N	\N	\N	\N	\N	active	2026-10-19 09:09:06.778632	2026-10-19 09:09:06.778632
4	23	sponsor-test2	\N	\N	\N	\N	\N	\N	active	2026-10-19 09:26:28.907381	2026-10-19 09:26:28.907381
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (user_id, full_name, email, password_hash, phone, role, profile_image, is_active, is_verified, login_attempts, locked_until, last_login, created_at, updated_at, refresh_token, google_id) FROM stdin;
16	Test User	test@gmail.com	$2b$10$YnF/YqllsQGi2vJJVPpqo.71iWijaah5PpjTacm/W42wn1P08HbEi	\N	customer	\N	t	f	0	\N	\N	2026-05-31 13:32:49.278038	2026-05-31 13:32:49.278038	\N	\N
18	Reg-Testing	testreg@gmail.com	$2b$12$ZnnpLGQ0KH8FKpp7li4LBux7z9uQFHUOMt/PKk.kWhn50Rve/6yNa	\N	customer	\N	t	f	0	\N	\N	2026-09-20 16:57:27.453297	2026-09-20 16:57:27.453297	\N	\N
5	Fathima Zahira	zahira@gmail.com	$2b$12$f2dz2n//8UahdWaUERAzOOj6Snt72qvDiS1erRJ/ycCKsO2EAjoG2	+94775678901	customer	\N	t	t	0	\N	\N	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	\N
7	Nusaibah Farhan	nusaibah@gmail.com	$2b$12$f2dz2n//8UahdWaUERAzOOj6Snt72qvDiS1erRJ/ycCKsO2EAjoG2	+94777890123	customer	\N	t	t	0	\N	\N	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	\N
8	Hassan Mueen	mueen@gmail.com	$2b$12$f2dz2n//8UahdWaUERAzOOj6Snt72qvDiS1erRJ/ycCKsO2EAjoG2	+94778901234	customer	\N	t	t	0	\N	\N	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	\N
20	fathima	fathima@gmail.com	$2b$12$8im29EEEYvHjg3MOCOpHg.BFKHRXbZEhNThog5sQXjk9Ky658EBoW	+94775031023	customer	\N	t	f	0	\N	\N	2026-10-16 08:47:12.920374	2026-10-16 08:47:12.920374	\N	\N
4	Mohamed Rifkan	rifkan@gmail.com	$2b$10$hkX8RXCux/qYsPyooMI5cu5j1k1sOKisFhzLDhNWjvYWdkXwF0gOW	+94774567890	customer	\N	t	t	0	\N	2026-09-08 08:30:33.91102	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJyaWZrYW5AZ21haWwuY29tIiwicm9sZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzg4ODU2MjYxLCJleHAiOjE3ODk0NjEwNjF9.0y8ux1yKgv7Bg0Iu-mRVZsSZUJ09afd4Z3iEtz7y690	\N
12	Zam Zam Jewellery	sponsor@zamzam.lk	$2b$12$f2dz2n//8UahdWaUERAzOOj6Snt72qvDiS1erRJ/ycCKsO2EAjoG2	+94772233445	sponsor	\N	t	t	0	\N	\N	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	\N
9	Riyaz Events	riyaz@events.lk	$2b$10$HCcCJ92/kc8vgN/oHiZF0.GB8YdLbXfmw9QuYlrScGmyeFntYAa.m	+94779012345	organizer	\N	t	t	0	\N	\N	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	\N
21	Sumaiya	sumi@gmail.com	$2b$12$J7lTbJUL7kqjyucCRvRTmuSbyzANt/j9wlQvHlE2Xh07sxLkzsv3u	0775021002	customer	\N	t	f	0	\N	\N	2026-10-16 08:54:16.77058	2026-10-16 08:54:16.77058	\N	\N
13	Althab Restaurant	althab@restaurant.lk	$2b$10$XgDWZqBupT36otT7lihy3ulPsR4w446k8PYz34vmJC40ga85AphRq	+94773344556	restaurant	\N	t	t	0	\N	2026-10-17 21:27:45.799104	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	\N
11	Akbar Traders	sponsor@akbartraders.lk	$2b$10$VcFaS4ntaiBC3mTTTkydd.eOKHHSl4qmJkqgOKUv7DHqVle4G.3D.	+94771122334	sponsor	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790246829/aazath-plaza/users/ymvji7m0cs3gkklvec1o.jpg	t	t	0	\N	2026-10-19 19:13:19.451435	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	\N
19	Test Staff	teststaff@aazathplaza.lk	$2b$12$3nbYD0/N0joQUWeZ18ELsucnwwU67PcHkQidj6J7xv3qoFWpLOg/e	+94771110548	front_desk	\N	t	t	0	\N	\N	2026-10-01 03:54:40.730822	2026-10-19 18:58:40.17755	\N	\N
1	Admin	admin@aazathplaza.lk	$2b$10$94tFbhA/jeRcYr7KYy4FnuqqxEoYKmNSOyYhO8Ec3O5D2hHHCIDHq	+94771234567	admin	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790196116/aazath-plaza/users/qunvcvxidbwo2bnxq6um.jpg	t	t	0	\N	2026-10-20 14:45:31.244087	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBhYXphdGhwbGF6YS5sayIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc5MjQ5MTY0NywiZXhwIjoxNzkzMDk2NDQ3fQ.P2l5LfyhkTzpoiNLiHBgtyzfeG_S593daimMKqwYGLc	\N
23	sponsor-test2	sponsor-test2@gmail.com	$2b$12$MWb/npDKePgRScxA0h/McukddqnZ8jQUZIvlATB0KCjV/27uY1Kdu	0758964236	sponsor	\N	t	f	0	\N	\N	2026-10-19 09:26:28.895208	2026-10-19 09:26:28.895208	\N	\N
3	Front Desk Staff	staff@aazathplaza.lk	$2b$10$8oX2gTYptOLytLU2qdJ1ZOBwzSalKFU3I56PEQZkRk/30ePjZXc0C	+94773456789	front_desk	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790230739/aazath-plaza/users/o7dzl90rmogagflkifuk.jpg	t	t	0	\N	2026-10-20 00:31:26.193636	2026-05-29 11:33:11.576052	2026-10-17 10:42:11.09157	\N	\N
25	organizer-test2	organizer-test2@gmail.com	$2b$12$ehTm3DUTjZw5405Xs3E//ujgkH1QLARziFv59PSr4hX2fR1p7bAXS	0778523694	organizer	\N	t	f	0	\N	\N	2026-10-19 09:44:54.280927	2026-10-19 09:44:54.280927	\N	\N
22	Sponsor-test	sponsor-test@gmail.com	$2b$12$vMw0kEvLzcYEC10UxEBKzO9gl0MMOk.D2J4PQ8sDimTGxbsBsu8EO	0774567891	sponsor	\N	t	f	0	\N	\N	2026-10-19 08:52:12.314343	2026-10-19 08:52:12.314343	\N	\N
6	Customer	thirayafathima@gmail.com	$2b$12$vRZ1VihjBdKmZzyx0wRG6.Y7hnPo80ko9qfgv8NZo/v3Il9TiErAi	+94779972423	customer	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790226950/aazath-plaza/users/ar2ivkqriftzlegeyui4.jpg	t	t	0	\N	2026-10-18 23:17:41.386872	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	103468752940350229146
26	restaurant-test	restaurant-test@gmail.com	$2b$12$o8foqbX/zLQq3OuPLMccjeSK.Dse1q.O2XiYzSlpO73DUL3xdGxT2	0774569812	restaurant	\N	t	f	0	\N	\N	2026-10-19 09:49:15.214089	2026-10-19 09:49:15.214089	\N	\N
24	organizer-test	organizer-test@gmail.com	$2b$12$/d9e0Eo3akuTMSUb20N97OUkicWHvx2P2lxAIuZfW4eWiHtRD/uri	0774569873	organizer	\N	t	f	2	\N	2026-10-19 10:00:46.290525	2026-10-19 09:30:53.88149	2026-10-19 09:30:53.88149	\N	\N
10	Fathima Decorations	fathima@decorations.lk	$2b$10$HCcCJ92/kc8vgN/oHiZF0.GB8YdLbXfmw9QuYlrScGmyeFntYAa.m	+94770123456	organizer	https://res.cloudinary.com/h0f2gpu1/image/upload/v1790244997/aazath-plaza/users/uvtrqqkfgttt05oo8d4w.jpg	t	t	1	\N	2026-10-14 21:07:30.019097	2026-05-29 11:33:11.576052	2026-05-29 11:33:11.576052	\N	\N
17	Test Customer	test@example.com	$2b$12$VizevEqJu/5rBaPKh3p6l.urgJR7nMDhdvdteNMl2/BOQ.mrhKXKG	0771234567	customer	\N	t	f	0	\N	2026-10-20 13:34:10.30053	2026-06-21 16:38:06.436496	2026-06-21 16:38:06.436496	\N	\N
\.


--
-- Name: audit_log_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_log_log_id_seq', 741, true);


--
-- Name: booking_organizers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.booking_organizers_id_seq', 18, true);


--
-- Name: booking_sponsors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.booking_sponsors_id_seq', 6, true);


--
-- Name: bookings_booking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bookings_booking_id_seq', 70, true);


--
-- Name: catering_orders_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.catering_orders_order_id_seq', 31, true);


--
-- Name: event_timelines_timeline_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.event_timelines_timeline_id_seq', 23, true);


--
-- Name: feedback_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.feedback_feedback_id_seq', 14, true);


--
-- Name: hall_bookings_hall_booking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hall_bookings_hall_booking_id_seq', 73, true);


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

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 273, true);


--
-- Name: organizers_organizer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.organizers_organizer_id_seq', 4, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 10, true);


--
-- Name: payments_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payments_payment_id_seq', 64, true);


--
-- Name: room_reservations_reservation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.room_reservations_reservation_id_seq', 12, true);


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
    ADD CONSTRAINT no_room_overlap EXCLUDE USING gist (room_id WITH =, daterange(check_in, check_out) WITH &&) WHERE (((status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying])::text[])));


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
-- Name: idx_notif_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notif_user ON public.notifications USING btree (user_id);


--
-- Name: idx_notifications_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_created ON public.notifications USING btree (user_id, created_at DESC);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


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
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


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

\unrestrict e0IQh0fCgPz91EPzm4mBu2d4qWKNUfa1Us0fMACE9Up5vFzsJOuZz1TQFnIiuyX

