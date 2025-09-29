CREATE TABLE "comments" (
	"id" varchar PRIMARY KEY NOT NULL,
	"post_id" varchar,
	"content" text,
	"created_at" bigint NOT NULL,
	"updated_at" bigint
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" varchar PRIMARY KEY NOT NULL,
	"content" text,
	"created_at" bigint NOT NULL,
	"updated_at" bigint
);
--> statement-breakpoint
CREATE INDEX "comment_post_id_idx" ON "comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "comment_created_at_idx" ON "comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "post_created_at_idx" ON "posts" USING btree ("created_at");