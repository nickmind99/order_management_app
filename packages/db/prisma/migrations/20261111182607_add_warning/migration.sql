-- Warning: the order waits for an action (e.g. incomplete draft). Alert: something is wrong. NULL means none.
ALTER TABLE "orders" ADD COLUMN "warning" TEXT;
