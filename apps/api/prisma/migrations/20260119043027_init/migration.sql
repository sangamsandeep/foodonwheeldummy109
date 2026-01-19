-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PLACED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_cents" INTEGER NOT NULL,
    "cost_cents" INTEGER NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "order_number" INTEGER NOT NULL,
    "customer_phone_e164" TEXT NOT NULL,
    "consent_call" BOOLEAN NOT NULL DEFAULT false,
    "consent_sms" BOOLEAN NOT NULL DEFAULT false,
    "status" "OrderStatus" NOT NULL DEFAULT 'PLACED',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "subtotal_cents" INTEGER NOT NULL,
    "tax_cents" INTEGER NOT NULL DEFAULT 0,
    "tip_cents" INTEGER NOT NULL DEFAULT 0,
    "total_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripe_checkout_session_id" TEXT,
    "stripe_payment_intent_id" TEXT,
    "pickup_otp_hash" TEXT,
    "pickup_otp_last4" TEXT,
    "pickup_otp_expires_at" TIMESTAMP(3),
    "pickup_otp_attempts" INTEGER NOT NULL DEFAULT 0,
    "stripe_fee_cents" INTEGER,
    "comm_cost_cents" INTEGER,
    "gross_profit_cents" INTEGER,
    "net_profit_cents" INTEGER,
    "placed_at" TIMESTAMP(3),
    "ready_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "menu_item_id" TEXT NOT NULL,
    "name_snapshot" TEXT NOT NULL,
    "price_cents_snapshot" INTEGER NOT NULL,
    "cost_cents_snapshot" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "modifiers_json" TEXT,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'stripe',
    "amount_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" TEXT NOT NULL,
    "stripe_checkout_session_id" TEXT,
    "stripe_payment_intent_id" TEXT,
    "receipt_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_logs" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "to_phone_e164" TEXT NOT NULL,
    "from_phone_e164" TEXT NOT NULL,
    "twilio_call_sid" TEXT,
    "status" TEXT,
    "error_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stores_slug_key" ON "stores"("slug");

-- CreateIndex
CREATE INDEX "menu_items_store_id_is_available_idx" ON "menu_items"("store_id", "is_available");

-- CreateIndex
CREATE UNIQUE INDEX "orders_stripe_checkout_session_id_key" ON "orders"("stripe_checkout_session_id");

-- CreateIndex
CREATE INDEX "orders_store_id_status_idx" ON "orders"("store_id", "status");

-- CreateIndex
CREATE INDEX "orders_customer_phone_e164_idx" ON "orders"("customer_phone_e164");

-- CreateIndex
CREATE UNIQUE INDEX "orders_store_id_order_number_key" ON "orders"("store_id", "order_number");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "payments_order_id_idx" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "call_logs_order_id_idx" ON "call_logs"("order_id");

-- CreateIndex
CREATE INDEX "call_logs_twilio_call_sid_idx" ON "call_logs"("twilio_call_sid");

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
