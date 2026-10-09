import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_series_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__series_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_header_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__header_v_version_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__header_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_footer_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__footer_v_version_columns_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__footer_v_version_social_links_platform" AS ENUM('instagram', 'facebook', 'x', 'youtube', 'tiktok', 'linkedin');
  CREATE TYPE "public"."enum__footer_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "_series_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_tagline" varchar,
  	"version_description" varchar,
  	"version_hero_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__series_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_header_v_version_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__header_v_version_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_reference_id" integer,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_header_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_logo_id" integer,
  	"version__status" "enum__header_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_footer_v_version_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__footer_v_version_columns_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_reference_id" integer,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__footer_v_version_social_links_platform",
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_copyright" varchar,
  	"version__status" "enum__footer_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  ALTER TABLE "series" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "header_nav_items" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "footer_columns_links" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "footer_columns" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "footer_social_links" ALTER COLUMN "platform" DROP NOT NULL;
  ALTER TABLE "footer_social_links" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "series" ADD COLUMN "_status" "enum_series_status" DEFAULT 'draft';
  ALTER TABLE "header" ADD COLUMN "_status" "enum_header_status" DEFAULT 'draft';
  ALTER TABLE "footer" ADD COLUMN "_status" "enum_footer_status" DEFAULT 'draft';
  -- Content that existed before drafts were enabled stays live.
  UPDATE "series" SET "_status" = 'published';
  UPDATE "header" SET "_status" = 'published';
  UPDATE "footer" SET "_status" = 'published';
  ALTER TABLE "_series_v" ADD CONSTRAINT "_series_v_parent_id_series_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."series"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_series_v" ADD CONSTRAINT "_series_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_header_v_version_nav_items" ADD CONSTRAINT "_header_v_version_nav_items_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_header_v_version_nav_items" ADD CONSTRAINT "_header_v_version_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_header_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_header_v" ADD CONSTRAINT "_header_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_links" ADD CONSTRAINT "_footer_v_version_columns_links_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_links" ADD CONSTRAINT "_footer_v_version_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns" ADD CONSTRAINT "_footer_v_version_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_social_links" ADD CONSTRAINT "_footer_v_version_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_series_v_parent_idx" ON "_series_v" USING btree ("parent_id");
  CREATE INDEX "_series_v_version_version_slug_idx" ON "_series_v" USING btree ("version_slug");
  CREATE INDEX "_series_v_version_version_hero_image_idx" ON "_series_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_series_v_version_version_updated_at_idx" ON "_series_v" USING btree ("version_updated_at");
  CREATE INDEX "_series_v_version_version_created_at_idx" ON "_series_v" USING btree ("version_created_at");
  CREATE INDEX "_series_v_version_version__status_idx" ON "_series_v" USING btree ("version__status");
  CREATE INDEX "_series_v_created_at_idx" ON "_series_v" USING btree ("created_at");
  CREATE INDEX "_series_v_updated_at_idx" ON "_series_v" USING btree ("updated_at");
  CREATE INDEX "_series_v_latest_idx" ON "_series_v" USING btree ("latest");
  CREATE INDEX "_series_v_autosave_idx" ON "_series_v" USING btree ("autosave");
  CREATE INDEX "_header_v_version_nav_items_order_idx" ON "_header_v_version_nav_items" USING btree ("_order");
  CREATE INDEX "_header_v_version_nav_items_parent_id_idx" ON "_header_v_version_nav_items" USING btree ("_parent_id");
  CREATE INDEX "_header_v_version_nav_items_link_link_reference_idx" ON "_header_v_version_nav_items" USING btree ("link_reference_id");
  CREATE INDEX "_header_v_version_version_logo_idx" ON "_header_v" USING btree ("version_logo_id");
  CREATE INDEX "_header_v_version_version__status_idx" ON "_header_v" USING btree ("version__status");
  CREATE INDEX "_header_v_created_at_idx" ON "_header_v" USING btree ("created_at");
  CREATE INDEX "_header_v_updated_at_idx" ON "_header_v" USING btree ("updated_at");
  CREATE INDEX "_header_v_latest_idx" ON "_header_v" USING btree ("latest");
  CREATE INDEX "_header_v_autosave_idx" ON "_header_v" USING btree ("autosave");
  CREATE INDEX "_footer_v_version_columns_links_order_idx" ON "_footer_v_version_columns_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_columns_links_parent_id_idx" ON "_footer_v_version_columns_links" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_columns_links_link_link_reference_idx" ON "_footer_v_version_columns_links" USING btree ("link_reference_id");
  CREATE INDEX "_footer_v_version_columns_order_idx" ON "_footer_v_version_columns" USING btree ("_order");
  CREATE INDEX "_footer_v_version_columns_parent_id_idx" ON "_footer_v_version_columns" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_social_links_order_idx" ON "_footer_v_version_social_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_social_links_parent_id_idx" ON "_footer_v_version_social_links" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_version__status_idx" ON "_footer_v" USING btree ("version__status");
  CREATE INDEX "_footer_v_created_at_idx" ON "_footer_v" USING btree ("created_at");
  CREATE INDEX "_footer_v_updated_at_idx" ON "_footer_v" USING btree ("updated_at");
  CREATE INDEX "_footer_v_latest_idx" ON "_footer_v" USING btree ("latest");
  CREATE INDEX "_footer_v_autosave_idx" ON "_footer_v" USING btree ("autosave");
  CREATE INDEX "series__status_idx" ON "series" USING btree ("_status");
  CREATE INDEX "header__status_idx" ON "header" USING btree ("_status");
  CREATE INDEX "footer__status_idx" ON "footer" USING btree ("_status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_series_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_header_v_version_nav_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_header_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_columns_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_social_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_series_v" CASCADE;
  DROP TABLE "_header_v_version_nav_items" CASCADE;
  DROP TABLE "_header_v" CASCADE;
  DROP TABLE "_footer_v_version_columns_links" CASCADE;
  DROP TABLE "_footer_v_version_columns" CASCADE;
  DROP TABLE "_footer_v_version_social_links" CASCADE;
  DROP TABLE "_footer_v" CASCADE;
  DROP INDEX "series__status_idx";
  DROP INDEX "header__status_idx";
  DROP INDEX "footer__status_idx";
  ALTER TABLE "series" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "header_nav_items" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "footer_columns_links" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "footer_columns" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "footer_social_links" ALTER COLUMN "platform" SET NOT NULL;
  ALTER TABLE "footer_social_links" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "series" DROP COLUMN "_status";
  ALTER TABLE "header" DROP COLUMN "_status";
  ALTER TABLE "footer" DROP COLUMN "_status";
  DROP TYPE "public"."enum_series_status";
  DROP TYPE "public"."enum__series_v_version_status";
  DROP TYPE "public"."enum_header_status";
  DROP TYPE "public"."enum__header_v_version_nav_items_link_type";
  DROP TYPE "public"."enum__header_v_version_status";
  DROP TYPE "public"."enum_footer_status";
  DROP TYPE "public"."enum__footer_v_version_columns_links_link_type";
  DROP TYPE "public"."enum__footer_v_version_social_links_platform";
  DROP TYPE "public"."enum__footer_v_version_status";`)
}
