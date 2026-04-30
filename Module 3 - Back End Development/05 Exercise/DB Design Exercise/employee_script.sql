-- ============================================================
-- EMPLOYEE MANAGEMENT SYSTEM - PostgreSQL Schema
-- Best Practice Version | IDR Currency | No Project Priority
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE employment_status_enum   AS ENUM ('active', 'inactive', 'on_probation', 'terminated', 'resigned');
CREATE TYPE job_level_enum           AS ENUM ('intern', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'c_level');
CREATE TYPE leave_type_enum          AS ENUM ('annual', 'sick', 'maternity', 'paternity', 'unpaid', 'emergency', 'marriage');
CREATE TYPE leave_status_enum        AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE attendance_status_enum   AS ENUM ('present', 'late', 'wfh', 'absent', 'on_leave', 'holiday');
CREATE TYPE payroll_status_enum      AS ENUM ('draft', 'approved', 'paid', 'cancelled');
CREATE TYPE review_type_enum         AS ENUM ('quarterly', 'mid_year', 'annual', 'probation_end', 'ad_hoc');
CREATE TYPE review_status_enum       AS ENUM ('draft', 'submitted', 'acknowledged', 'finalized');
CREATE TYPE user_role_enum           AS ENUM ('super_admin', 'hr_admin', 'manager', 'employee');
CREATE TYPE dept_name_enum           AS ENUM (
    'engineering', 'product', 'design', 'marketing',
    'sales', 'finance', 'hr', 'legal', 'operations', 'customer_support'
);


-- ============================================================
-- TABLE: departments
-- Menyimpan data departemen perusahaan.
-- manager_id nullable untuk menghindari circular dependency
-- saat insert awal (karyawan belum ada saat dept dibuat).
-- ============================================================
CREATE TABLE departments (
    dept_id       SERIAL        PRIMARY KEY,
    dept_name     dept_name_enum NOT NULL,
    description   TEXT,
    manager_id    INT           NULL,         -- FK ke employees, diisi setelah karyawan ada
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_dept_name UNIQUE (dept_name)
);


-- ============================================================
-- TABLE: positions
-- Menyimpan definisi jabatan/posisi.
-- base_salary di sini adalah REFERENSI gaji standar posisi,
-- gaji aktual karyawan disimpan di tabel employees.salary.
-- ============================================================
CREATE TABLE positions (
    pos_id            SERIAL         PRIMARY KEY,
    title             VARCHAR(100)   NOT NULL,
    job_level         job_level_enum NOT NULL,
    base_salary_ref   NUMERIC(15,2)  NOT NULL CHECK (base_salary_ref >= 0),
    description       TEXT,
    created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_position_title_level UNIQUE (title, job_level)
);


-- ============================================================
-- TABLE: employees
-- Tabel utama data karyawan.
-- deleted_at digunakan untuk soft delete:
--   NULL  = karyawan aktif
--   value = karyawan sudah nonaktif/resign (data tetap tersimpan)
-- ============================================================
CREATE TABLE employees (
    emp_id              SERIAL               PRIMARY KEY,
    dept_id             INT                  NOT NULL REFERENCES departments(dept_id),
    pos_id              INT                  NOT NULL REFERENCES positions(pos_id),
    first_name          VARCHAR(100)         NOT NULL,
    last_name           VARCHAR(100)         NOT NULL,
    email               VARCHAR(255)         NOT NULL,
    phone_number        VARCHAR(20),
    hire_date           DATE                 NOT NULL,
    employment_status   employment_status_enum NOT NULL DEFAULT 'on_probation',
    salary              NUMERIC(15,2)        NOT NULL CHECK (salary >= 0),  -- gaji aktual individu
    deleted_at          TIMESTAMPTZ          NULL,       -- NULL = aktif | value = nonaktif (soft delete)
    created_at          TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ          NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_employee_email UNIQUE (email)
);

-- Setelah tabel employees ada, baru bisa tambahkan FK dari departments ke employees
ALTER TABLE departments
    ADD CONSTRAINT fk_dept_manager
    FOREIGN KEY (manager_id) REFERENCES employees(emp_id)
    ON DELETE SET NULL;


-- ============================================================
-- TABLE: users
-- Untuk autentikasi dan otorisasi sistem.
-- Dipisah dari employees agar seorang karyawan bisa punya
-- akun login, tapi tidak semua karyawan harus punya akun.
-- ============================================================
CREATE TABLE users (
    user_id       SERIAL         PRIMARY KEY,
    emp_id        INT            NOT NULL REFERENCES employees(emp_id) ON DELETE CASCADE,
    username      VARCHAR(100)   NOT NULL,
    password_hash VARCHAR(255)   NOT NULL,     -- simpan hash, JANGAN plain text
    role          user_role_enum NOT NULL DEFAULT 'employee',
    is_active     BOOLEAN        NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ    NULL,
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_username UNIQUE (username),
    CONSTRAINT uq_user_emp UNIQUE (emp_id)     -- 1 karyawan maksimal 1 akun
);


-- ============================================================
-- TABLE: leave_policies
-- Mendefinisikan jenis cuti dan berapa hari kuota per tahun.
-- Dipisah dari leave_requests agar kebijakan cuti bisa
-- berubah tanpa merusak data historis pengajuan.
-- ============================================================
CREATE TABLE leave_policies (
    policy_id         SERIAL         PRIMARY KEY,
    leave_type        leave_type_enum NOT NULL,
    max_days_per_year INT            NOT NULL CHECK (max_days_per_year > 0),
    is_carry_over     BOOLEAN        NOT NULL DEFAULT FALSE,  -- boleh dibawa ke tahun depan?
    description       TEXT,
    created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_leave_type UNIQUE (leave_type)
);


-- ============================================================
-- TABLE: leave_requests
-- Menyimpan pengajuan cuti karyawan.
-- Sisa cuti TIDAK disimpan sebagai kolom statis,
-- melainkan dihitung dari history: kuota - SUM(hari approved).
-- ============================================================
CREATE TABLE leave_requests (
    leave_id      SERIAL           PRIMARY KEY,
    emp_id        INT              NOT NULL REFERENCES employees(emp_id),
    policy_id     INT              NOT NULL REFERENCES leave_policies(policy_id),
    leave_start   DATE             NOT NULL,
    leave_end     DATE             NOT NULL,
    total_days    INT              NOT NULL CHECK (total_days > 0),
    reason        TEXT,
    status        leave_status_enum NOT NULL DEFAULT 'pending',
    approved_by   INT              NULL REFERENCES employees(emp_id),  -- NULL jika belum diproses
    approved_at   TIMESTAMPTZ      NULL,
    created_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

    -- Validasi: tanggal akhir harus >= tanggal mulai
    CONSTRAINT chk_leave_dates CHECK (leave_end >= leave_start)
);


-- ============================================================
-- TABLE: attendances
-- Mencatat absensi harian karyawan.
-- total_hours adalah kolom GENERATED (otomatis dihitung DB),
-- tidak perlu diisi manual → tidak ada risiko data tidak konsisten.
-- overtime_hours: jam kerja melebihi jam normal (default 8 jam).
-- ============================================================
CREATE TABLE attendances (
    attendance_id   SERIAL              PRIMARY KEY,
    emp_id          INT                 NOT NULL REFERENCES employees(emp_id),
    clock_date      DATE                NOT NULL,
    clock_in        TIMESTAMPTZ         NULL,
    clock_out       TIMESTAMPTZ         NULL,
    status          attendance_status_enum NOT NULL DEFAULT 'present',
    notes           TEXT,                             -- catatan (misal: izin terlambat, alasan WFH)

    -- GENERATED COLUMN: otomatis dihitung, tidak bisa diisi manual
    total_hours     NUMERIC(5,2) GENERATED ALWAYS AS (
                        CASE
                            WHEN clock_out IS NOT NULL AND clock_in IS NOT NULL
                            THEN ROUND(EXTRACT(EPOCH FROM (clock_out - clock_in)) / 3600.0, 2)
                            ELSE NULL
                        END
                    ) STORED,

    -- Overtime: jam di atas 8 jam kerja normal, minimal 0
    overtime_hours  NUMERIC(4,2) GENERATED ALWAYS AS (
                        CASE
                            WHEN clock_out IS NOT NULL AND clock_in IS NOT NULL
                            THEN GREATEST(
                                ROUND(EXTRACT(EPOCH FROM (clock_out - clock_in)) / 3600.0, 2) - 8,
                                0
                            )
                            ELSE 0
                        END
                    ) STORED,

    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    -- Validasi: 1 karyawan hanya boleh 1 record per hari
    CONSTRAINT uq_attendance_per_day UNIQUE (emp_id, clock_date),
    -- Validasi: clock_out harus setelah clock_in
    CONSTRAINT chk_clock_order CHECK (clock_out IS NULL OR clock_in IS NULL OR clock_out > clock_in)
);


-- ============================================================
-- TABLE: payrolls
-- Mencatat pembayaran gaji per periode.
-- net_pay adalah GENERATED COLUMN untuk menghindari
-- inkonsistensi: nilainya selalu akurat berdasarkan komponen lain.
-- ============================================================
CREATE TABLE payrolls (
    payroll_id        SERIAL            PRIMARY KEY,
    emp_id            INT               NOT NULL REFERENCES employees(emp_id),
    pay_period_start  DATE              NOT NULL,
    pay_period_end    DATE              NOT NULL,
    base_salary       NUMERIC(15,2)     NOT NULL CHECK (base_salary >= 0),
    bonus_amount      NUMERIC(15,2)     NOT NULL DEFAULT 0 CHECK (bonus_amount >= 0),
    deductions        NUMERIC(15,2)     NOT NULL DEFAULT 0 CHECK (deductions >= 0),  -- pajak, BPJS, dll
    overtime_pay      NUMERIC(15,2)     NOT NULL DEFAULT 0 CHECK (overtime_pay >= 0),
    notes             TEXT,

    -- GENERATED COLUMN: net_pay = base_salary + bonus + overtime - deductions
    net_pay           NUMERIC(15,2) GENERATED ALWAYS AS (
                          base_salary + bonus_amount + overtime_pay - deductions
                      ) STORED,

    status            payroll_status_enum NOT NULL DEFAULT 'draft',
    approved_by       INT               NULL REFERENCES employees(emp_id),
    approved_at       TIMESTAMPTZ       NULL,
    paid_at           TIMESTAMPTZ       NULL,
    created_at        TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

    -- Validasi: 1 karyawan hanya boleh 1 record per periode gaji
    CONSTRAINT uq_payroll_period UNIQUE (emp_id, pay_period_start, pay_period_end),
    -- Validasi: tanggal periode harus logis
    CONSTRAINT chk_payroll_period CHECK (pay_period_end >= pay_period_start)
);


-- ============================================================
-- TABLE: performance_reviews
-- Menyimpan hasil evaluasi kinerja karyawan.
-- review_period: format 'YYYY-Q1', 'YYYY-H1', 'YYYY-ANNUAL'
-- ============================================================
CREATE TABLE performance_reviews (
    review_id           SERIAL             PRIMARY KEY,
    emp_id              INT                NOT NULL REFERENCES employees(emp_id),
    reviewer_id         INT                NOT NULL REFERENCES employees(emp_id),
    review_type         review_type_enum   NOT NULL,
    review_period       VARCHAR(20)        NOT NULL,  -- contoh: '2024-Q1', '2024-ANNUAL'
    review_date         DATE               NOT NULL,
    score               NUMERIC(4,2)       NOT NULL,
    feedback_comments   TEXT,
    goals_next_period   TEXT,              -- target/goals untuk periode berikutnya
    status              review_status_enum NOT NULL DEFAULT 'draft',
    acknowledged_at     TIMESTAMPTZ        NULL,      -- kapan karyawan baca & acknowledge review
    created_at          TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

    -- Validasi: skor harus antara 1 dan 10
    CONSTRAINT chk_score_range CHECK (score BETWEEN 1 AND 10),
    -- Validasi: karyawan tidak bisa mereview dirinya sendiri
    CONSTRAINT chk_self_review CHECK (emp_id <> reviewer_id),
    -- Validasi: 1 review per karyawan per periode per tipe
    CONSTRAINT uq_review_per_period UNIQUE (emp_id, review_type, review_period)
);


-- ============================================================
-- TABLE: projects (opsional, prioritas rendah)
-- ============================================================
CREATE TABLE projects (
    project_id    SERIAL        PRIMARY KEY,
    project_name  VARCHAR(200)  NOT NULL,
    description   TEXT,
    start_date    DATE          NOT NULL,
    end_date      DATE          NULL,
    budget        NUMERIC(18,2) NULL CHECK (budget >= 0),
    status        VARCHAR(50)   NOT NULL DEFAULT 'active',
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_project_dates CHECK (end_date IS NULL OR end_date >= start_date)
);


-- ============================================================
-- TABLE: project_assignments (opsional, prioritas rendah)
-- ============================================================
CREATE TABLE project_assignments (
    assignment_id    SERIAL        PRIMARY KEY,
    project_id       INT           NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    emp_id           INT           NOT NULL REFERENCES employees(emp_id),
    role             VARCHAR(100)  NOT NULL,
    hours_allocated  NUMERIC(6,2)  NULL CHECK (hours_allocated >= 0),
    start_date       DATE          NOT NULL,
    end_date         DATE          NULL,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_assignment UNIQUE (project_id, emp_id),
    CONSTRAINT chk_assignment_dates CHECK (end_date IS NULL OR end_date >= start_date)
);


-- ============================================================
-- INDEXES
-- Mempercepat query JOIN dan WHERE yang paling sering digunakan.
-- Bayangkan index seperti daftar isi buku — tanpa daftar isi,
-- DB harus membaca semua halaman untuk cari 1 data.
-- ============================================================

-- employees
CREATE INDEX idx_employees_dept_id          ON employees(dept_id);
CREATE INDEX idx_employees_pos_id           ON employees(pos_id);
CREATE INDEX idx_employees_employment_status ON employees(employment_status);
CREATE INDEX idx_employees_deleted_at       ON employees(deleted_at) WHERE deleted_at IS NULL;

-- users
CREATE INDEX idx_users_emp_id               ON users(emp_id);
CREATE INDEX idx_users_role                 ON users(role);

-- leave_requests
CREATE INDEX idx_leave_requests_emp_id      ON leave_requests(emp_id);
CREATE INDEX idx_leave_requests_policy_id   ON leave_requests(policy_id);
CREATE INDEX idx_leave_requests_status      ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates       ON leave_requests(leave_start, leave_end);

-- attendances
CREATE INDEX idx_attendances_emp_id         ON attendances(emp_id);
CREATE INDEX idx_attendances_clock_date     ON attendances(clock_date);
CREATE INDEX idx_attendances_status         ON attendances(status);

-- payrolls
CREATE INDEX idx_payrolls_emp_id            ON payrolls(emp_id);
CREATE INDEX idx_payrolls_status            ON payrolls(status);
CREATE INDEX idx_payrolls_period            ON payrolls(pay_period_start, pay_period_end);

-- performance_reviews
CREATE INDEX idx_perf_reviews_emp_id        ON performance_reviews(emp_id);
CREATE INDEX idx_perf_reviews_reviewer_id   ON performance_reviews(reviewer_id);
CREATE INDEX idx_perf_reviews_status        ON performance_reviews(status);

-- departments
CREATE INDEX idx_departments_manager_id     ON departments(manager_id);

-- project_assignments
CREATE INDEX idx_proj_assign_emp_id         ON project_assignments(emp_id);
CREATE INDEX idx_proj_assign_project_id     ON project_assignments(project_id);


-- ============================================================
-- FUNCTION: auto-update updated_at timestamp
-- Fungsi ini dipanggil otomatis setiap kali ada UPDATE,
-- sehingga kolom updated_at selalu akurat tanpa kode manual.
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- TRIGGERS: pasang fungsi auto-update ke semua tabel
-- ============================================================
CREATE TRIGGER trg_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_positions_updated_at
    BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_leave_policies_updated_at
    BEFORE UPDATE ON leave_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_leave_requests_updated_at
    BEFORE UPDATE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_attendances_updated_at
    BEFORE UPDATE ON attendances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_payrolls_updated_at
    BEFORE UPDATE ON payrolls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_performance_reviews_updated_at
    BEFORE UPDATE ON performance_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_project_assignments_updated_at
    BEFORE UPDATE ON project_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- USEFUL VIEWS (bonus)
-- View adalah "query tersimpan" — seperti shortcut Excel.
-- ============================================================

-- View: ringkasan karyawan aktif dengan nama departemen & posisi
CREATE VIEW v_active_employees AS
SELECT
    e.emp_id,
    e.first_name || ' ' || e.last_name AS full_name,
    e.email,
    d.dept_name,
    p.title            AS position_title,
    p.job_level,
    e.employment_status,
    e.hire_date,
    e.salary
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id
JOIN positions   p ON e.pos_id  = p.pos_id
WHERE e.deleted_at IS NULL;  -- hanya karyawan aktif


-- View: hitung sisa cuti per karyawan per jenis (dari history)
CREATE VIEW v_leave_balance AS
SELECT
    e.emp_id,
    e.first_name || ' ' || e.last_name AS full_name,
    lp.leave_type,
    lp.max_days_per_year                                         AS total_quota,
    COALESCE(SUM(
        CASE WHEN lr.status = 'approved'
             AND EXTRACT(YEAR FROM lr.leave_start) = EXTRACT(YEAR FROM NOW())
             THEN lr.total_days ELSE 0 END
    ), 0)                                                        AS used_days,
    lp.max_days_per_year - COALESCE(SUM(
        CASE WHEN lr.status = 'approved'
             AND EXTRACT(YEAR FROM lr.leave_start) = EXTRACT(YEAR FROM NOW())
             THEN lr.total_days ELSE 0 END
    ), 0)                                                        AS remaining_days
FROM employees e
CROSS JOIN leave_policies lp
LEFT JOIN leave_requests lr
    ON lr.emp_id = e.emp_id AND lr.policy_id = lp.policy_id
WHERE e.deleted_at IS NULL
GROUP BY e.emp_id, e.first_name, e.last_name, lp.leave_type, lp.max_days_per_year;


-- View: ringkasan payroll bulan ini
CREATE VIEW v_payroll_summary AS
SELECT
    p.payroll_id,
    e.first_name || ' ' || e.last_name AS full_name,
    d.dept_name,
    p.pay_period_start,
    p.pay_period_end,
    p.base_salary,
    p.bonus_amount,
    p.overtime_pay,
    p.deductions,
    p.net_pay,
    p.status            AS payroll_status
FROM payrolls p
JOIN employees    e ON p.emp_id  = e.emp_id
JOIN departments  d ON e.dept_id = d.dept_id;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
