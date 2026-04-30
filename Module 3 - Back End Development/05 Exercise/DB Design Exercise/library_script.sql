-- ============================================================
-- LIBRARY MANAGEMENT SYSTEM — FINAL DATABASE SCHEMA
-- PostgreSQL | Version: 1.0
-- ============================================================

-- ============================================================
-- STEP 1: CUSTOM ENUM TYPES
-- Analogi: Enum seperti dropdown pilihan — DB hanya terima
-- nilai yang sudah terdaftar, tidak bisa input sembarangan.
-- ============================================================

CREATE TYPE member_status     AS ENUM ('active', 'suspended', 'expired');
CREATE TYPE inventory_status  AS ENUM ('available', 'borrowed', 'lost', 'damaged', 'reserved');
CREATE TYPE transaction_status AS ENUM ('ongoing', 'completed', 'cancelled');
CREATE TYPE staff_role        AS ENUM ('librarian', 'manager', 'cleaner', 'stockist');
CREATE TYPE work_shift        AS ENUM ('morning', 'night');
CREATE TYPE book_language     AS ENUM ('indonesian', 'english', 'other');

-- ============================================================
-- STEP 2: TRIGGER FUNCTION untuk auto-update updated_at
-- Analogi: Seperti stempel otomatis yang cap tanggal hari ini
-- setiap kali ada perubahan di catatan.
-- ============================================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- STEP 3: FINE CONFIGURATION TABLE
-- Tabel konfigurasi denda — dipisah dari kode aplikasi
-- supaya bisa diubah admin tanpa perlu deploy ulang.
-- ============================================================

CREATE TABLE fine_configs (
  id                  SERIAL          PRIMARY KEY,
  fine_per_day        NUMERIC(10,2)   NOT NULL DEFAULT 1000.00, -- IDR per hari
  grace_period_days   INTEGER         NOT NULL DEFAULT 0
                        CHECK (grace_period_days >= 0),
  effective_from      DATE            NOT NULL DEFAULT CURRENT_DATE,
  note                TEXT,
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_fine_configs_updated_at
  BEFORE UPDATE ON fine_configs
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Seed: default config
INSERT INTO fine_configs (fine_per_day, grace_period_days, note)
VALUES (1000.00, 0, 'Default rate: Rp 1.000/hari');

-- ============================================================
-- STEP 4: CORE LIBRARY ENTITY TABLES
-- ============================================================

-- ------------------------------------------------------------
-- BRANCHES — Cabang perpustakaan
-- ------------------------------------------------------------
CREATE TABLE branches (
  id                  SERIAL          PRIMARY KEY,
  branch_name         VARCHAR(100)    NOT NULL,
  address             VARCHAR(255)    NOT NULL,
  phone_number        VARCHAR(20),
  established_date    DATE            NOT NULL DEFAULT CURRENT_DATE,
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_branches_updated_at
  BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ------------------------------------------------------------
-- MEMBERS — Data anggota perpustakaan
-- ------------------------------------------------------------
CREATE TABLE members (
  id                  SERIAL          PRIMARY KEY,
  first_name          VARCHAR(100)    NOT NULL,
  last_name           VARCHAR(100)    NOT NULL,
  email               VARCHAR(150)    NOT NULL UNIQUE,
  phone_number        VARCHAR(20),
  registration_date   DATE            NOT NULL DEFAULT CURRENT_DATE,
  exp_date            DATE            NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
  status              member_status   NOT NULL DEFAULT 'active',
  borrow_limit        INTEGER         NOT NULL DEFAULT 3
                        CHECK (borrow_limit > 0 AND borrow_limit <= 20),
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  -- Pastikan exp_date selalu setelah registration_date
  CONSTRAINT chk_member_dates CHECK (exp_date > registration_date)
);

CREATE INDEX idx_members_email  ON members (email);
CREATE INDEX idx_members_status ON members (status);

CREATE TRIGGER trg_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ------------------------------------------------------------
-- MEMBERSHIP_RENEWALS — History perpanjangan keanggotaan
-- Analogi: Buku log perpanjangan kartu member — tiap kali
-- diperpanjang, dicatat: siapa, kapan, dan dari/sampai kapan.
-- ------------------------------------------------------------
CREATE TABLE membership_renewals (
  id                  SERIAL          PRIMARY KEY,
  member_id           INTEGER         NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  processed_by_staff  INTEGER,        -- FK ke staff, diisi setelah tabel staff dibuat
  old_exp_date        DATE            NOT NULL,
  new_exp_date        DATE            NOT NULL,
  duration_days       INTEGER         NOT NULL DEFAULT 365
                        CHECK (duration_days > 0),
  note                TEXT,
  renewed_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_renewal_dates CHECK (new_exp_date > old_exp_date)
);

CREATE INDEX idx_renewals_member_id ON membership_renewals (member_id);

-- ------------------------------------------------------------
-- STAFF — Karyawan perpustakaan
-- ------------------------------------------------------------
CREATE TABLE staff (
  id                  SERIAL          PRIMARY KEY,
  branch_id           INTEGER         NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  first_name          VARCHAR(100)    NOT NULL,
  last_name           VARCHAR(100)    NOT NULL,
  role                staff_role      NOT NULL,
  work_schedule       work_shift      NOT NULL,
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_branch_id ON staff (branch_id);

CREATE TRIGGER trg_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Sekarang tambahkan FK dari membership_renewals ke staff
ALTER TABLE membership_renewals
  ADD CONSTRAINT fk_renewals_staff
  FOREIGN KEY (processed_by_staff) REFERENCES staff(id) ON DELETE SET NULL;

-- ============================================================
-- STEP 5: BOOK & INVENTORY TABLES
-- ============================================================

-- ------------------------------------------------------------
-- BOOKS — Data buku (katalog)
-- Analogi: Ini seperti kartu katalog di perpustakaan lama —
-- satu kartu per judul buku, bukan per eksemplar fisik.
-- ------------------------------------------------------------
CREATE TABLE books (
  id                  SERIAL          PRIMARY KEY,
  title               VARCHAR(255)    NOT NULL,
  author              VARCHAR(255)    NOT NULL,
  isbn                VARCHAR(20)     UNIQUE,
  category            VARCHAR(50),
  language            book_language   NOT NULL DEFAULT 'indonesian',
  publication_year    SMALLINT
                        CHECK (publication_year >= 1000 AND publication_year <= EXTRACT(YEAR FROM NOW())::SMALLINT),
  total_pages         INTEGER
                        CHECK (total_pages > 0),
  description         TEXT,
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_books_title    ON books USING gin(to_tsvector('simple', title));
CREATE INDEX idx_books_author   ON books (author);
CREATE INDEX idx_books_category ON books (category);
CREATE INDEX idx_books_isbn     ON books (isbn);

CREATE TRIGGER trg_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ------------------------------------------------------------
-- INVENTORY — Eksemplar fisik buku per cabang
-- Analogi: Kalau BOOKS adalah "judul buku", INVENTORY adalah
-- "buku fisik nomor sekian yang ada di rak cabang A".
-- Satu judul bisa punya banyak eksemplar di banyak cabang.
-- ------------------------------------------------------------
CREATE TABLE inventory (
  id                  SERIAL          PRIMARY KEY,
  book_id             INTEGER         NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
  branch_id           INTEGER         NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  status              inventory_status NOT NULL DEFAULT 'available',
  condition_note      TEXT,           -- catatan kondisi buku jika rusak/hilang
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_book_id   ON inventory (book_id);
CREATE INDEX idx_inventory_branch_id ON inventory (branch_id);
CREATE INDEX idx_inventory_status    ON inventory (status);

CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================
-- STEP 6: TRANSACTION TABLES
-- Analogi: Header transaksi = struk kasir.
-- Detail transaksi = item-item di dalam struk itu.
-- ============================================================

-- ------------------------------------------------------------
-- BORROWING_TRANSACTIONS — Header transaksi peminjaman
-- ------------------------------------------------------------
CREATE TABLE borrowing_transactions (
  id                  SERIAL              PRIMARY KEY,
  member_id           INTEGER             NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  staff_id            INTEGER             NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
  branch_id           INTEGER             NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  transaction_date    TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  transaction_status  transaction_status  NOT NULL DEFAULT 'ongoing',
  total_fines_accrued NUMERIC(10,2)       NOT NULL DEFAULT 0.00
                        CHECK (total_fines_accrued >= 0),
  created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bt_member_id ON borrowing_transactions (member_id);
CREATE INDEX idx_bt_staff_id  ON borrowing_transactions (staff_id);
CREATE INDEX idx_bt_branch_id ON borrowing_transactions (branch_id);
CREATE INDEX idx_bt_status    ON borrowing_transactions (transaction_status);

CREATE TRIGGER trg_bt_updated_at
  BEFORE UPDATE ON borrowing_transactions
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ------------------------------------------------------------
-- BORROWING_DETAILS — Item per transaksi (satu baris = satu buku)
-- ------------------------------------------------------------
CREATE TABLE borrowing_details (
  id                  SERIAL          PRIMARY KEY,
  transaction_id      INTEGER         NOT NULL REFERENCES borrowing_transactions(id) ON DELETE CASCADE,
  inventory_id        INTEGER         NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
  due_date            DATE            NOT NULL,
  return_date         DATE,           -- NULL sampai buku dikembalikan
  fine_amount         NUMERIC(10,2)   NOT NULL DEFAULT 0.00
                        CHECK (fine_amount >= 0),
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  -- Pastikan return_date (jika ada) tidak sebelum due_date
  CONSTRAINT chk_return_date CHECK (return_date IS NULL OR return_date >= created_at::DATE),

  -- Satu eksemplar tidak boleh dipinjam 2x dalam transaksi yang sama
  UNIQUE (transaction_id, inventory_id)
);

CREATE INDEX idx_bd_transaction_id ON borrowing_details (transaction_id);
CREATE INDEX idx_bd_inventory_id   ON borrowing_details (inventory_id);
CREATE INDEX idx_bd_due_date       ON borrowing_details (due_date);

CREATE TRIGGER trg_bd_updated_at
  BEFORE UPDATE ON borrowing_details
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================
-- STEP 7: VIEWS untuk query yang sering dibutuhkan
-- Analogi: View seperti laporan siap pakai — tinggal panggil,
-- tidak perlu tulis JOIN yang panjang berulang kali.
-- ============================================================

-- View: Buku yang sedang dipinjam (overdue check)
CREATE VIEW v_active_borrowings AS
SELECT
  bd.id                 AS detail_id,
  bt.id                 AS transaction_id,
  m.first_name || ' ' || m.last_name AS member_name,
  m.email               AS member_email,
  b.title               AS book_title,
  b.author              AS book_author,
  br.branch_name,
  bd.due_date,
  bd.return_date,
  CASE
    WHEN bd.return_date IS NULL AND bd.due_date < CURRENT_DATE
    THEN (CURRENT_DATE - bd.due_date)
    ELSE 0
  END                   AS days_overdue,
  bd.fine_amount
FROM borrowing_details bd
JOIN borrowing_transactions bt ON bt.id = bd.transaction_id
JOIN members m                 ON m.id = bt.member_id
JOIN inventory inv             ON inv.id = bd.inventory_id
JOIN books b                   ON b.id = inv.book_id
JOIN branches br               ON br.id = bt.branch_id
WHERE bd.return_date IS NULL
  AND bt.transaction_status = 'ongoing';

-- View: Stok buku tersedia per cabang
CREATE VIEW v_book_availability AS
SELECT
  b.id          AS book_id,
  b.title,
  b.author,
  b.isbn,
  br.branch_name,
  COUNT(inv.id) FILTER (WHERE inv.status = 'available') AS available_copies,
  COUNT(inv.id) FILTER (WHERE inv.status = 'borrowed')  AS borrowed_copies,
  COUNT(inv.id)                                          AS total_copies
FROM books b
JOIN inventory inv ON inv.book_id = b.id
JOIN branches br   ON br.id = inv.branch_id
GROUP BY b.id, b.title, b.author, b.isbn, br.branch_name;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
