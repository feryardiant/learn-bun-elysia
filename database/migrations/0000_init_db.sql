CREATE TABLE "comments" (
	"id" varchar PRIMARY KEY NOT NULL,
	"post_id" varchar NOT NULL,
	"content" text NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" varchar PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" varchar PRIMARY KEY NOT NULL,
	"account_id" varchar NOT NULL,
	"provider_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"access_token" varchar,
	"access_token_expires_at" timestamp,
	"refresh_token" varchar,
	"refresh_token_expires_at" timestamp,
	"id_token" varchar,
	"scope" varchar,
	"password" varchar,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token" varchar NOT NULL,
	"user_agent" varchar,
	"ip_address" varchar,
	"revoked" boolean DEFAULT false NOT NULL,
	"revoked_at" timestamp with time zone,
	"revoked_reason" varchar,
	"expires_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"handle" varchar,
	"email" varchar NOT NULL,
	"email_verified" boolean NOT NULL,
	"is_anonymous" boolean,
	"image" varchar,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" varchar PRIMARY KEY NOT NULL,
	"identifier" varchar NOT NULL,
	"value" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comment_post_id_idx" ON "comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "comment_created_at_idx" ON "comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "post_created_at_idx" ON "posts" USING btree ("created_at");