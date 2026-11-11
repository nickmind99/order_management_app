-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('cross_dock', 'consolidation');

-- CreateEnum
CREATE TYPE "OrderSubtype" AS ENUM ('storage', 'pickup');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('draft', 'new', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "PalletType" AS ENUM ('std', 'xl');

-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('unloading', 'disposal', 'restack', 'loading');

-- CreateEnum
CREATE TYPE "SupplyCategory" AS ENUM ('securement', 'edge_protect', 'wrap');

-- CreateTable
CREATE TABLE "hubs" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "docks" (
    "id" UUID NOT NULL,
    "hub_id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "bay" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "docks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carriers" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carriers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trucks" (
    "id" UUID NOT NULL,
    "carrier_id" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "trailer_number" TEXT NOT NULL,
    "trailer_type" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trucks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "parent_id" UUID,
    "ref_number" TEXT,
    "type" "OrderType" NOT NULL,
    "subtype" "OrderSubtype",
    "status" "OrderStatus" NOT NULL,
    "has_alert" BOOLEAN NOT NULL DEFAULT false,
    "alert_reason" TEXT,
    "next_action" TEXT,
    "hub_id" UUID NOT NULL,
    "dock_id" UUID,
    "date" TIMESTAMPTZ NOT NULL,
    "destination" TEXT,
    "customer" TEXT NOT NULL,
    "services" TEXT[],
    "carrier_id" UUID,
    "truck_id" UUID,
    "driver" TEXT,
    "pallet_type" "PalletType" NOT NULL,
    "declared_qty" INTEGER NOT NULL,
    "actual_qty" INTEGER,
    "warehouse_note" TEXT,
    "invoice_number" TEXT,
    "created_by" TEXT NOT NULL,
    "assigned_to" TEXT,
    "comments" JSONB NOT NULL DEFAULT '[]',
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "status_history" JSONB NOT NULL DEFAULT '[]',
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operations" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "type" "OperationType" NOT NULL,
    "truck_id" UUID,
    "qty" INTEGER NOT NULL,
    "pallet_type" "PalletType" NOT NULL,
    "applied_at" TIMESTAMPTZ NOT NULL,
    "price_cents" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplies" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "category" "SupplyCategory" NOT NULL,
    "qty" INTEGER NOT NULL,
    "unit_price_cents" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "docks_hub_id_number_key" ON "docks"("hub_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "orders_number_key" ON "orders"("number");

-- CreateIndex
CREATE INDEX "orders_hub_id_date_idx" ON "orders"("hub_id", "date");

-- CreateIndex
CREATE INDEX "orders_date_idx" ON "orders"("date");

-- CreateIndex
CREATE INDEX "orders_parent_id_idx" ON "orders"("parent_id");

-- CreateIndex
CREATE INDEX "operations_order_id_idx" ON "operations"("order_id");

-- CreateIndex
CREATE INDEX "supplies_order_id_idx" ON "supplies"("order_id");

-- AddForeignKey
ALTER TABLE "docks" ADD CONSTRAINT "docks_hub_id_fkey" FOREIGN KEY ("hub_id") REFERENCES "hubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trucks" ADD CONSTRAINT "trucks_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "carriers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_hub_id_fkey" FOREIGN KEY ("hub_id") REFERENCES "hubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_dock_id_fkey" FOREIGN KEY ("dock_id") REFERENCES "docks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "carriers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "trucks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "trucks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplies" ADD CONSTRAINT "supplies_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

