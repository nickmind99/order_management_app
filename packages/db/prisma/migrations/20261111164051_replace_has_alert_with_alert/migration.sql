-- Alert is now one nullable text field: NULL means no alert.
ALTER TABLE "orders" RENAME COLUMN "alert_reason" TO "alert";
ALTER TABLE "orders" DROP COLUMN "has_alert";
