-- ============================================================
-- Bazaar — Seed Data
-- Run AFTER schema.sql in the Supabase SQL Editor
-- ============================================================

-- ── Clear existing data (safe to re-run) ─────────────────────
truncate table inquiries, listings, profiles restart identity cascade;

-- ── Profiles ─────────────────────────────────────────────────
insert into profiles (id, name, username, email, phone, role, city, website) values
  ('a1b2c3d4-0001-0000-0000-000000000001', 'Arjun Mehta',    'arjunm',   'arjun@bazaar.demo',   '9876543210', 'seller', 'Mumbai',     'arjunstore.in'),
  ('a1b2c3d4-0002-0000-0000-000000000002', 'Priya Sharma',   'priyas',   'priya@bazaar.demo',   '9876543211', 'buyer',  'Delhi',      null),
  ('a1b2c3d4-0003-0000-0000-000000000003', 'Ravi Kumar',     'ravikr',   'ravi@bazaar.demo',    '9876543212', 'seller', 'Bangalore',  null),
  ('a1b2c3d4-0004-0000-0000-000000000004', 'Sneha Patel',    'snehap',   'sneha@bazaar.demo',   '9876543213', 'buyer',  'Ahmedabad',  null),
  ('a1b2c3d4-0005-0000-0000-000000000005', 'Amit Singh',     'amits',    'amit@bazaar.demo',    '9876543214', 'seller', 'Hyderabad',  null),
  ('a1b2c3d4-0006-0000-0000-000000000006', 'Kavya Reddy',    'kavyar',   'kavya@bazaar.demo',   '9876543215', 'buyer',  'Chennai',    null),
  ('a1b2c3d4-0007-0000-0000-000000000007', 'Vikram Joshi',   'vikramj',  'vikram@bazaar.demo',  '9876543216', 'seller', 'Pune',       null),
  ('a1b2c3d4-0008-0000-0000-000000000008', 'Ananya Nair',    'anayan',   'ananya@bazaar.demo',  '9876543217', 'buyer',  'Kochi',      null),
  ('a1b2c3d4-0009-0000-0000-000000000009', 'Suresh Gupta',   'sureshg',  'suresh@bazaar.demo',  '9876543218', 'seller', 'Jaipur',     null),
  ('a1b2c3d4-0010-0000-0000-000000000010', 'Deepika Rao',    'deepikar', 'deepika@bazaar.demo', '9876543219', 'buyer',  'Kolkata',    null);

-- ── Listings ──────────────────────────────────────────────────
insert into listings (id, user_id, title, body, price, category, condition, status, images, created_at) values

-- Electronics
  ('b1000001-0000-0000-0000-000000000001', 'a1b2c3d4-0001-0000-0000-000000000001',
   'iphone 14 pro 256gb urgent sell',
   'Shifting to US next month so selling. Bought from Apple Store Bandra 6 months back. Battery health 97%. Box, charger, 1 cover included. Small hairline scratch on back glass barely visible. Price is 72k fixed, no lowball offers please. Call or WhatsApp only.',
   72000, 'electronics', 'Like New', 'active', '{}',
   now() - interval '2 days'),

  ('b1000001-0000-0000-0000-000000000002', 'a1b2c3d4-0003-0000-0000-000000000003',
   'Samsung 55 inch 4k smart tv - 1 yr old',
   'Got transferred to Hyderabad, no space in new flat. TV works perfectly, no dead pixels, no burn-in. Remote original. Stand included. Wall bracket also there. Bought from Reliance Digital Koramangala. Bill available. Buyer arrange pickup from HSR Layout.',
   43000, 'electronics', 'Good', 'active', '{}',
   now() - interval '5 days'),

  ('b1000001-0000-0000-0000-000000000003', 'a1b2c3d4-0007-0000-0000-000000000007',
   'Dell XPS 15 laptop i7 16gb - need to sell fast',
   'Urgent sale, bought new MacBook so this is lying unused. 512gb SSD, GTX 1650Ti graphics. Works like new. Small scuff on bottom panel only, screen and keyboard 100% ok. No issues whatsoever. Charger included. Serious buyers only, already got 4 enquiries.',
   66000, 'electronics', 'Good', 'active', '{}',
   now() - interval '1 day'),

  ('b1000001-0000-0000-0000-000000000004', 'a1b2c3d4-0001-0000-0000-000000000001',
   'Sony XM5 headphones - barely used',
   'Got these as gift but I use earbuds so no use for me. Used maybe 3-4 times total. Full box with all accessories. 30hr battery, ANC is amazing. Bought from Croma. Bill available. Pickup from Andheri West. Price slightly nego for quick deal.',
   20000, 'electronics', 'Like New', 'active', '{}',
   now() - interval '3 days'),

  ('b1000001-0000-0000-0000-000000000005', 'a1b2c3d4-0009-0000-0000-000000000009',
   'OnePlus 11 5G 16/256 - 4 months old',
   'Upgraded to new phone. Original owner, bought from OnePlus store. Screen protector from day 1, back has soft case always. Hasselblad camera, 100W charging. All original accessories. Price 36k negotiable. Located Malviya Nagar Jaipur.',
   36000, 'electronics', 'Like New', 'sold', '{}',
   now() - interval '10 days'),

-- Vehicles
  ('b1000001-0000-0000-0000-000000000006', 'a1b2c3d4-0003-0000-0000-000000000003',
   'Honda City 2019 ZX petrol - single owner',
   '1st owner, 42000 km driven mostly highway. All services done at Honda authorised only, records available. Sunroof, reverse cam, android auto. Minor scratch on rear bumper from parking, nothing major. Insurance valid till Dec 2025. RC in my name. No accident history. Serious buyers call, dont message asking "last price" without seeing.',
   750000, 'vehicles', 'Good', 'active', '{}',
   now() - interval '7 days'),

  ('b1000001-0000-0000-0000-000000000007', 'a1b2c3d4-0005-0000-0000-000000000005',
   'Royal Enfield Classic 350 Signals 2021',
   'Gunmetal grey signals edition, absolutely stunning condition. 18k km only. All paperwork clear, insurance till 2026. Crash guard, saree guard, extra seat cover all included. Reason for selling - bought Himalayan. Located Kukatpally Hyderabad. Test ride ok with valid DL.',
   148000, 'vehicles', 'Good', 'active', '{}',
   now() - interval '4 days'),

  ('b1000001-0000-0000-0000-000000000008', 'a1b2c3d4-0007-0000-0000-000000000007',
   'Activa 6G 2022 - low km scooter',
   'My wife was using, she switched to electric so selling. 8000 km only, very less. Regular oil change done. One small scratch on left panel (can see in photo). All docs ready, insurance valid. Pickup from Wakad Pune. Price 70k, little nego possible.',
   70000, 'vehicles', 'Like New', 'active', '{}',
   now() - interval '1 day'),

-- Furniture
  ('b1000001-0000-0000-0000-000000000009', 'a1b2c3d4-0001-0000-0000-000000000001',
   'IKEA Kallax 4x4 shelf white - self pickup',
   'Bought 1.5 yrs ago, shifting flat so selling. Good condition overall, 1 small chip on left top corner which you wont notice. All pegs present. Need to disassemble for transport, can guide you. Must pickup from Powai Mumbai. No delivery possible. Price is 8500 final.',
   8500, 'furniture', 'Good', 'active', '{}',
   now() - interval '6 days'),

  ('b1000001-0000-0000-0000-000000000010', 'a1b2c3d4-0009-0000-0000-000000000009',
   'Sheesham wood study table with drawers',
   'Solid wood, very heavy and sturdy. 4 feet wide, 2 drawers with lock. Old water stain on top surface - see photo. Otherwise very strong, no wobble. Good for WFH or student. Pickup from Civil Lines Jaipur. Price is 11000, negotiable.',
   11000, 'furniture', 'Fair', 'active', '{}',
   now() - interval '8 days'),

  ('b1000001-0000-0000-0000-000000000011', 'a1b2c3d4-0005-0000-0000-000000000005',
   'sofa set 3+2 grey - going abroad urgent',
   'Relocating to Canada in 2 weeks, genuine urgent sale. L&T fabric sofa, 2 years old, kids never sat on it so very clean. Stain-free. Must sell before 20th. Buyer arrange vehicle, will help load. Located Gachibowli. First come first served.',
   27000, 'furniture', 'Good', 'sold', '{}',
   now() - interval '12 days'),

-- Fashion
  ('b1000001-0000-0000-0000-000000000012', 'a1b2c3d4-0003-0000-0000-000000000003',
   'Ray Ban aviator original - used twice',
   'Bought from Sunglass Hut Mantri Mall. Used only 2 times. Original box, case, cleaning cloth all there. Very small smudge on one lens (wipes clean). Asking 4200. Not interested in swap offers, only cash. Call between 10am-8pm.',
   4200, 'fashion', 'Like New', 'active', '{}',
   now() - interval '2 days'),

  ('b1000001-0000-0000-0000-000000000013', 'a1b2c3d4-0007-0000-0000-000000000007',
   'Nike Air Max 270 size 10 - lightly used',
   'Original Nike bought from Nike.com. Worn maybe 5-6 times for casual outing only, never gym. Box included. No major scuffs, soles still very good. I''m upgrading to new model. 5000 nego if you pick up today from Kothrud.',
   5000, 'fashion', 'Good', 'active', '{}',
   now() - interval '3 days'),

  ('b1000001-0000-0000-0000-000000000014', 'a1b2c3d4-0001-0000-0000-000000000001',
   'Fossil Gen 6 smartwatch - good condition',
   'Wear OS watch, 44mm. Works fine, all features ok. Battery was replaced at service center 1 month back so fresh battery. Minor scratch on bezel which is normal with daily use. Charger included. No box. Price 13000, not much scope for nego.',
   13000, 'fashion', 'Good', 'active', '{}',
   now() - interval '5 days'),

-- Home & Garden
  ('b1000001-0000-0000-0000-000000000015', 'a1b2c3d4-0005-0000-0000-000000000005',
   'Philips air fryer 4.1L - 8 months used',
   'Good working condition. Used regularly for 8 months. Basket has slight staining from cooking (normal). All parts present. Selling because bought bigger OTG. Located Ameerpet. 5200 or best offer. Prefer quick deal this weekend.',
   5200, 'home-garden', 'Good', 'active', '{}',
   now() - interval '4 days'),

  ('b1000001-0000-0000-0000-000000000016', 'a1b2c3d4-0009-0000-0000-000000000009',
   'Dyson V10 vacuum cleaner - all attachments',
   'Bought for 40k, selling at 26k. Genuine reason - allergic to dust so stopped using vacuum entirely. Works like brand new, battery full health. All original attachments in box. Bought from Dyson service center Jaipur. Will demonstrate before sale.',
   26000, 'home-garden', 'Good', 'active', '{}',
   now() - interval '6 days'),

  ('b1000001-0000-0000-0000-000000000017', 'a1b2c3d4-0003-0000-0000-000000000003',
   'Indoor plants set of 8 with pots - Bangalore',
   'Shifting to smaller place, can''t take all plants. Mix of succulents, cacti and 2 money plants. All in good decorative pots. Low maintenance. Pick up from Indiranagar. Not shipping. Take all 8 for 1000 or pick individually at 150 each.',
   1000, 'home-garden', 'New', 'active', '{}',
   now() - interval '1 day'),

-- Sports
  ('b1000001-0000-0000-0000-000000000018', 'a1b2c3d4-0007-0000-0000-000000000007',
   'Yonex Astrox 99 badminton racket',
   'Used at club level for about 6 months. Grip changed 2 months back. String tension 26lbs, still good. Full cover case included. No cracks or damage to frame. Selling because switched to different model. 6000 nego. Pickup from Hadapsar badminton court area.',
   6000, 'sports', 'Good', 'active', '{}',
   now() - interval '3 days'),

  ('b1000001-0000-0000-0000-000000000019', 'a1b2c3d4-0001-0000-0000-000000000001',
   'Decathlon folding cycle 21 speed - serviced',
   'Bought for office commute but WFH now so no use. 26 inch, folds in 10 seconds. Front and rear disc brakes. Full service done last month at Decathlon Powai. Tyres new. Asking 12000 firm price. No test without full payment. Pickup only.',
   12000, 'sports', 'Good', 'active', '{}',
   now() - interval '9 days'),

  ('b1000001-0000-0000-0000-000000000020', 'a1b2c3d4-0005-0000-0000-000000000005',
   'adjustable dumbbells 2-24kg set with stand',
   'Bought during COVID lockdown, barely used now. Quick click weight adjustment, goes 2 to 24kg each. Both dumbbells + stand. Like new condition. Selling because joined gym. Located Kondapur. 9500 nego. WhatsApp photos available.',
   9500, 'sports', 'Like New', 'sold', '{}',
   now() - interval '15 days'),

-- Books
  ('b1000001-0000-0000-0000-000000000021', 'a1b2c3d4-0009-0000-0000-000000000009',
   'UPSC books full set 2024 edition - Jaipur',
   'Cleared mains, selling the entire set. Laxmikant 6th ed, Bipin Chandra, Spectrum Modern History, TMH GS 1-4, Geography by Majid Husain, and optional (PSIR). Total 14 books. Some highlighting in pencil only. All original editions, not photocopy. 3500 for full set, no individual sale.',
   3500, 'books', 'Good', 'active', '{}',
   now() - interval '2 days'),

  ('b1000001-0000-0000-0000-000000000022', 'a1b2c3d4-0003-0000-0000-000000000003',
   'Gaming PC i9 RTX 3080 full setup - Bangalore',
   'Full beast setup, built in 2022. i9-12900K, 32GB DDR5, 2TB NVMe, RTX 3080 10GB. Corsair 750W gold PSU. 27 inch 165Hz monitor included. Keyboard mouse headset also there. Selling because going abroad. 1.7L nego for genuine buyer. No trade/swap.',
   170000, 'electronics', 'Good', 'active', '{}',
   now() - interval '1 day'),

  ('b1000001-0000-0000-0000-000000000023', 'a1b2c3d4-0007-0000-0000-000000000007',
   'programming books - Clean Code DDIA SICP hardcover',
   'All 3 are hardcover editions. Read once. Clean Code by Robert Martin, Designing Data-Intensive Apps by Kleppmann, SICP Abelson & Sussman. Good condition. Spine intact on all. 2000 for all 3. Not selling individually. Pickup Kothrud Pune.',
   2000, 'books', 'Good', 'active', '{}',
   now() - interval '7 days'),

-- Toys & Games
  ('b1000001-0000-0000-0000-000000000024', 'a1b2c3d4-0001-0000-0000-000000000001',
   'LEGO Technic Bugatti Chiron 3599 pcs - complete',
   'Built and displayed on shelf for 1 year. Every single piece accounted for (checked twice). Original box in good shape. Instructions booklet included. No missing parts, no broken pieces. This is original LEGO not fake. 17000, slightly nego. Pickup Bandra.',
   17000, 'toys', 'Like New', 'active', '{}',
   now() - interval '4 days'),

  ('b1000001-0000-0000-0000-000000000025', 'a1b2c3d4-0005-0000-0000-000000000005',
   'PS5 disc edition + 2 controllers + 5 games',
   'Bought at launch 2021, works perfectly. 5 games: FIFA 24, God of War Ragnarok, Spiderman, GT7, Horizon. Both controllers work fine, L2 trigger on second one slightly stiff but works. No HDMI cable included (lost it). 40k firm. Located Manikonda Hyderabad. Call only.',
   40000, 'toys', 'Good', 'active', '{}',
   now() - interval '2 days'),

-- Services
  ('b1000001-0000-0000-0000-000000000026', 'a1b2c3d4-0003-0000-0000-000000000003',
   'Freelance web developer React NodeJS - project basis',
   '5 yrs experience. Have worked with startups and agencies. Do frontend (React, Next.js) and backend (Node, Express, Supabase, Firebase). Can handle full project solo or join your team. Rates: 800/hr or fixed price per project. Portfolio on request. Bangalore based but work remote.',
   800, 'services', 'New', 'active', '{}',
   now() - interval '3 days'),

  ('b1000001-0000-0000-0000-000000000027', 'a1b2c3d4-0009-0000-0000-000000000009',
   'Photographer available - weddings events portraits',
   '10+ years experience in weddings, corporate, portrait, product photography. Canon R5 body, 24-70 f2.8, 85mm f1.4. Editing included. Starting 5000 for half day. Jaipur based, travel possible for extra. Sample work on Instagram @sureshclicks. Whatsapp preferred.',
   5000, 'services', 'New', 'active', '{}',
   now() - interval '1 day'),

-- More Electronics
  ('b1000001-0000-0000-0000-000000000028', 'a1b2c3d4-0007-0000-0000-000000000007',
   'iPad Pro 12.9 M2 256gb + Apple Pencil + Magic KB',
   'Full combo, bought 7 months ago. iPad in perfect condition, no scratches. Apple Pencil 2nd gen works perfectly. Magic Keyboard folio slight wear on keys (normal). All original boxes. Bill from iStore available. Company is not reimbursing so personal sale. 90k negotiable.',
   90000, 'electronics', 'Like New', 'active', '{}',
   now() - interval '6 days'),

  ('b1000001-0000-0000-0000-000000000029', 'a1b2c3d4-0001-0000-0000-000000000001',
   'GoPro Hero 11 Black with full accessories kit',
   'Used for 2 treks and some reels, total maybe 30hrs footage. Works great. Comes with: 2 batteries, 64gb sandisk card, chest mount, head mount, selfie stick, waterproof housing, spare lens cover. Original box too. 25000 nego for quick sale this week.',
   25000, 'electronics', 'Good', 'active', '{}',
   now() - interval '5 days'),

-- Other
  ('b1000001-0000-0000-0000-000000000030', 'a1b2c3d4-0005-0000-0000-000000000005',
   'Antique style brass telescope - decorative',
   'Bought from Chor Bazaar Mumbai, paid 8k. Working optics, actually magnifies. About 90cm extended. Good brass finish, one small dent near focus ring. Great for home decor or gift. Selling because wife doesn''t like it lol. 4000 nego. Hyderabad pickup.',
   4000, 'other', 'Good', 'active', '{}',
   now() - interval '10 days');

-- ── Inquiries ─────────────────────────────────────────────────
insert into inquiries (listing_id, name, email, body, created_at) values
  ('b1000001-0000-0000-0000-000000000001', 'Priya Sharma',  'priya@bazaar.demo',   'Bhai still available kya? I am in Andheri only. Can meet today evening.', now() - interval '1 day'),
  ('b1000001-0000-0000-0000-000000000001', 'Sneha Patel',   'sneha@bazaar.demo',   'Battery health kitna show kar raha? I can do 70k cash if meet today.', now() - interval '12 hours'),
  ('b1000001-0000-0000-0000-000000000002', 'Ananya Nair',   'ananya@bazaar.demo',  'Is TV available? Does it have the wall bracket? Can pick up Saturday.', now() - interval '3 days'),
  ('b1000001-0000-0000-0000-000000000003', 'Priya Sharma',  'priya@bazaar.demo',   'Laptop still there? Any issue with battery backup or overheating?', now() - interval '8 hours'),
  ('b1000001-0000-0000-0000-000000000006', 'Deepika Rao',   'deepika@bazaar.demo', 'Is City available? Can you share RC book scan and service history photos?', now() - interval '2 days'),
  ('b1000001-0000-0000-0000-000000000006', 'Sneha Patel',   'sneha@bazaar.demo',   'Will you take 7 lakh? I have full cash ready, can close today itself.', now() - interval '1 day'),
  ('b1000001-0000-0000-0000-000000000007', 'Priya Sharma',  'priya@bazaar.demo',   'RE available? Odometer original reading hai? Koi accident hua tha kya?', now() - interval '2 days'),
  ('b1000001-0000-0000-0000-000000000009', 'Ananya Nair',   'ananya@bazaar.demo',  'Hi can I pick this weekend? Will it fit disassembled in a Creta boot?', now() - interval '5 days'),
  ('b1000001-0000-0000-0000-000000000015', 'Kavya Reddy',   'kavya@bazaar.demo',   'Which model exactly HD9200 or HD9216? Grill pan accessory milega?', now() - interval '3 days'),
  ('b1000001-0000-0000-0000-000000000018', 'Deepika Rao',   'deepika@bazaar.demo', 'Racket available? String kab change kiya? Tension still 26 hai kya?', now() - interval '1 day'),
  ('b1000001-0000-0000-0000-000000000019', 'Kavya Reddy',   'kavya@bazaar.demo',   'Does it fold small enough to fit in car dicky? Quite interested in it.', now() - interval '7 days'),
  ('b1000001-0000-0000-0000-000000000022', 'Priya Sharma',  'priya@bazaar.demo',   'RTX 3080 FE hai ya AIB? PSU kaunsa hai watts aur brand? Interested.', now() - interval '6 hours'),
  ('b1000001-0000-0000-0000-000000000024', 'Sneha Patel',   'sneha@bazaar.demo',   'LEGO Chiron available? Missing pieces toh nahi hain na? Dream set hai mera!', now() - interval '3 days'),
  ('b1000001-0000-0000-0000-000000000025', 'Kavya Reddy',   'kavya@bazaar.demo',   'PS5 available? Which 5 games hain? Indian region console hai kya?', now() - interval '1 day'),
  ('b1000001-0000-0000-0000-000000000028', 'Deepika Rao',   'deepika@bazaar.demo', 'Magic Keyboard mein koi key stuck toh nahi? Full combo lena hai mujhe.', now() - interval '4 days');
