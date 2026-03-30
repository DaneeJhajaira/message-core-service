import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTables1774887350573 implements MigrationInterface {
  name = 'InitTables1774887350573';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "messages" ("id" SERIAL NOT NULL, "conversation_id" integer NOT NULL, "contact_id" integer NOT NULL, "message_id" character varying(255) NOT NULL, "direction" character varying(20) NOT NULL, "message_type" character varying(50) NOT NULL, "body" text, "provider_media_id" character varying(255), "media_status" character varying(50), "media_url" text, "media_mime_type" character varying(150), "media_storage_bucket" character varying(255), "media_storage_object_key" character varying(500), "media_asset_id" character varying(255), "media_error_message" text, "status" character varying(50) NOT NULL DEFAULT 'received', "message_timestamp" TIMESTAMP NOT NULL, "raw_payload" jsonb NOT NULL, "original_event_id" character varying(255), "provider_name" character varying(50), "provider_phone_number_id" character varying(255), "agent_id" character varying(100), "error_message" text, "delivered_at" TIMESTAMP, "read_at" TIMESTAMP, "status_error_code" integer, "status_error_title" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6187089f850b8deeca0232cfeba" UNIQUE ("message_id"), CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_messages_original_event_id" ON "messages" ("original_event_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_messages_conversation_timestamp" ON "messages" ("conversation_id", "message_timestamp") `,
    );
    await queryRunner.query(
      `CREATE TABLE "conversations" ("id" SERIAL NOT NULL, "contact_id" integer NOT NULL, "external_id" character varying(50) NOT NULL, "status" character varying(30) NOT NULL DEFAULT 'open', "last_message_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4167283ce8128318d75e167d3b0" UNIQUE ("external_id"), CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_conversations_last_message_at" ON "conversations" ("last_message_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "contacts" ("id" SERIAL NOT NULL, "wa_id" character varying(30) NOT NULL, "phone" character varying(30) NOT NULL, "name" character varying(255), "last_message_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_452c624ef116a33bdcdb3263055" UNIQUE ("wa_id"), CONSTRAINT "PK_b99cd40cfd66a99f1571f4f72e6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_3bc55a7c3f9ed54b520bb5cfe23" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_d109211ed510ef10617c5e75927" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" ADD CONSTRAINT "FK_3e605129623b629ddd0583740db" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "conversations" DROP CONSTRAINT "FK_3e605129623b629ddd0583740db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_d109211ed510ef10617c5e75927"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_3bc55a7c3f9ed54b520bb5cfe23"`,
    );
    await queryRunner.query(`DROP TABLE "contacts"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_conversations_last_message_at"`,
    );
    await queryRunner.query(`DROP TABLE "conversations"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_messages_conversation_timestamp"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_messages_original_event_id"`,
    );
    await queryRunner.query(`DROP TABLE "messages"`);
  }
}
