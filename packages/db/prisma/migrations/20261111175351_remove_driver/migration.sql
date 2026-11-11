-- Delivery is either a carrier (carrier_id) or self pickup (carrier_id IS NULL).
ALTER TABLE "orders" DROP COLUMN "driver";
