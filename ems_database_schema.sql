-- ============================================================
-- EVENTS MANAGEMENT SYSTEM - AAZATH PLAZA RECEPTION HALL
-- PostgreSQL Database Schema (v1.0)
-- Author  : R. Fathima Thiraya | SEU/IS/21/MIT/066
-- Dept    : Management & Information Technology, SEUSL
-- Project : MIT 32046 – Software Development Project
-- Date    : June 2026
-- ============================================================

-- ── EXTENSIONS ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- for gen_random_uuid()

-- ── ENUM TYPES ──────────────────────────────────────────────
CREATE TYPE user_role AS ENUM (
    'customer',
    'front_desk',
    'manager',
    'admin',
    'organizer',
    'sponsor',
    'restaurant'
);

CREATE TYPE booking_status AS ENUM (
    'pending',
    'confirmed',
    'cancelled',
    'completed'
);

CREATE TYPE payment_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded'
);

CREATE TYPE payment_method AS ENUM (
    'credit_card',
    'debit_card',
    'mobile_wallet',
    'bank_transfer'
);

CREATE TYPE notification_type AS ENUM (
    'booking_confirmation',
    'payment_receipt',
    'event_reminder',
    'catering_update',
    'cancellation',
    'general'
);

CREATE TYPE notification_channel AS ENUM (
    'email',
    'sms',
    'both'
);

CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed',
    'preparing',
    'delivered',
    'cancelled'
);

CREATE TYPE sponsor_status AS ENUM (
    'pending',
    'active',
    'inactive'
);

-- ============================================================
-- TABLE 1: USERS
-- Stores all system users across all 7 roles
-- ============================================================
CREATE TABLE users (
    user_id         SERIAL          PRIMARY KEY,
    full_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    password_hash   TEXT            NOT NULL,
    phone           VARCHAR(20),
    role            user_role       NOT NULL DEFAULT 'customer',
    profile_image   TEXT,                        -- Cloudinary URL
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    is_verified     BOOLEAN         NOT NULL DEFAULT FALSE,
    login_attempts  INT             NOT NULL DEFAULT 0,
    locked_until    TIMESTAMP,                   -- account lockout
    last_login      TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_role     ON users(role);
CREATE INDEX idx_users_active   ON users(is_active);

-- ============================================================
-- TABLE 2: PACKAGES
-- Hall booking packages with pricing
-- ============================================================
CREATE TABLE packages (
    package_id      SERIAL          PRIMARY KEY,
    package_name    VARCHAR(100)    NOT NULL,
    description     TEXT,
    base_price      DECIMAL(10,2)   NOT NULL CHECK (base_price >= 0),
    max_guests      INT             NOT NULL CHECK (max_guests > 0),
    duration_hours  INT             NOT NULL CHECK (duration_hours > 0),
    includes        TEXT,                        -- JSON string of included items
    image_url       TEXT,                        -- Cloudinary URL
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 3: BOOKINGS
-- Core booking records — central table of the system
-- ============================================================
CREATE TABLE bookings (
    booking_id          SERIAL          PRIMARY KEY,
    user_id             INT             NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    package_id          INT             REFERENCES packages(package_id) ON DELETE SET NULL,
    booking_ref         VARCHAR(20)     NOT NULL UNIQUE DEFAULT CONCAT('AP-', TO_CHAR(NOW(), 'YYYYMMDD'), '-', LPAD(CAST(nextval('bookings_booking_id_seq') AS TEXT), 4, '0')),
    event_date          DATE            NOT NULL,
    event_start_time    TIME            NOT NULL DEFAULT '08:00:00',
    event_end_time      TIME            NOT NULL DEFAULT '22:00:00',
    event_type          VARCHAR(80)     NOT NULL,
    guest_count         INT             NOT NULL CHECK (guest_count > 0),
    status              booking_status  NOT NULL DEFAULT 'pending',
    base_amount         DECIMAL(10,2)   NOT NULL DEFAULT 0,
    addon_amount        DECIMAL(10,2)   NOT NULL DEFAULT 0,
    discount_amount     DECIMAL(10,2)   NOT NULL DEFAULT 0,
    tax_amount          DECIMAL(10,2)   NOT NULL DEFAULT 0,
    total_amount        DECIMAL(10,2)   NOT NULL DEFAULT 0,
    special_requests    TEXT,
    internal_notes      TEXT,                    -- staff-only notes
    confirmed_by        INT             REFERENCES users(user_id),
    confirmed_at        TIMESTAMP,
    cancelled_at        TIMESTAMP,
    cancel_reason       TEXT,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),

    -- Prevent double-booking: no two confirmed bookings on same date
    CONSTRAINT no_double_booking EXCLUDE USING gist (
        event_date WITH =
    ) WHERE (status = 'confirmed')
);

-- Indexes
CREATE INDEX idx_bookings_user_id    ON bookings(user_id);
CREATE INDEX idx_bookings_event_date ON bookings(event_date);
CREATE INDEX idx_bookings_status     ON bookings(status);
CREATE INDEX idx_bookings_ref        ON bookings(booking_ref);

-- ============================================================
-- TABLE 4: PAYMENTS
-- Payment records linked to bookings
-- ============================================================
CREATE TABLE payments (
    payment_id          SERIAL              PRIMARY KEY,
    booking_id          INT                 NOT NULL REFERENCES bookings(booking_id) ON DELETE RESTRICT,
    amount              DECIMAL(10,2)       NOT NULL CHECK (amount > 0),
    payment_method      payment_method      NOT NULL,
    transaction_id      VARCHAR(100)        UNIQUE,   -- PayHere transaction ID
    payhere_order_id    VARCHAR(100),
    status              payment_status      NOT NULL DEFAULT 'pending',
    currency            VARCHAR(3)          NOT NULL DEFAULT 'LKR',
    invoice_url         TEXT,                         -- Cloudinary PDF URL
    invoice_number      VARCHAR(30)         UNIQUE,
    paid_at             TIMESTAMP,
    refunded_at         TIMESTAMP,
    refund_reason       TEXT,
    gateway_response    JSONB,                        -- raw PayHere response
    created_at          TIMESTAMP           NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP           NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_booking_id    ON payments(booking_id);
CREATE INDEX idx_payments_status        ON payments(status);
CREATE INDEX idx_payments_transaction   ON payments(transaction_id);

-- ============================================================
-- TABLE 5: EVENT_TIMELINES
-- Detailed event schedule for each booking
-- ============================================================
CREATE TABLE event_timelines (
    timeline_id     SERIAL      PRIMARY KEY,
    booking_id      INT         NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    activity_name   VARCHAR(100) NOT NULL,
    start_time      TIME        NOT NULL,
    end_time        TIME        NOT NULL,
    assigned_to     VARCHAR(100),
    notes           TEXT,
    sequence_order  INT         NOT NULL DEFAULT 1,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timeline_booking ON event_timelines(booking_id);

-- ============================================================
-- TABLE 6: ORGANIZERS
-- Event organizer profiles (extended from users)
-- ============================================================
CREATE TABLE organizers (
    organizer_id        SERIAL          PRIMARY KEY,
    user_id             INT             NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    business_name       VARCHAR(150),
    specialty           VARCHAR(100)    NOT NULL,
    experience_years    INT             NOT NULL DEFAULT 0,
    portfolio_url       TEXT,
    bio                 TEXT,
    service_areas       TEXT,
    price_range         VARCHAR(50),
    avg_rating          DECIMAL(3,2)    DEFAULT 0.00 CHECK (avg_rating BETWEEN 0 AND 5),
    total_reviews       INT             NOT NULL DEFAULT 0,
    is_verified         BOOLEAN         NOT NULL DEFAULT FALSE,
    is_available        BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizers_user    ON organizers(user_id);
CREATE INDEX idx_organizers_spec    ON organizers(specialty);

-- ============================================================
-- TABLE 7: SPONSORS
-- Sponsor profiles (extended from users)
-- ============================================================
CREATE TABLE sponsors (
    sponsor_id      SERIAL          PRIMARY KEY,
    user_id         INT             NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    company_name    VARCHAR(150)    NOT NULL,
    industry        VARCHAR(100),
    website_url     TEXT,
    logo_url        TEXT,           -- Cloudinary URL
    budget_range    VARCHAR(50),
    preferred_events TEXT,          -- comma-separated event types
    description     TEXT,
    status          sponsor_status  NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sponsors_user      ON sponsors(user_id);
CREATE INDEX idx_sponsors_status    ON sponsors(status);

-- ============================================================
-- TABLE 8: BOOKING_ORGANIZERS (Junction)
-- Links bookings with organizers (M:M)
-- ============================================================
CREATE TABLE booking_organizers (
    id              SERIAL      PRIMARY KEY,
    booking_id      INT         NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    organizer_id    INT         NOT NULL REFERENCES organizers(organizer_id) ON DELETE CASCADE,
    role_in_event   VARCHAR(100),
    agreed_fee      DECIMAL(10,2) DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    notes           TEXT,
    assigned_at     TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE(booking_id, organizer_id)
);

-- ============================================================
-- TABLE 9: MENU_ITEMS
-- Restaurant menu managed by Althab Restaurant
-- ============================================================
CREATE TABLE menu_items (
    item_id         SERIAL          PRIMARY KEY,
    item_name       VARCHAR(100)    NOT NULL,
    category        VARCHAR(50)     NOT NULL,
    description     TEXT,
    price           DECIMAL(10,2)   NOT NULL CHECK (price >= 0),
    unit            VARCHAR(20)     NOT NULL DEFAULT 'per person',
    image_url       TEXT,
    is_vegetarian   BOOLEAN         NOT NULL DEFAULT FALSE,
    is_available    BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_menu_category ON menu_items(category);

-- ============================================================
-- TABLE 10: CATERING_ORDERS
-- Catering orders linked to bookings (Althab Restaurant)
-- ============================================================
CREATE TABLE catering_orders (
    order_id        SERIAL          PRIMARY KEY,
    booking_id      INT             NOT NULL REFERENCES bookings(booking_id) ON DELETE RESTRICT,
    menu_items      JSONB           NOT NULL DEFAULT '[]',  -- [{item_id, qty, price}]
    total_cost      DECIMAL(10,2)   NOT NULL DEFAULT 0,
    guest_count     INT             NOT NULL DEFAULT 0,
    status          order_status    NOT NULL DEFAULT 'pending',
    special_notes   TEXT,
    delivery_time   TIME,
    confirmed_at    TIMESTAMP,
    delivered_at    TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_catering_booking ON catering_orders(booking_id);
CREATE INDEX idx_catering_status  ON catering_orders(status);

-- ============================================================
-- TABLE 11: FEEDBACK
-- Post-event customer feedback and ratings
-- ============================================================
CREATE TABLE feedback (
    feedback_id     SERIAL      PRIMARY KEY,
    booking_id      INT         NOT NULL UNIQUE REFERENCES bookings(booking_id) ON DELETE CASCADE,
    user_id         INT         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    rating          INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title           VARCHAR(100),
    comment         TEXT,
    is_public       BOOLEAN     NOT NULL DEFAULT TRUE,
    admin_reply     TEXT,
    replied_at      TIMESTAMP,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_booking ON feedback(booking_id);
CREATE INDEX idx_feedback_rating  ON feedback(rating);

-- ============================================================
-- TABLE 12: NOTIFICATIONS
-- All email/SMS notifications sent by the system
-- ============================================================
CREATE TABLE notifications (
    notification_id SERIAL                  PRIMARY KEY,
    user_id         INT                     NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    booking_id      INT                     REFERENCES bookings(booking_id) ON DELETE SET NULL,
    type            notification_type       NOT NULL,
    channel         notification_channel    NOT NULL,
    subject         VARCHAR(200),
    message         TEXT                    NOT NULL,
    recipient_email VARCHAR(150),
    recipient_phone VARCHAR(20),
    is_sent         BOOLEAN                 NOT NULL DEFAULT FALSE,
    sent_at         TIMESTAMP,
    error_message   TEXT,
    created_at      TIMESTAMP               NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user     ON notifications(user_id);
CREATE INDEX idx_notif_booking  ON notifications(booking_id);
CREATE INDEX idx_notif_sent     ON notifications(is_sent);

-- ============================================================
-- TABLE 13: PASSWORD_RESET_TOKENS
-- Secure password reset via email
-- ============================================================
CREATE TABLE password_reset_tokens (
    id          SERIAL      PRIMARY KEY,
    user_id     INT         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token       TEXT        NOT NULL UNIQUE,
    expires_at  TIMESTAMP   NOT NULL,
    used_at     TIMESTAMP,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 14: AUDIT_LOG
-- System-wide audit trail for all critical actions
-- ============================================================
CREATE TABLE audit_log (
    log_id      SERIAL      PRIMARY KEY,
    user_id     INT         REFERENCES users(user_id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,
    table_name  VARCHAR(50),
    record_id   INT,
    old_values  JSONB,
    new_values  JSONB,
    ip_address  VARCHAR(45),
    user_agent  TEXT,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user     ON audit_log(user_id);
CREATE INDEX idx_audit_action   ON audit_log(action);
CREATE INDEX idx_audit_table    ON audit_log(table_name);

-- ============================================================
-- TRIGGER: auto-update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated         BEFORE UPDATE ON users          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bookings_updated      BEFORE UPDATE ON bookings        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_payments_updated      BEFORE UPDATE ON payments        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_organizers_updated    BEFORE UPDATE ON organizers      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sponsors_updated      BEFORE UPDATE ON sponsors        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_catering_updated      BEFORE UPDATE ON catering_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_packages_updated      BEFORE UPDATE ON packages        FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED DATA: Default admin user
-- Password: Admin@2026 (bcrypt hashed)
-- ============================================================
INSERT INTO users (full_name, email, password_hash, phone, role, is_active, is_verified)
VALUES (
    'System Administrator',
    'admin@aazathplaza.lk',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TugH7yGRVpJWGHp5fUoQxH6VHQIC',
    '+94771234567',
    'admin',
    TRUE,
    TRUE
);

-- ============================================================
-- SEED DATA: Sample packages
-- ============================================================
INSERT INTO packages (package_name, description, base_price, max_guests, duration_hours, includes) VALUES
('Basic Hall Package',    'Standard hall rental with basic setup',           50000.00,  150, 8,  'Hall, Basic lighting, 150 chairs, 15 tables'),
('Silver Package',        'Enhanced package with decoration',                85000.00,  250, 10, 'Hall, Decoration, 250 chairs, 25 tables, Sound system'),
('Gold Package',          'Premium package with full services',              130000.00, 350, 12, 'Hall, Premium decoration, Sound, Lighting, Stage setup'),
('Platinum Package',      'All-inclusive luxury event package',              200000.00, 500, 14, 'Hall, Luxury decoration, Sound, Lighting, Stage, Coordinator'),
('Corporate Package',     'Professional setup for corporate events',         95000.00,  200, 8,  'Hall, Projector, Sound, Corporate decoration, Wi-Fi'),
('Birthday Package',      'Fun birthday celebration setup',                  45000.00,  100, 6,  'Hall, Birthday decoration, Sound system, Photo booth');

-- ============================================================
-- SEED DATA: Sample menu items
-- ============================================================
INSERT INTO menu_items (item_name, category, description, price, unit, is_vegetarian) VALUES
('Rice and Curry (Full)',    'Main Course',  'Traditional Sri Lankan rice and curry with 5 curries',    350.00, 'per person', FALSE),
('Biriyani (Chicken)',       'Main Course',  'Fragrant chicken biriyani with raita',                    450.00, 'per person', FALSE),
('Biriyani (Mutton)',        'Main Course',  'Slow-cooked mutton biriyani with salad',                  550.00, 'per person', FALSE),
('Vegetable Biriyani',      'Main Course',  'Mixed vegetable biriyani with chutney',                   350.00, 'per person', TRUE),
('Short Eats Platter',      'Starters',     'Assorted short eats (10 pieces)',                         250.00, 'per person', FALSE),
('Fruit Salad',             'Desserts',     'Fresh seasonal fruit salad',                              150.00, 'per person', TRUE),
('Watalappan',              'Desserts',     'Traditional Sri Lankan coconut custard pudding',          120.00, 'per person', TRUE),
('Soft Drinks Pack',        'Beverages',    'Assorted soft drinks',                                    80.00,  'per person', TRUE),
('Juice Bar',               'Beverages',    'Fresh fruit juice counter service',                       150.00, 'per person', TRUE),
('Wedding Cake (3-tier)',   'Cakes',        'Custom 3-tier wedding cake',                              15000.00, 'per cake', TRUE);

-- ============================================================
-- USEFUL VIEWS FOR REPORTING
-- ============================================================

-- View: Booking summary with user and package details
CREATE OR REPLACE VIEW v_booking_summary AS
SELECT
    b.booking_id,
    b.booking_ref,
    u.full_name      AS customer_name,
    u.email          AS customer_email,
    u.phone          AS customer_phone,
    b.event_date,
    b.event_type,
    b.guest_count,
    p.package_name,
    b.total_amount,
    b.status,
    py.status        AS payment_status,
    b.created_at
FROM bookings b
JOIN users    u  ON b.user_id    = u.user_id
LEFT JOIN packages p  ON b.package_id  = p.package_id
LEFT JOIN payments py ON py.booking_id = b.booking_id;

-- View: Monthly revenue report
CREATE OR REPLACE VIEW v_monthly_revenue AS
SELECT
    DATE_TRUNC('month', b.event_date) AS month,
    COUNT(b.booking_id)               AS total_bookings,
    SUM(b.total_amount)               AS gross_revenue,
    SUM(b.discount_amount)            AS total_discounts,
    SUM(b.total_amount - b.discount_amount) AS net_revenue,
    AVG(b.total_amount)               AS avg_booking_value
FROM bookings b
WHERE b.status IN ('confirmed', 'completed')
GROUP BY DATE_TRUNC('month', b.event_date)
ORDER BY month DESC;

-- View: Hall availability (booked dates)
CREATE OR REPLACE VIEW v_booked_dates AS
SELECT
    event_date,
    booking_ref,
    event_type,
    guest_count,
    status
FROM bookings
WHERE status IN ('pending', 'confirmed')
ORDER BY event_date;

-- View: Average ratings by event type
CREATE OR REPLACE VIEW v_ratings_summary AS
SELECT
    b.event_type,
    COUNT(f.feedback_id)  AS total_reviews,
    AVG(f.rating)         AS avg_rating,
    MIN(f.rating)         AS min_rating,
    MAX(f.rating)         AS max_rating
FROM feedback f
JOIN bookings b ON f.booking_id = b.booking_id
GROUP BY b.event_type
ORDER BY avg_rating DESC;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
COMMENT ON DATABASE postgres IS 'Events Management System – Aazath Plaza Reception Hall | SEUSL MIT Final Year Project';
