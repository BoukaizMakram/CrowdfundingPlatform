-- ═══════════════════════════════════════
-- WaqfFund Seed Data
-- Run this AFTER migration.sql
-- ═══════════════════════════════════════

-- Insert users
insert into public.users (id, email, full_name, phone, is_admin) values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin@waqffund.org', 'Admin User', '+1234567890', true),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'ahmad@example.com', 'Ahmad Rahman', '+1234567891', false),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'sarah@example.com', 'Sarah Johnson', '+1234567892', false);

-- Insert campaigns
insert into public.campaigns (id, creator_id, creator_name, title, description, goal_amount, raised_amount, category, cover_image_url, status, featured) values
  (
    'd4e5f6a7-b8c9-0123-def0-234567890123',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Ahmad Rahman',
    'Help Yusuf Get Life-Saving Heart Surgery',
    E'Yusuf is a 7-year-old boy who needs urgent heart surgery. His family cannot afford the medical costs, and time is running out.\n\nThe surgery costs $15,000 and needs to happen within the next two months. Your donation, no matter how small, can help save Yusuf''s life.\n\nAll funds will go directly to the hospital for Yusuf''s treatment. We will provide regular updates on his progress.\n\nMay Allah reward you for your generosity.',
    15000, 8750, 'medical',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    'approved', true
  ),
  (
    'e5f6a7b8-c9d0-1234-ef01-345678901234',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'Sarah Johnson',
    'Build a School in Rural Indonesia',
    E'Children in a remote village in Indonesia walk 3 hours each day to reach the nearest school. We want to build a primary school in their village.\n\nThe school will serve 200 children and provide them with quality education close to home. It will include 6 classrooms, a library, and proper sanitation facilities.\n\nYour contribution will help shape the future of these children and their community.',
    50000, 23400, 'education',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800',
    'approved', true
  ),
  (
    'f6a7b8c9-d0e1-2345-f012-456789012345',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Ahmad Rahman',
    'Restore Historic Mosque in Bosnia',
    E'A historic mosque built in the 15th century is in urgent need of restoration. The roof is leaking, walls are cracking, and the minaret needs reinforcement.\n\nThis mosque serves over 500 worshippers daily and is an important part of Islamic heritage. Help us preserve this sacred space for future generations.\n\nFunds will be used for structural repairs, roof replacement, and interior restoration while maintaining the original architectural style.',
    30000, 17800, 'mosque',
    'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800',
    'approved', true
  ),
  (
    'a7b8c9d0-e1f2-3456-0123-567890123456',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'Sarah Johnson',
    'Ramadan Food Packages for 500 Families',
    E'This Ramadan, help us provide food packages to 500 families in need around the world. Each package contains essential items for the holy month including dates, rice, oil, and other staples.\n\nCost per family package: $50\n\nTogether, we can ensure no family goes hungry during this blessed month. Every contribution counts!',
    25000, 12500, 'sadaqa',
    'https://images.unsplash.com/photo-1532635241-17e820acc59f?w=800',
    'approved', false
  ),
  (
    'b8c9d0e1-f2a3-4567-1234-678901234567',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Ahmad Rahman',
    'Emergency Relief for Flood Victims',
    E'Following recent devastating floods, thousands of families have lost their homes and belongings. They urgently need shelter, food, and medical supplies.\n\nYour donation will help provide:\n- Emergency tents and blankets\n- Food and clean water\n- Medical supplies and first aid\n- Clothing and hygiene products\n\nEvery dollar helps. Please give generously.',
    100000, 67200, 'emergency',
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800',
    'approved', true
  ),
  (
    'c9d0e1f2-a3b4-5678-2345-789012345678',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'Sarah Johnson',
    'Support Women Artisans Cooperative',
    E'Help us establish a women''s cooperative that will provide sustainable income for 30 women through traditional crafts.\n\nThe funding will cover:\n- Workshop space rental\n- Raw materials\n- Training programs\n- Marketing and sales support\n\nEmpower these women to support their families while preserving traditional artisan crafts.',
    18000, 4500, 'business',
    'https://images.unsplash.com/photo-1559070169-a3077159ee16?w=800',
    'approved', false
  ),
  (
    'd0e1f2a3-b4c5-6789-3456-890123456789',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Ahmad Rahman',
    'Cancer Treatment for Sister Khadija',
    E'Khadija, a 45-year-old mother of three, has been diagnosed with breast cancer. She needs chemotherapy and surgery that her family cannot afford.\n\nTotal treatment cost: $20,000\n\nKhadija has dedicated her life to teaching children in her community. Now she needs our help to fight this battle. Your sadaqa jariya could save her life.',
    20000, 15600, 'medical',
    'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800',
    'approved', false
  ),
  (
    'e1f2a3b4-c5d6-7890-4567-901234567890',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'Sarah Johnson',
    'Scholarships for Orphan Students',
    E'Provide educational scholarships for 50 orphan students to continue their high school and university education.\n\nEach scholarship covers:\n- Tuition fees\n- Books and supplies\n- Transportation\n- Monthly stipend\n\nEducation is the key to breaking the cycle of poverty. Help these young people build a better future.',
    40000, 8900, 'education',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    'approved', false
  );

-- Insert donations
insert into public.donations (campaign_id, donor_name, amount, is_anonymous) values
  ('d4e5f6a7-b8c9-0123-def0-234567890123', 'Mohammed K.', 500, false),
  ('d4e5f6a7-b8c9-0123-def0-234567890123', 'Anonymous', 1000, true),
  ('d4e5f6a7-b8c9-0123-def0-234567890123', 'Emily S.', 250, false),
  ('d4e5f6a7-b8c9-0123-def0-234567890123', 'Omar M.', 100, false),
  ('e5f6a7b8-c9d0-1234-ef01-345678901234', 'Fatima L.', 1500, false),
  ('e5f6a7b8-c9d0-1234-ef01-345678901234', 'Anonymous', 5000, true),
  ('f6a7b8c9-d0e1-2345-f012-456789012345', 'Hassan R.', 800, false),
  ('b8c9d0e1-f2a3-4567-1234-678901234567', 'Aisha F.', 2500, false);
