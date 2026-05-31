-- ============================================================
-- EVENTS MANAGEMENT SYSTEM - SEED DATA
-- Aazath Plaza Reception Hall
-- Author: R. Fathima Thiraya | SEU/IS/21/MIT/066
-- ============================================================

-- ── CLEAR EXISTING DATA (safe order) ────────────────────────
TRUNCATE TABLE audit_log, notifications, password_reset_tokens,
  feedback, catering_orders, booking_organizers, event_timelines,
  payments, bookings, organizers, sponsors, menu_items,
  packages, users
RESTART IDENTITY CASCADE;

-- ============================================================
-- 1. USERS (7 roles)
-- Password for all test users: Test@2026
-- bcrypt hash of 'Test@2026'
-- ============================================================
INSERT INTO users (full_name, email, password_hash, phone, role, is_active, is_verified) VALUES
-- Admin
('Fathima Thiraya',        'admin@aazathplaza.lk',      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TugH7yGRVpJWGHp5fUoQxH6VHQIC', '+94771234567', 'admin',       TRUE, TRUE),
-- Manager
('Mohamed Zahin',         'manager@aazathplaza.lk',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TugH7yGRVpJWGHp5fUoQxH6VHQIC', '+94772345678', 'manager',     TRUE, TRUE),
-- Front Desk Staff
('Aisha Nusrath',          'staff@aazathplaza.lk',      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TugH7yGRVpJWGHp5fUoQxH6VHQIC', '+94773456789', 'front_desk',  TRUE, TRUE),
-- Customers
('Mohamed Rifkan',         'rifkan@gmail.com',           '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TugH7yGRVpJWGHp5fUoQxH6VHQIC', '+94774567890', 'customer',    TRUE, TRUE),
('Fathima Zahira',         'zahira@gmail.com',           '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TugH7yGRVpJWGHp5fUoQxH6VHQIC', '+94775678901', 'customer',    TRUE, TRUE),
('Abdul Basith',           'basith@gmail.com',           '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TugH7yGRVpJWGHp5fUoQxH6VHQIC', '+94776789012', 'customer',    TRUE, TRUE),
('Nusaibah Farhan',        'nusaibah@gmail.com',         '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TugH7yGRVpJWGHp5fUoQxH6VHQIC', '+94777890123', 'customer',    TRUE, TRUE),
('Hassan Mueen',           'mueen@gmail.com',            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TugH7yGRVpJWGHp5fUoQxH6VHQIC', '+94778901234', 'customer',    TRUE, TRUE),
-- Event Organizers
('Riyaz Events',           'riyaz@events.lk',            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TugH7yGRVpJWGHp5fUoQxH6VHQIC', '+94779012345', 'organizer',   TRUE, TRUE),
('Fathima Decorations',    'fathima@decorations.lk',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TugH7yGRVpJWGHp5fUoQxH6VHQIC', '+94770123456', 'organizer',   TRUE, TRUE),
-- Sponsors
('Akbar Traders',          'sponsor@akbartraders.lk',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TugH7yGRVpJWGHp5fUoQxH6VHQIC', '+94771122334', 'sponsor',     TRUE, TRUE),
('Zam Zam Jewellery',      'sponsor@zamzam.lk',          '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TugH7yGRVpJWGHp5fUoQxH6VHQIC', '+94772233445', 'sponsor',     TRUE, TRUE),
-- Restaurant Partner
('Althab Restaurant',      'althab@restaurant.lk',       '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TugH7yGRVpJWGHp5fUoQxH6VHQIC', '+94773344556', 'restaurant',  TRUE, TRUE);

-- ============================================================
-- 2. PACKAGES
-- ============================================================
INSERT INTO packages (package_name, description, base_price, max_guests, duration_hours, includes, is_active) VALUES
('Basic Hall Package',
 'Standard hall rental with essential setup for small gatherings',
 50000.00, 150, 8,
 'Hall rental, Basic lighting, 150 chairs, 15 tables, Parking, Basic sound system',
 TRUE),

('Silver Package',
 'Enhanced package with elegant decoration for medium events',
 85000.00, 250, 10,
 'Hall rental, Silver decoration, 250 chairs, 25 tables, Sound system, Welcome arch, Stage setup',
 TRUE),

('Gold Package',
 'Premium full-service package for large celebrations',
 130000.00, 350, 12,
 'Hall rental, Premium decoration, 350 chairs, 35 tables, Sound system, Lighting effects, Stage, Photo backdrop, Coordinator',
 TRUE),

('Platinum Package',
 'Luxury all-inclusive package — the ultimate event experience',
 200000.00, 500, 14,
 'Hall rental, Luxury decoration, 500 chairs, 50 tables, Premium sound, LED lighting, Stage, Floral arrangements, Coordinator, Valet parking',
 TRUE),

('Corporate Package',
 'Professional setup for corporate meetings, seminars and conferences',
 95000.00, 200, 8,
 'Hall rental, Corporate decoration, Projector & screen, Sound, Wi-Fi, 200 chairs, Conference tables, Refreshment setup',
 TRUE),

('Birthday Package',
 'Colourful and fun birthday celebration setup',
 45000.00, 100, 6,
 'Hall rental, Birthday decoration, Balloon arch, Sound system, 100 chairs, 10 tables, Photo booth',
 TRUE),

('Engagement Package',
 'Romantic setup for engagement ceremonies',
 75000.00, 200, 8,
 'Hall rental, Floral decoration, Stage with backdrop, Sound, 200 chairs, 20 tables, Welcome board, Ring ceremony setup',
 TRUE);

-- ============================================================
-- 3. MENU ITEMS (Althab Restaurant)
-- ============================================================
INSERT INTO menu_items (item_name, category, description, price, unit, is_vegetarian, is_available) VALUES
-- Main Course
('Rice and Curry (Full Meal)',    'Main Course', 'Traditional Sri Lankan rice and curry with 5 curries, papadum and pickle',          350.00, 'per person', FALSE, TRUE),
('Chicken Biriyani',              'Main Course', 'Fragrant basmati rice with spiced chicken, raita and salad',                        450.00, 'per person', FALSE, TRUE),
('Mutton Biriyani',               'Main Course', 'Slow-cooked mutton biriyani with saffron rice and mint raita',                      550.00, 'per person', FALSE, TRUE),
('Vegetable Biriyani',            'Main Course', 'Mixed vegetable biriyani with coconut chutney',                                     350.00, 'per person', TRUE,  TRUE),
('Kottu Roti (Chicken)',          'Main Course', 'Sri Lankan street-style chicken kottu with egg',                                    400.00, 'per person', FALSE, TRUE),
('Fried Rice with Chicken',       'Main Course', 'Chinese-style fried rice with chicken and vegetables',                              380.00, 'per person', FALSE, TRUE),

-- Starters
('Short Eats Platter',            'Starters',   'Assorted short eats - rolls, puffs, cutlets (10 pieces)',                           250.00, 'per person', FALSE, TRUE),
('Samosa Platter',                'Starters',   'Crispy vegetable and chicken samosas (8 pieces)',                                    200.00, 'per person', FALSE, TRUE),
('Bruschetta',                    'Starters',   'Toasted bread with tomato, garlic and basil topping',                               180.00, 'per person', TRUE,  TRUE),

-- Desserts
('Watalappan',                    'Desserts',   'Traditional Sri Lankan coconut custard pudding with jaggery',                        120.00, 'per person', TRUE,  TRUE),
('Fruit Salad',                   'Desserts',   'Fresh seasonal tropical fruit salad',                                               150.00, 'per person', TRUE,  TRUE),
('Ice Cream (3 scoops)',          'Desserts',   'Assorted flavours - vanilla, chocolate, strawberry',                                 180.00, 'per person', TRUE,  TRUE),
('Chocolate Fountain',            'Desserts',   'Chocolate fountain with fresh fruits and marshmallows',                             350.00, 'per person', TRUE,  TRUE),

-- Beverages
('Soft Drinks Pack',              'Beverages',  'Assorted carbonated soft drinks',                                                     80.00, 'per person', TRUE,  TRUE),
('Fresh Juice Bar',               'Beverages',  'Fresh fruit juice counter - mango, orange, watermelon, wood apple',                  150.00, 'per person', TRUE,  TRUE),
('Faluda',                        'Beverages',  'Traditional Sri Lankan rose milk faluda',                                            120.00, 'per person', TRUE,  TRUE),

-- Cakes
('Wedding Cake (3-tier)',         'Cakes',      'Custom 3-tier fondant wedding cake with floral design',                            15000.00, 'per cake',   TRUE,  TRUE),
('Birthday Cake (2kg)',           'Cakes',      'Custom 2kg photo/theme birthday cake',                                              6500.00, 'per cake',   TRUE,  TRUE),
('Engagement Cake (1.5kg)',       'Cakes',      'Elegant 1.5kg engagement cake with ring design',                                    5500.00, 'per cake',   TRUE,  TRUE);

-- ============================================================
-- 4. ORGANIZERS
-- ============================================================
INSERT INTO organizers (user_id, business_name, specialty, experience_years, portfolio_url, bio, price_range, avg_rating, total_reviews, is_verified, is_available) VALUES
(9,  'Riyaz Events & Decorations',  'Wedding & Reception Decoration',  8,  'https://riyazevents.lk',      'Specialising in traditional Sri Lankan and modern wedding decorations. Over 500 successful events.', 'LKR 25,000 - 80,000', 4.8, 45, TRUE, TRUE),
(10, 'Fathima Floral Designs',      'Floral Arrangements & Stage Setup', 5, 'https://fathimaflorals.lk', 'Expert in fresh floral arrangements, stage backdrops and table centrepieces for all occasions.',     'LKR 15,000 - 50,000', 4.6, 28, TRUE, TRUE);

-- ============================================================
-- 5. SPONSORS
-- ============================================================
INSERT INTO sponsors (user_id, company_name, industry, website_url, budget_range, preferred_events, description, status) VALUES
(11, 'Akbar Traders',    'Retail & Trading',  'https://akbartraders.lk',  'LKR 50,000 - 200,000',  'weddings, corporate events, cultural events', 'Leading retail and trading company in the Eastern Province. Proud to sponsor community events.', 'active'),
(12, 'Zam Zam Jewellery', 'Jewellery & Gold',  'https://zamzamjewel.lk',  'LKR 30,000 - 150,000',  'weddings, engagements, valima',               'Premium gold and diamond jewellery. Official sponsor for wedding and engagement events.',         'active');

-- ============================================================
-- 6. BOOKINGS (10 sample bookings)
-- ============================================================
INSERT INTO bookings (user_id, package_id, booking_ref, event_date, event_start_time, event_end_time, event_type, guest_count, status, base_amount, addon_amount, discount_amount, tax_amount, total_amount, special_requests, confirmed_by, confirmed_at) VALUES

-- Completed bookings (past)
(4, 3, 'AP-20260101-0001', '2026-01-15', '14:00', '22:00', 'Wedding Reception',    350, 'completed', 130000, 25000, 5000,  15000, 165000, 'Vegetarian menu preferred. Flower arch at entrance.',         2, '2025-12-20 10:00:00'),
(5, 2, 'AP-20260102-0002', '2026-02-10', '16:00', '22:00', 'Engagement Ceremony',  200, 'completed',  85000, 15000, 0,     10000, 110000, 'Pink and gold colour theme.',                                 2, '2026-01-05 11:00:00'),
(6, 4, 'AP-20260103-0003', '2026-03-05', '12:00', '22:00', 'Wedding Reception',    450, 'completed', 200000, 30000, 10000, 22000, 242000, 'Live nasheeds performance. No music.',                        2, '2026-01-15 09:00:00'),
(7, 5, 'AP-20260104-0004', '2026-03-22', '08:00', '16:00', 'Corporate Seminar',    180, 'completed',  95000, 10000, 5000,  10000, 110000, 'Projector needed. Tea break at 10:30 AM and 3:00 PM.',        2, '2026-02-01 14:00:00'),

-- Confirmed bookings (upcoming)
(8, 3, 'AP-20260601-0005', '2026-06-14', '15:00', '22:00', 'Wedding Reception',    300, 'confirmed', 130000, 20000, 0,     15000, 165000, 'Indoor garden theme. Fountain setup requested.',              2, '2026-04-10 10:00:00'),
(4, 7, 'AP-20260602-0006', '2026-06-28', '17:00', '22:00', 'Engagement Ceremony',  150, 'confirmed',  75000, 10000, 0,      8500,  93500, 'Surprise engagement. Keep venue decoration secret.',          2, '2026-04-15 11:00:00'),
(5, 6, 'AP-20260703-0007', '2026-07-12', '15:00', '21:00', 'Birthday Party',        80, 'confirmed',  45000,  8000, 2000,   5100,  56100, 'Unicorn theme. 5-year-old birthday. No spicy food.',          3, '2026-05-01 09:00:00'),

-- Pending bookings
(6, 2, 'AP-20260704-0008', '2026-07-25', '16:00', '22:00', 'Valima Ceremony',      220, 'pending',   85000,     0,    0,      0,  85000, 'Traditional setup. Separate seating for males and females.', NULL, NULL),
(7, 1, 'AP-20260805-0009', '2026-08-08', '18:00', '22:00', 'Farewell Party',        120, 'pending',  50000,     0,    0,      0,  50000, 'Buffet style. Backdrop with photos.',                        NULL, NULL),

-- Cancelled booking
(8, 3, 'AP-20260106-0010', '2026-04-20', '14:00', '22:00', 'Wedding Reception',    300, 'cancelled', 130000,    0,    0,      0, 130000, 'Cancelled due to change of venue.',                           NULL, NULL);

-- ============================================================
-- 7. PAYMENTS
-- ============================================================
INSERT INTO payments (booking_id, amount, payment_method, transaction_id, status, currency, invoice_number, paid_at) VALUES
(1, 165000.00, 'bank_transfer',  'TXN-2026-001-BT', 'completed', 'LKR', 'INV-2026-0001', '2026-01-15 13:00:00'),
(2, 110000.00, 'credit_card',    'TXN-2026-002-CC', 'completed', 'LKR', 'INV-2026-0002', '2026-02-10 15:30:00'),
(3, 242000.00, 'bank_transfer',  'TXN-2026-003-BT', 'completed', 'LKR', 'INV-2026-0003', '2026-03-05 11:00:00'),
(4, 110000.00, 'credit_card',    'TXN-2026-004-CC', 'completed', 'LKR', 'INV-2026-0004', '2026-03-22 08:00:00'),
(5, 165000.00, 'bank_transfer',  'TXN-2026-005-BT', 'completed', 'LKR', 'INV-2026-0005', '2026-04-10 12:00:00'),
(6,  93500.00, 'mobile_wallet',  'TXN-2026-006-MW', 'completed', 'LKR', 'INV-2026-0006', '2026-04-15 16:00:00'),
(7,  56100.00, 'credit_card',    'TXN-2026-007-CC', 'completed', 'LKR', 'INV-2026-0007', '2026-05-01 10:00:00'),
(8,  42500.00, 'bank_transfer',  'TXN-2026-008-BT', 'pending',   'LKR', 'INV-2026-0008', NULL),
(10,65000.00,  'bank_transfer',  'TXN-2026-010-BT', 'refunded',  'LKR', 'INV-2026-0010', '2026-04-01 09:00:00');

-- ============================================================
-- 8. EVENT TIMELINES
-- ============================================================
INSERT INTO event_timelines (booking_id, activity_name, start_time, end_time, assigned_to, notes, sequence_order) VALUES
-- Booking 1 (Wedding - completed)
(1, 'Guest Arrival & Registration',  '14:00', '14:30', 'Front Desk Staff',  'Welcome guests at entrance', 1),
(1, 'Nikah Ceremony',                '14:30', '15:30', 'Islamic Scholar',   'Ceremony at stage area',     2),
(1, 'Family Photo Session',          '15:30', '16:00', 'Photographer',      'Group photos at backdrop',   3),
(1, 'Dinner Buffet Opens',           '16:00', '18:00', 'Catering Team',     'Althab Restaurant service',  4),
(1, 'Cultural Programme',            '18:00', '20:00', 'Event Organizer',   'Nasheeds and speeches',      5),
(1, 'Cake Cutting & Desserts',       '20:00', '21:00', 'Event Organizer',   'Wedding cake cutting',       6),
(1, 'Farewell & Cleanup',            '21:00', '22:00', 'Hall Staff',        'Guest departure',            7),

-- Booking 5 (Wedding - upcoming)
(5, 'Venue Setup & Decoration',      '10:00', '14:00', 'Riyaz Events',      'Indoor garden setup',        1),
(5, 'Guest Arrival',                 '15:00', '15:30', 'Front Desk Staff',  'Welcome at entrance arch',   2),
(5, 'Wedding Ceremony',              '15:30', '17:00', 'Event Coordinator', 'Main ceremony at stage',     3),
(5, 'Photography Session',           '17:00', '17:30', 'Photographer',      'Couple and family photos',   4),
(5, 'Dinner Service',                '17:30', '20:00', 'Catering Team',     'Catering by Althab',         5),
(5, 'Entertainment',                 '20:00', '21:30', 'DJ / Nasheed',      'Cultural entertainment',     6),
(5, 'Cake & Sweets',                 '21:30', '22:00', 'Event Organizer',   'Dessert and farewell',       7);

-- ============================================================
-- 9. CATERING ORDERS
-- ============================================================
INSERT INTO catering_orders (booking_id, menu_items, total_cost, guest_count, status, special_notes, delivery_time, confirmed_at) VALUES
(1,
 '[{"item_id":1,"name":"Rice and Curry","qty":350,"price":350},{"item_id":8,"name":"Watalappan","qty":350,"price":120},{"item_id":14,"name":"Soft Drinks","qty":350,"price":80},{"item_id":17,"name":"Wedding Cake 3-tier","qty":1,"price":15000}]',
 178650.00, 350, 'delivered', 'Vegetarian menu. No beef.', '16:00:00', '2025-12-20 10:00:00'),

(2,
 '[{"item_id":2,"name":"Chicken Biriyani","qty":200,"price":450},{"item_id":11,"name":"Fruit Salad","qty":200,"price":150},{"item_id":15,"name":"Fresh Juice","qty":200,"price":150},{"item_id":19,"name":"Engagement Cake","qty":1,"price":5500}]',
 131500.00, 200, 'delivered', 'Pink colour theme cake.', '17:00:00', '2026-01-05 11:00:00'),

(5,
 '[{"item_id":1,"name":"Rice and Curry","qty":300,"price":350},{"item_id":7,"name":"Short Eats","qty":300,"price":250},{"item_id":10,"name":"Watalappan","qty":300,"price":120},{"item_id":14,"name":"Soft Drinks","qty":300,"price":80},{"item_id":17,"name":"Wedding Cake","qty":1,"price":15000}]',
 243000.00, 300, 'confirmed', 'Indoor garden theme. Fountain display.', '17:30:00', '2026-04-10 10:00:00'),

(7,
 '[{"item_id":6,"name":"Birthday Cake 2kg","qty":1,"price":6500},{"item_id":12,"name":"Ice Cream","qty":80,"price":180},{"item_id":13,"name":"Chocolate Fountain","qty":80,"price":350},{"item_id":14,"name":"Soft Drinks","qty":80,"price":80}]',
 54900.00, 80, 'pending', 'Unicorn theme cake. No nuts.', '15:30:00', NULL);

-- ============================================================
-- 10. BOOKING ORGANIZERS
-- ============================================================
INSERT INTO booking_organizers (booking_id, organizer_id, role_in_event, agreed_fee, status, notes) VALUES
(1, 1, 'Full Wedding Decoration & Stage Setup', 55000.00, 'completed', 'Traditional Sri Lankan wedding decor'),
(2, 2, 'Floral Arrangements & Engagement Setup', 25000.00, 'completed', 'Pink and gold floral theme'),
(3, 1, 'Luxury Wedding Decoration',              75000.00, 'completed', 'Premium floral and lighting setup'),
(5, 1, 'Indoor Garden Wedding Decoration',       60000.00, 'confirmed', 'Indoor garden theme with fountain'),
(5, 2, 'Floral Centrepieces & Backdrop',         30000.00, 'confirmed', 'Fresh flower centrepieces for all tables'),
(6, 2, 'Engagement Floral Setup',                20000.00, 'confirmed', 'Surprise engagement - minimal setup initially');

-- ============================================================
-- 11. FEEDBACK
-- ============================================================
INSERT INTO feedback (booking_id, user_id, rating, title, comment, is_public) VALUES
(1, 4, 5, 'Absolutely Perfect Wedding!',
 'Aazath Plaza made our wedding day truly unforgettable. The hall was beautifully decorated, the catering from Althab was excellent, and the staff were so helpful and professional. Highly recommended!',
 TRUE),
(2, 5, 5, 'Dream Engagement Ceremony',
 'We had our engagement at Aazath Plaza and it was beyond our expectations. The pink and gold decoration was stunning. The team handled everything perfectly. Will definitely book again!',
 TRUE),
(3, 6, 4, 'Grand Wedding Reception',
 'Our wedding reception was grand and well-organised. The Platinum Package was worth every rupee. Only minor issue was parking space was a bit limited. Overall excellent experience.',
 TRUE),
(4, 7, 5, 'Excellent Corporate Event',
 'We held our annual company seminar at Aazath Plaza. The corporate setup was professional, AV equipment worked perfectly, and the staff were very cooperative. Will book again for next year.',
 TRUE);

-- ============================================================
-- 12. NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (user_id, booking_id, type, channel, subject, message, recipient_email, recipient_phone, is_sent, sent_at) VALUES
(4, 1, 'booking_confirmation', 'both',  'Booking Confirmed - AP-20260101-0001', 'Dear Mohamed Rifkan, your booking for Wedding Reception on 15 Jan 2026 has been confirmed. Booking Ref: AP-20260101-0001. Total: LKR 165,000.', 'rifkan@gmail.com',  '+94774567890', TRUE, '2025-12-20 10:05:00'),
(4, 1, 'payment_receipt',      'email', 'Payment Receipt - INV-2026-0001',       'Dear Mohamed Rifkan, we have received your payment of LKR 165,000 for booking AP-20260101-0001. Invoice: INV-2026-0001.',                         'rifkan@gmail.com',  NULL,           TRUE, '2026-01-15 13:05:00'),
(5, 2, 'booking_confirmation', 'both',  'Booking Confirmed - AP-20260102-0002', 'Dear Fathima Zahira, your booking for Engagement Ceremony on 10 Feb 2026 has been confirmed. Total: LKR 110,000.',                               'zahira@gmail.com',  '+94775678901', TRUE, '2026-01-05 11:05:00'),
(8, 5, 'booking_confirmation', 'both',  'Booking Confirmed - AP-20260601-0005', 'Dear Hassan Mueen, your booking for Wedding Reception on 14 Jun 2026 has been confirmed. Total: LKR 165,000.',                                   'mueen@gmail.com',   '+94778901234', TRUE, '2026-04-10 10:05:00'),
(8, 5, 'event_reminder',       'sms',   'Event Reminder - Tomorrow!',            'Dear Hassan Mueen, this is a reminder that your Wedding Reception at Aazath Plaza is scheduled for TOMORROW 14 Jun 2026 at 3:00 PM.',             NULL,                '+94778901234', TRUE, '2026-06-13 09:00:00'),
(6, 8, 'booking_confirmation', 'email', 'Booking Received - AP-20260704-0008',  'Dear Abdul Basith, your booking request for Valima Ceremony on 25 Jul 2026 has been received and is pending confirmation.',                      'basith@gmail.com',  NULL,           TRUE, '2026-05-20 14:00:00');

-- ============================================================
-- 13. AUDIT LOG
-- ============================================================
INSERT INTO audit_log (user_id, action, table_name, record_id, new_values, ip_address) VALUES
(1, 'CREATE_USER',    'users',    1,  '{"email":"admin@aazathplaza.lk","role":"admin"}',      '127.0.0.1'),
(2, 'CONFIRM_BOOKING','bookings', 1,  '{"status":"confirmed","booking_ref":"AP-20260101-0001"}','192.168.1.10'),
(2, 'CONFIRM_BOOKING','bookings', 2,  '{"status":"confirmed","booking_ref":"AP-20260102-0002"}','192.168.1.10'),
(2, 'CONFIRM_BOOKING','bookings', 5,  '{"status":"confirmed","booking_ref":"AP-20260601-0005"}','192.168.1.10'),
(3, 'CONFIRM_BOOKING','bookings', 7,  '{"status":"confirmed","booking_ref":"AP-20260703-0007"}','192.168.1.12'),
(4, 'CREATE_BOOKING', 'bookings', 1,  '{"event_type":"Wedding Reception","event_date":"2026-01-15"}','102.165.1.5'),
(5, 'CREATE_BOOKING', 'bookings', 2,  '{"event_type":"Engagement Ceremony","event_date":"2026-02-10"}','102.165.2.8');

-- ============================================================
-- VERIFY: Count rows in each table
-- ============================================================
SELECT 'users'              AS table_name, COUNT(*) AS rows FROM users
UNION ALL SELECT 'packages',          COUNT(*) FROM packages
UNION ALL SELECT 'bookings',          COUNT(*) FROM bookings
UNION ALL SELECT 'payments',          COUNT(*) FROM payments
UNION ALL SELECT 'event_timelines',   COUNT(*) FROM event_timelines
UNION ALL SELECT 'organizers',        COUNT(*) FROM organizers
UNION ALL SELECT 'sponsors',          COUNT(*) FROM sponsors
UNION ALL SELECT 'booking_organizers',COUNT(*) FROM booking_organizers
UNION ALL SELECT 'menu_items',        COUNT(*) FROM menu_items
UNION ALL SELECT 'catering_orders',   COUNT(*) FROM catering_orders
UNION ALL SELECT 'feedback',          COUNT(*) FROM feedback
UNION ALL SELECT 'notifications',     COUNT(*) FROM notifications
UNION ALL SELECT 'audit_log',         COUNT(*) FROM audit_log
ORDER BY table_name;
