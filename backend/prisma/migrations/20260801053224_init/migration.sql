-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'chef', 'staff');

-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('available', 'occupied');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('open', 'all_served', 'bill_requested', 'paid', 'closed');

-- CreateEnum
CREATE TYPE "SelectionType" AS ENUM ('single', 'multiple');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('pending', 'cooking', 'serving', 'served', 'cancelled_unnotified', 'cancelled_notified');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('waiting', 'coming', 'paid');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'qr_promptpay', 'credit_card');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(64) NOT NULL,
    "password_hashed" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tables" (
    "id" SERIAL NOT NULL,
    "table_number" VARCHAR(10) NOT NULL,
    "qr_code_token" VARCHAR(100) NOT NULL,
    "status" "TableStatus" NOT NULL DEFAULT 'available',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table_sessions" (
    "id" SERIAL NOT NULL,
    "table_id" INTEGER NOT NULL,
    "session_token" VARCHAR(100) NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'open',
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "table_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "menu_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "base_price" DECIMAL(10,2) NOT NULL,
    "image_url" VARCHAR(255),
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option_groups" (
    "id" SERIAL NOT NULL,
    "menu_item_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "selection_type" "SelectionType" NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "option_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "options" (
    "id" SERIAL NOT NULL,
    "option_group_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "extra_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "menu_item_id" INTEGER NOT NULL,
    "bill_id" INTEGER,
    "menu_item_name_snapshot" VARCHAR(100) NOT NULL,
    "unit_price_snapshot" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" "OrderItemStatus" NOT NULL DEFAULT 'pending',
    "cancel_reason" VARCHAR(255),
    "special_notes" TEXT,
    "queue_position" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cooking_started_at" TIMESTAMP(3),
    "served_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "notified_by" INTEGER,
    "notified_at" TIMESTAMP(3),

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_options" (
    "id" SERIAL NOT NULL,
    "order_item_id" INTEGER NOT NULL,
    "option_id" INTEGER NOT NULL,
    "option_name_snapshot" VARCHAR(100) NOT NULL,
    "extra_price_snapshot" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "order_item_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "BillStatus" NOT NULL DEFAULT 'waiting',
    "payment_method" "PaymentMethod",
    "handled_by" INTEGER,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attended_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "tables_table_number_key" ON "tables"("table_number");

-- CreateIndex
CREATE UNIQUE INDEX "tables_qr_code_token_key" ON "tables"("qr_code_token");

-- CreateIndex
CREATE UNIQUE INDEX "table_sessions_session_token_key" ON "table_sessions"("session_token");

-- CreateIndex
CREATE INDEX "table_sessions_table_id_idx" ON "table_sessions"("table_id");

-- CreateIndex
CREATE INDEX "table_sessions_status_idx" ON "table_sessions"("status");

-- CreateIndex
CREATE INDEX "menu_items_category_id_idx" ON "menu_items"("category_id");

-- CreateIndex
CREATE INDEX "option_groups_menu_item_id_idx" ON "option_groups"("menu_item_id");

-- CreateIndex
CREATE INDEX "options_option_group_id_idx" ON "options"("option_group_id");

-- CreateIndex
CREATE INDEX "order_items_session_id_idx" ON "order_items"("session_id");

-- CreateIndex
CREATE INDEX "order_items_status_idx" ON "order_items"("status");

-- CreateIndex
CREATE INDEX "order_items_menu_item_id_idx" ON "order_items"("menu_item_id");

-- CreateIndex
CREATE INDEX "order_items_bill_id_idx" ON "order_items"("bill_id");

-- CreateIndex
CREATE INDEX "order_item_options_order_item_id_idx" ON "order_item_options"("order_item_id");

-- CreateIndex
CREATE INDEX "bills_session_id_idx" ON "bills"("session_id");

-- CreateIndex
CREATE INDEX "bills_status_idx" ON "bills"("status");

-- AddForeignKey
ALTER TABLE "table_sessions" ADD CONSTRAINT "table_sessions_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "menu_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option_groups" ADD CONSTRAINT "option_groups_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_option_group_id_fkey" FOREIGN KEY ("option_group_id") REFERENCES "option_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "table_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_notified_by_fkey" FOREIGN KEY ("notified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_options" ADD CONSTRAINT "order_item_options_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_options" ADD CONSTRAINT "order_item_options_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "table_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_handled_by_fkey" FOREIGN KEY ("handled_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
