
-- ===================================
-- SUPABASE DATABASE SETUP
-- Jalankan script ini di SQL Editor Supabase
-- ===================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS reward_ledger_entries CASCADE;
DROP TABLE IF EXISTS team_payment_records CASCADE;
DROP TABLE IF EXISTS team_project_payments CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS financial_pockets CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS addons CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS profile CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create tables
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  since DATE NOT NULL,
  instagram TEXT,
  status TEXT NOT NULL CHECK (status IN ('Prospek', 'Aktif', 'Tidak Aktif', 'Hilang')),
  last_contact DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price BIGINT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE addons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  standard_fee BIGINT NOT NULL,
  reward_balance BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE financial_pockets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL CHECK (icon IN ('piggy-bank', 'lock', 'users', 'clipboard-list')),
  type TEXT NOT NULL CHECK (type IN ('Nabung & Bayar', 'Terkunci', 'Bersama', 'Anggaran Pengeluaran')),
  amount BIGINT DEFAULT 0,
  goal_amount BIGINT,
  lock_end_date DATE,
  members JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  project_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_id TEXT NOT NULL REFERENCES clients(id),
  project_type TEXT NOT NULL,
  package_name TEXT NOT NULL,
  package_id TEXT NOT NULL REFERENCES packages(id),
  add_ons JSONB DEFAULT '[]',
  date DATE NOT NULL,
  deadline_date DATE,
  location TEXT NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT NOT NULL CHECK (status IN ('Tertunda', 'Persiapan', 'Dikonfirmasi', 'Editing', 'Cetak', 'Selesai', 'Dibatalkan')),
  total_cost BIGINT NOT NULL,
  amount_paid BIGINT DEFAULT 0,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('Lunas', 'DP Terbayar', 'Belum Bayar')),
  team JSONB DEFAULT '[]',
  notes TEXT,
  accommodation TEXT,
  drive_link TEXT,
  start_time TEXT,
  end_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount BIGINT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Pemasukan', 'Pengeluaran')),
  project_id TEXT REFERENCES projects(id),
  category TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('Transfer Bank', 'Tunai', 'E-Wallet', 'Sistem')),
  pocket_id TEXT REFERENCES financial_pockets(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE team_project_payments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  team_member_name TEXT NOT NULL,
  team_member_id TEXT NOT NULL REFERENCES team_members(id),
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Paid', 'Unpaid')),
  fee BIGINT NOT NULL,
  reward BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE team_payment_records (
  id TEXT PRIMARY KEY,
  record_number TEXT NOT NULL,
  team_member_id TEXT NOT NULL REFERENCES team_members(id),
  date DATE NOT NULL,
  project_payment_ids JSONB NOT NULL,
  total_amount BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_channel TEXT NOT NULL CHECK (contact_channel IN ('WhatsApp', 'Instagram', 'Website', 'Telepon', 'Referensi', 'Form Saran', 'Lainnya')),
  location TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Baru Masuk', 'Sedang Diskusi', 'Menunggu Follow Up', 'Dikonversi', 'Ditolak')),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reward_ledger_entries (
  id TEXT PRIMARY KEY,
  team_member_id TEXT NOT NULL REFERENCES team_members(id),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount BIGINT NOT NULL,
  project_id TEXT REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE profile (
  id TEXT PRIMARY KEY DEFAULT 'main_profile',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT NOT NULL,
  website TEXT NOT NULL,
  address TEXT NOT NULL,
  bank_account TEXT NOT NULL,
  bio TEXT NOT NULL,
  income_categories JSONB NOT NULL,
  expense_categories JSONB NOT NULL,
  project_types JSONB NOT NULL,
  event_types JSONB NOT NULL,
  notification_settings JSONB NOT NULL,
  security_settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert mock data
INSERT INTO users (id, email, password, full_name, role) VALUES
('40ef4507-b94f-45fd-b58d-83d71bb77381', 'admin@venapictures.com', 'password123', 'Admin Utama', 'Admin'),
('USR002', 'member@perusahaan.com', 'password123', 'Staff Member', 'Member');

INSERT INTO packages (id, name, price, description) VALUES
('PKG001', 'Paket Basic Wedding', 15000000, 'Paket pernikahan dasar dengan foto dan video sederhana'),
('PKG002', 'Paket Premium Wedding', 25000000, 'Paket pernikahan premium dengan foto, video, dan dokumentasi lengkap'),
('PKG003', 'Paket Luxury Wedding', 45000000, 'Paket pernikahan mewah dengan semua fasilitas premium'),
('PKG004', 'Paket Engagement', 8000000, 'Paket foto dan video lamaran'),
('PKG005', 'Paket Corporate Event', 12000000, 'Paket dokumentasi acara perusahaan');

INSERT INTO addons (id, name, price) VALUES
('ADD001', 'Same Day Edit', 3500000),
('ADD002', 'Photo Booth', 2500000),
('ADD003', 'Drone Photography', 2000000),
('ADD004', 'Extra Album', 1500000),
('ADD005', 'Live Streaming', 4000000);

INSERT INTO team_members (id, name, role, email, phone, standard_fee, reward_balance) VALUES
('TM001', 'Budi Photographer', 'Fotografer', 'budi@email.com', '081234567890', 2500000, 150000),
('TM002', 'Sari Videographer', 'Videografer', 'sari@email.com', '081234567891', 3000000, 0),
('TM003', 'Andi Editor', 'Editor', 'andi@email.com', '081234567892', 1500000, 100000),
('TM004', 'Maya Assistant', 'Asisten', 'maya@email.com', '081234567893', 800000, 0);

INSERT INTO clients (id, name, email, phone, since, instagram, status, last_contact) VALUES
('CLI001', 'John & Jane Wedding', 'john.jane@email.com', '081234567894', '2024-01-15', '@johnjane_wedding', 'Aktif', '2024-01-15'),
('CLI002', 'PT. Maju Bersama', 'info@majubersama.com', '081234567895', '2024-02-01', '@ptmajubersama', 'Aktif', '2024-02-01'),
('CLI003', 'Sarah & David', 'sarah.david@email.com', '081234567896', '2024-02-15', '@sarahdavid_couple', 'Prospek', '2024-02-15'),
('CLI004', 'CV. Sukses Mandiri', 'contact@suksesmandiri.co.id', '081234567897', '2024-03-01', null, 'Aktif', '2024-03-01');

INSERT INTO financial_pockets (id, name, description, icon, type, amount, goal_amount, lock_end_date, members) VALUES
('POC001', 'Tabungan Equipment', 'Tabungan untuk pembelian peralatan baru', 'piggy-bank', 'Nabung & Bayar', 15000000, 50000000, null, '[]'),
('POC002', 'Dana Darurat', 'Dana cadangan untuk situasi darurat', 'lock', 'Terkunci', 25000000, null, '2024-12-31', '[]'),
('POC003', 'Anggaran Bulanan', 'Anggaran pengeluaran operasional bulanan', 'clipboard-list', 'Anggaran Pengeluaran', 0, 10000000, null, '[]');

INSERT INTO projects (id, project_name, client_name, client_id, project_type, package_name, package_id, add_ons, date, deadline_date, location, progress, status, total_cost, amount_paid, payment_status, team, notes, accommodation, drive_link, start_time, end_time) VALUES
('PRJ001', 'Wedding John & Jane', 'John & Jane Wedding', 'CLI001', 'Wedding', 'Paket Premium Wedding', 'PKG002', '[{"id": "ADD001", "name": "Same Day Edit", "price": 3500000}]', '2024-03-15', '2024-03-20', 'Hotel Grand Indonesia, Jakarta', 75, 'Editing', 28500000, 15000000, 'DP Terbayar', '[{"memberId": "TM001", "name": "Budi Photographer", "role": "Fotografer", "fee": 2500000, "reward": 200000}, {"memberId": "TM002", "name": "Sari Videographer", "role": "Videografer", "fee": 3000000, "reward": 250000}]', 'Pernikahan outdoor dengan tema garden party', 'Hotel disediakan klien', 'https://drive.google.com/folder/abc123', '08:00', '22:00'),
('PRJ002', 'Corporate Event PT Maju Bersama', 'PT. Maju Bersama', 'CLI002', 'Corporate', 'Paket Corporate Event', 'PKG005', '[]', '2024-02-28', '2024-03-05', 'Ballroom Shangri-La, Jakarta', 100, 'Selesai', 12000000, 12000000, 'Lunas', '[{"memberId": "TM001", "name": "Budi Photographer", "role": "Fotografer", "fee": 2000000, "reward": 150000}, {"memberId": "TM003", "name": "Andi Editor", "role": "Editor", "fee": 1500000, "reward": 100000}]', 'Annual company meeting dan award ceremony', null, 'https://drive.google.com/folder/def456', '09:00', '17:00'),
('PRJ003', 'Engagement Sarah & David', 'Sarah & David', 'CLI003', 'Engagement', 'Paket Engagement', 'PKG004', '[{"id": "ADD003", "name": "Drone Photography", "price": 2000000}]', '2024-04-10', '2024-04-15', 'Pantai Ancol, Jakarta', 25, 'Dikonfirmasi', 10000000, 5000000, 'DP Terbayar', '[{"memberId": "TM001", "name": "Budi Photographer", "role": "Fotografer", "fee": 2000000, "reward": 150000}]', 'Sesi foto pre-wedding di pantai saat sunset', null, null, '16:00', '19:00');

INSERT INTO transactions (id, date, description, amount, type, project_id, category, method, pocket_id) VALUES
('TRN001', '2024-01-15', 'DP Wedding John & Jane', 15000000, 'Pemasukan', 'PRJ001', 'DP Proyek', 'Transfer Bank', null),
('TRN002', '2024-02-28', 'Pembayaran lunas Corporate Event PT Maju Bersama', 12000000, 'Pemasukan', 'PRJ002', 'Pelunasan Proyek', 'Transfer Bank', null),
('TRN003', '2024-02-15', 'DP Engagement Sarah & David', 5000000, 'Pemasukan', 'PRJ003', 'DP Proyek', 'Transfer Bank', null),
('TRN004', '2024-01-20', 'Pembelian Memory Card', 2500000, 'Pengeluaran', null, 'Peralatan', 'Transfer Bank', null),
('TRN005', '2024-02-01', 'Biaya Transport', 500000, 'Pengeluaran', 'PRJ002', 'Transportasi', 'Tunai', null),
('TRN006', '2024-02-10', 'Top up tabungan equipment', 5000000, 'Pengeluaran', null, 'Transfer Antar Kantong', 'Transfer Bank', 'POC001');

INSERT INTO team_project_payments (id, project_id, team_member_name, team_member_id, date, status, fee, reward) VALUES
('TPP001', 'PRJ002', 'Budi Photographer', 'TM001', '2024-02-28', 'Paid', 2000000, 150000),
('TPP002', 'PRJ002', 'Andi Editor', 'TM003', '2024-02-28', 'Paid', 1500000, 100000),
('TPP003', 'PRJ001', 'Budi Photographer', 'TM001', '2024-03-15', 'Unpaid', 2500000, 200000),
('TPP004', 'PRJ001', 'Sari Videographer', 'TM002', '2024-03-15', 'Unpaid', 3000000, 250000),
('TPP005', 'PRJ003', 'Budi Photographer', 'TM001', '2024-04-10', 'Unpaid', 2000000, 150000);

INSERT INTO team_payment_records (id, record_number, team_member_id, date, project_payment_ids, total_amount) VALUES
('TPR001', 'PAY-FR-TM001-001', 'TM001', '2024-03-01', '["TPP001"]', 2000000),
('TPR002', 'PAY-FR-TM003-001', 'TM003', '2024-03-01', '["TPP002"]', 1500000);

INSERT INTO leads (id, name, contact_channel, location, status, date, notes) VALUES
('LEAD001', 'Michael & Lisa', 'Instagram', 'Surabaya', 'Sedang Diskusi', '2024-01-10', 'Tertarik paket premium wedding, budget sekitar 30jt'),
('LEAD002', 'PT. Teknologi Masa Depan', 'Website', 'Bandung', 'Menunggu Follow Up', '2024-01-25', 'Butuh dokumentasi launching produk baru'),
('LEAD003', 'Ahmad & Siti', 'WhatsApp', 'Jakarta', 'Baru Masuk', '2024-02-05', 'Mencari paket engagement shoot'),
('LEAD004', 'CV. Kreatif Indonesia', 'Referensi', 'Yogyakarta', 'Dikonversi', '2024-01-20', 'Sudah menjadi klien CLI004');

INSERT INTO reward_ledger_entries (id, team_member_id, date, description, amount, project_id) VALUES
('RLE001', 'TM001', '2024-03-01', 'Hadiah dari proyek: Corporate Event PT Maju Bersama', 150000, 'PRJ002'),
('RLE002', 'TM003', '2024-03-01', 'Hadiah dari proyek: Corporate Event PT Maju Bersama', 100000, 'PRJ002');

INSERT INTO profile (id, full_name, email, phone, company_name, website, address, bank_account, bio, income_categories, expense_categories, project_types, event_types, notification_settings, security_settings) VALUES
('main_profile', 
'Studio Fotografi Indah', 
'info@studiofotografiindah.com', 
'081234567800', 
'Studio Fotografi Indah', 
'www.studiofotografiindah.com', 
'Jl. Sudirman No. 123, Jakarta Pusat', 
'BCA 1234567890 a.n. Studio Fotografi Indah', 
'Studio fotografi profesional yang mengkhususkan diri dalam wedding, corporate event, dan portrait photography dengan pengalaman lebih dari 10 tahun.',
'["DP Proyek", "Pelunasan Proyek", "Jasa Fotografi", "Jasa Videografi", "Jasa Editing"]',
'["Peralatan", "Transportasi", "Akomodasi", "Gaji Freelancer", "Hadiah Freelancer", "Penarikan Hadiah Freelancer", "Marketing", "Operasional", "Transfer Antar Kantong"]',
'["Wedding", "Engagement", "Corporate", "Portrait", "Event", "Product"]',
'["Pernikahan", "Lamaran", "Ulang Tahun", "Wisuda", "Corporate Meeting", "Launching Produk"]',
'{"newProject": true, "paymentConfirmation": true, "deadlineReminder": true}',
'{"twoFactorEnabled": false}'
);

-- Success message
SELECT 'Database setup completed successfully!' as message;
