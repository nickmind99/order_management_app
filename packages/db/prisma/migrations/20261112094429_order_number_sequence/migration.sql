-- New orders get numbers FR001700, FR001701, ... from a sequence. It starts above the seeded numbers (max FR001681).
CREATE SEQUENCE "order_number_seq" START 1700;

ALTER TABLE "orders" ALTER COLUMN "number" SET DEFAULT ('FR'::text || lpad((nextval('order_number_seq'::regclass))::text, 6, '0'::text));
