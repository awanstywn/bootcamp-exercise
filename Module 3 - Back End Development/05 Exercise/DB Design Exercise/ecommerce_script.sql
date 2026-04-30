-- ============================================================
-- E-COMMERCE MARKETPLACE SCHEMA - PostgreSQL
-- Model: Multi-seller (Shopee/Tokopedia style)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role_enum         AS ENUM ('buyer', 'seller', 'admin', 'super_admin');
CREATE TYPE order_status_enum      AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status_enum    AS ENUM ('pending', 'paid', 'failed', 'refunded', 'expired');
CREATE TYPE payment_method_enum    AS ENUM ('bank_transfer', 'credit_card', 'e_wallet', 'cod', 'virtual_account', 'qris');
CREATE TYPE payment_gateway_enum   AS ENUM ('midtrans', 'xendit', 'doku', 'manual', 'cod');
CREATE TYPE shipping_status_enum   AS ENUM ('preparing', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'failed');
CREATE TYPE voucher_type_enum      AS ENUM ('percentage', 'fixed_amount', 'free_shipping');
CREATE TYPE voucher_scope_enum     AS ENUM ('platform', 'store', 'product');
CREATE TYPE store_status_enum      AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');


-- ============================================================
-- TABLE: users
-- Satu akun bisa jadi buyer DAN seller sekaligus (seperti Shopee).
-- Role dikelola di tabel user_roles, bukan boolean flag.
-- ============================================================
CREATE TABLE users (
    user_id       SERIAL        PRIMARY KEY,
    full_name     VARCHAR(150)  NOT NULL,
    email         VARCHAR(255)  NOT NULL,
    phone_number  VARCHAR(20)   NULL,
    password_hash VARCHAR(255)  NOT NULL,
    avatar_url    TEXT          NULL,
    is_verified   BOOLEAN       NOT NULL DEFAULT FALSE,
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ   NULL,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_email UNIQUE (email)
);

-- ============================================================
-- TABLE: user_roles
-- Mengelola multi-role per user.
-- Analogi: satu orang bisa pegang kartu member "pembeli"
-- sekaligus kartu "penjual" di mall yang sama.
-- ============================================================
CREATE TABLE user_roles (
    role_id    SERIAL         PRIMARY KEY,
    user_id    INT            NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role       user_role_enum NOT NULL,
    granted_at TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_user_role UNIQUE (user_id, role)
);

-- ============================================================
-- TABLE: addresses
-- Satu user bisa punya banyak alamat (rumah, kantor, dll).
-- is_default: alamat yang dipilih otomatis saat checkout.
-- ============================================================
CREATE TABLE addresses (
    address_id    SERIAL       PRIMARY KEY,
    user_id       INT          NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    label         VARCHAR(50)  NOT NULL DEFAULT 'Rumah',  -- contoh: "Rumah", "Kantor"
    recipient_name VARCHAR(150) NOT NULL,
    phone_number  VARCHAR(20)  NOT NULL,
    street        TEXT         NOT NULL,
    city          VARCHAR(100) NOT NULL,
    province      VARCHAR(100) NOT NULL,
    postal_code   VARCHAR(10)  NOT NULL,
    country       VARCHAR(100) NOT NULL DEFAULT 'Indonesia',
    is_default    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: stores
-- Setiap seller memiliki tepat 1 toko (seperti Shopee).
-- owner_id FK ke users — pemilik toko adalah user biasa,
-- BUKAN admin platform. Admin platform = role terpisah.
-- ============================================================
CREATE TABLE stores (
    store_id      SERIAL            PRIMARY KEY,
    owner_id      INT               NOT NULL REFERENCES users(user_id),
    store_name    VARCHAR(200)      NOT NULL,
    store_slug    VARCHAR(200)      NOT NULL,   -- URL-friendly name: "toko-baju-murah"
    description   TEXT              NULL,
    logo_url      TEXT              NULL,
    store_region  VARCHAR(100)      NULL,
    status        store_status_enum NOT NULL DEFAULT 'pending_verification',
    created_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_store_owner  UNIQUE (owner_id),    -- 1 user = 1 toko
    CONSTRAINT uq_store_slug   UNIQUE (store_slug)
);

-- ============================================================
-- TABLE: warehouses
-- Gudang milik toko. 1 toko bisa punya banyak gudang.
-- ============================================================
CREATE TABLE warehouses (
    warehouse_id      SERIAL       PRIMARY KEY,
    store_id          INT          NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
    warehouse_name    VARCHAR(200) NOT NULL,
    warehouse_address TEXT         NOT NULL,
    city              VARCHAR(100) NOT NULL,
    is_primary        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: categories
-- Hierarki kategori: parent_id NULL = kategori utama.
-- parent_id berisi nilai = subkategori.
-- Contoh: "Elektronik" (parent) → "Smartphone" (child)
-- ============================================================
CREATE TABLE categories (
    category_id   SERIAL       PRIMARY KEY,
    parent_id     INT          NULL REFERENCES categories(category_id),
    name          VARCHAR(100) NOT NULL,
    slug          VARCHAR(100) NOT NULL,
    description   TEXT         NULL,
    image_url     TEXT         NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_category_slug UNIQUE (slug)
);

-- ============================================================
-- TABLE: products
-- Produk milik toko tertentu (store_id).
-- Stok dikelola di tabel product_stocks (per gudang).
-- ============================================================
CREATE TABLE products (
    product_id    SERIAL        PRIMARY KEY,
    store_id      INT           NOT NULL REFERENCES stores(store_id),
    category_id   INT           NOT NULL REFERENCES categories(category_id),
    name          VARCHAR(255)  NOT NULL,
    description   TEXT          NULL,
    price         NUMERIC(15,2) NOT NULL CHECK (price > 0),
    weight_gram   INT           NULL CHECK (weight_gram > 0),  -- untuk kalkulasi ongkir
    image_url     TEXT          NULL,
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: product_stocks
-- Stok per produk per gudang.
-- Dipisah dari products untuk support multi-gudang.
-- Analogi: satu SKU bisa tersedia di gudang Jakarta DAN Surabaya.
-- ============================================================
CREATE TABLE product_stocks (
    stock_id      SERIAL  PRIMARY KEY,
    product_id    INT     NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    warehouse_id  INT     NOT NULL REFERENCES warehouses(warehouse_id),
    quantity      INT     NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_product_warehouse UNIQUE (product_id, warehouse_id)
);

-- ============================================================
-- TABLE: vouchers
-- Voucher diskon dari platform atau dari toko.
-- scope: platform = berlaku semua toko | store = toko tertentu
-- ============================================================
CREATE TABLE vouchers (
    voucher_id      SERIAL             PRIMARY KEY,
    store_id        INT                NULL REFERENCES stores(store_id),  -- NULL = voucher platform
    code            VARCHAR(50)        NOT NULL,
    voucher_type    voucher_type_enum  NOT NULL,
    scope           voucher_scope_enum NOT NULL DEFAULT 'platform',
    discount_value  NUMERIC(15,2)      NOT NULL CHECK (discount_value > 0),
    min_purchase    NUMERIC(15,2)      NOT NULL DEFAULT 0,
    max_discount    NUMERIC(15,2)      NULL,     -- cap diskon untuk tipe percentage
    quota           INT                NOT NULL DEFAULT 1,
    used_count      INT                NOT NULL DEFAULT 0,
    valid_from      TIMESTAMPTZ        NOT NULL,
    valid_until     TIMESTAMPTZ        NOT NULL,
    is_active       BOOLEAN            NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_voucher_code   UNIQUE (code),
    CONSTRAINT chk_voucher_dates CHECK (valid_until > valid_from),
    CONSTRAINT chk_used_quota    CHECK (used_count <= quota)
);

-- ============================================================
-- TABLE: carts
-- Keranjang belanja. Satu baris = satu produk dalam keranjang.
-- Saat checkout, data di sini dipindahkan ke orders + order_items.
-- ============================================================
CREATE TABLE carts (
    cart_id     SERIAL  PRIMARY KEY,
    user_id     INT     NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    product_id  INT     NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    quantity    INT     NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_cart_item UNIQUE (user_id, product_id)
);

-- ============================================================
-- TABLE: orders
-- Satu order bisa berisi produk dari SATU toko (seperti Shopee).
-- Jika user beli dari 2 toko, tercipta 2 order terpisah.
-- ============================================================
CREATE TABLE orders (
    order_id            SERIAL            PRIMARY KEY,
    user_id             INT               NOT NULL REFERENCES users(user_id),
    store_id            INT               NOT NULL REFERENCES stores(store_id),
    shipping_address_id INT               NOT NULL REFERENCES addresses(address_id),
    voucher_id          INT               NULL REFERENCES vouchers(voucher_id),
    order_date          TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    status              order_status_enum NOT NULL DEFAULT 'pending',
    subtotal            NUMERIC(15,2)     NOT NULL CHECK (subtotal >= 0),
    shipping_cost       NUMERIC(15,2)     NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
    discount_amount     NUMERIC(15,2)     NOT NULL DEFAULT 0,
    total_amount        NUMERIC(15,2)     NOT NULL CHECK (total_amount >= 0),
    notes               TEXT              NULL,
    created_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_total_amount CHECK (
        total_amount = subtotal + shipping_cost - discount_amount
    )
);

-- ============================================================
-- TABLE: order_items
-- Detail produk dalam satu order.
-- price_at_order: harga produk SAAT pembelian (snapshot).
-- Penting: harga produk bisa berubah, tapi history harus tetap.
-- ============================================================
CREATE TABLE order_items (
    item_id        SERIAL        PRIMARY KEY,
    order_id       INT           NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id     INT           NOT NULL REFERENCES products(product_id),
    product_name   VARCHAR(255)  NOT NULL,   -- snapshot nama produk
    quantity       INT           NOT NULL CHECK (quantity > 0),
    price_at_order NUMERIC(15,2) NOT NULL CHECK (price_at_order > 0),
    subtotal       NUMERIC(15,2) GENERATED ALWAYS AS (quantity * price_at_order) STORED,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: payments
-- Satu order memiliki satu record pembayaran.
-- transaction_ref: ID dari payment gateway eksternal (Midtrans, dll)
-- expired_at: batas waktu bayar (misal 24 jam untuk transfer bank)
-- ============================================================
CREATE TABLE payments (
    payment_id      SERIAL               PRIMARY KEY,
    order_id        INT                  NOT NULL REFERENCES orders(order_id),
    amount          NUMERIC(15,2)        NOT NULL CHECK (amount > 0),
    method          payment_method_enum  NOT NULL,
    gateway         payment_gateway_enum NOT NULL,
    transaction_ref VARCHAR(255)         NULL,    -- ID dari Midtrans/Xendit
    status          payment_status_enum  NOT NULL DEFAULT 'pending',
    paid_at         TIMESTAMPTZ          NULL,
    expired_at      TIMESTAMPTZ          NULL,
    created_at      TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ          NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_payment_order    UNIQUE (order_id),          -- 1 order = 1 payment
    CONSTRAINT uq_transaction_ref  UNIQUE (transaction_ref)    -- ID gateway harus unik
);

-- ============================================================
-- TABLE: shipping
-- Informasi pengiriman per order.
-- address_id: alamat tujuan pengiriman (snapshot dari addresses).
-- ============================================================
CREATE TABLE shipping (
    shipping_id      SERIAL               PRIMARY KEY,
    order_id         INT                  NOT NULL REFERENCES orders(order_id),
    address_id       INT                  NOT NULL REFERENCES addresses(address_id),
    courier          VARCHAR(100)         NOT NULL,   -- JNE, JT, SiCepat, dll
    courier_service  VARCHAR(100)         NOT NULL,   -- REG, YES, OKE, dll
    tracking_number  VARCHAR(100)         NULL,
    status           shipping_status_enum NOT NULL DEFAULT 'preparing',
    shipping_cost    NUMERIC(15,2)        NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
    estimated_days   INT                  NULL CHECK (estimated_days > 0),
    shipped_at       TIMESTAMPTZ          NULL,
    delivered_at     TIMESTAMPTZ          NULL,
    created_at       TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ          NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_shipping_order UNIQUE (order_id)
);

-- ============================================================
-- TABLE: reviews
-- User hanya bisa review produk yang sudah dibeli (order_id FK).
-- is_verified: TRUE jika order sudah delivered (beli terbukti).
-- seller_reply: toko bisa balas ulasan pembeli.
-- ============================================================
CREATE TABLE reviews (
    review_id     SERIAL        PRIMARY KEY,
    user_id       INT           NOT NULL REFERENCES users(user_id),
    product_id    INT           NOT NULL REFERENCES products(product_id),
    order_id      INT           NOT NULL REFERENCES orders(order_id),
    rating        SMALLINT      NOT NULL,
    comment       TEXT          NULL,
    image_url     TEXT          NULL,
    is_verified   BOOLEAN       NOT NULL DEFAULT FALSE,
    seller_reply  TEXT          NULL,
    replied_at    TIMESTAMPTZ   NULL,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    -- 1 user hanya bisa review 1 produk per order
    CONSTRAINT uq_review_per_order UNIQUE (user_id, product_id, order_id),
    CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5)
);


-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_users_email              ON users(email);
CREATE INDEX idx_users_is_active          ON users(is_active);
CREATE INDEX idx_user_roles_user_id       ON user_roles(user_id);
CREATE INDEX idx_addresses_user_id        ON addresses(user_id);
CREATE INDEX idx_stores_owner_id          ON stores(owner_id);
CREATE INDEX idx_stores_status            ON stores(status);
CREATE INDEX idx_warehouses_store_id      ON warehouses(store_id);
CREATE INDEX idx_products_store_id        ON products(store_id);
CREATE INDEX idx_products_category_id     ON products(category_id);
CREATE INDEX idx_products_is_active       ON products(is_active);
CREATE INDEX idx_product_stocks_product   ON product_stocks(product_id);
CREATE INDEX idx_product_stocks_warehouse ON product_stocks(warehouse_id);
CREATE INDEX idx_carts_user_id            ON carts(user_id);
CREATE INDEX idx_carts_product_id         ON carts(product_id);
CREATE INDEX idx_orders_user_id           ON orders(user_id);
CREATE INDEX idx_orders_store_id          ON orders(store_id);
CREATE INDEX idx_orders_status            ON orders(status);
CREATE INDEX idx_orders_order_date        ON orders(order_date);
CREATE INDEX idx_order_items_order_id     ON order_items(order_id);
CREATE INDEX idx_order_items_product_id   ON order_items(product_id);
CREATE INDEX idx_payments_order_id        ON payments(order_id);
CREATE INDEX idx_payments_status          ON payments(status);
CREATE INDEX idx_shipping_order_id        ON shipping(order_id);
CREATE INDEX idx_reviews_product_id       ON reviews(product_id);
CREATE INDEX idx_reviews_user_id          ON reviews(user_id);
CREATE INDEX idx_vouchers_code            ON vouchers(code);
CREATE INDEX idx_vouchers_store_id        ON vouchers(store_id);


-- ============================================================
-- FUNCTION & TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at              BEFORE UPDATE ON users              FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_addresses_updated_at          BEFORE UPDATE ON addresses          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_stores_updated_at             BEFORE UPDATE ON stores             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_warehouses_updated_at         BEFORE UPDATE ON warehouses         FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_categories_updated_at         BEFORE UPDATE ON categories         FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_products_updated_at           BEFORE UPDATE ON products           FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_product_stocks_updated_at     BEFORE UPDATE ON product_stocks     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_vouchers_updated_at           BEFORE UPDATE ON vouchers           FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_carts_updated_at              BEFORE UPDATE ON carts              FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_orders_updated_at             BEFORE UPDATE ON orders             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_payments_updated_at           BEFORE UPDATE ON payments           FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_shipping_updated_at           BEFORE UPDATE ON shipping           FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_reviews_updated_at            BEFORE UPDATE ON reviews            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- USEFUL VIEWS
-- ============================================================

-- View: produk aktif lengkap dengan nama toko dan kategori
CREATE VIEW v_active_products AS
SELECT
    p.product_id,
    p.name           AS product_name,
    p.price,
    p.image_url,
    c.name           AS category_name,
    s.store_name,
    s.store_region,
    COALESCE(SUM(ps.quantity), 0) AS total_stock
FROM products p
JOIN categories    c  ON p.category_id  = c.category_id
JOIN stores        s  ON p.store_id     = s.store_id
LEFT JOIN product_stocks ps ON p.product_id = ps.product_id
WHERE p.is_active = TRUE AND s.status = 'active'
GROUP BY p.product_id, p.name, p.price, p.image_url, c.name, s.store_name, s.store_region;


-- View: ringkasan order per user (dashboard pembeli)
CREATE VIEW v_order_summary AS
SELECT
    o.order_id,
    u.full_name        AS buyer_name,
    s.store_name,
    o.order_date,
    o.status           AS order_status,
    o.total_amount,
    p.status           AS payment_status,
    sh.status          AS shipping_status,
    sh.tracking_number
FROM orders o
JOIN users    u  ON o.user_id  = u.user_id
JOIN stores   s  ON o.store_id = s.store_id
LEFT JOIN payments p  ON p.order_id  = o.order_id
LEFT JOIN shipping sh ON sh.order_id = o.order_id;


-- View: rating rata-rata per produk
CREATE VIEW v_product_ratings AS
SELECT
    p.product_id,
    p.name                          AS product_name,
    COUNT(r.review_id)              AS total_reviews,
    ROUND(AVG(r.rating)::NUMERIC, 2) AS avg_rating
FROM products p
LEFT JOIN reviews r ON r.product_id = p.product_id
GROUP BY p.product_id, p.name;


-- ============================================================
-- END OF SCHEMA
-- ============================================================
