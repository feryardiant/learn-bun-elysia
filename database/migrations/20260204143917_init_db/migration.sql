CREATE TABLE "accounts" (
	"id" varchar PRIMARY KEY,
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
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar PRIMARY KEY,
	"user_id" varchar NOT NULL,
	"token" varchar NOT NULL UNIQUE,
	"user_agent" varchar,
	"ip_address" varchar,
	"revoked" boolean DEFAULT false NOT NULL,
	"revoked_at" timestamp with time zone,
	"revoked_reason" varchar,
	"expires_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY,
	"name" varchar NOT NULL,
	"handle" varchar,
	"email" varchar NOT NULL UNIQUE,
	"email_verified" boolean NOT NULL,
	"is_anonymous" boolean,
	"image" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" varchar PRIMARY KEY,
	"identifier" varchar NOT NULL,
	"value" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" varchar PRIMARY KEY,
	"post_id" varchar NOT NULL,
	"content" text NOT NULL,
	"created_by_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" varchar PRIMARY KEY,
	"content" text NOT NULL,
	"created_by_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_access_token_idx" ON "accounts" ("access_token");--> statement-breakpoint
CREATE INDEX "account_created_at_idx" ON "accounts" ("created_at");--> statement-breakpoint
CREATE INDEX "session_token_idx" ON "sessions" ("token");--> statement-breakpoint
CREATE INDEX "session_created_at_idx" ON "sessions" ("created_at");--> statement-breakpoint
CREATE INDEX "user_handle_idx" ON "users" ("handle");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "users" ("email");--> statement-breakpoint
CREATE INDEX "user_created_at_idx" ON "users" ("created_at");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verifications" ("identifier");--> statement-breakpoint
CREATE INDEX "verification_created_at_idx" ON "verifications" ("created_at");--> statement-breakpoint
CREATE INDEX "comment_created_at_idx" ON "comments" ("created_at");--> statement-breakpoint
CREATE INDEX "post_created_at_idx" ON "posts" ("created_at");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_created_by_id_users_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_created_by_id_users_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE;