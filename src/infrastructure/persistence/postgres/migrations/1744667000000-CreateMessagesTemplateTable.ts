import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMessagesTemplateTable1744667000000
  implements MigrationInterface
{
  name = 'CreateMessagesTemplateTable1744667000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "messages_template" (
        "id" SERIAL NOT NULL,
        "message_id" integer NOT NULL,
        "name" character varying(255) NOT NULL,
        "language" character varying(10) NOT NULL,
        "header_type" character varying(20),
        "header_text" text,
        "header_media_id" character varying(255),
        "header_media_url" text,
        "header_location" jsonb,
        "body" text NOT NULL,
        "footer" text,
        "buttons" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_messages_template_message_id" UNIQUE ("message_id"),
        CONSTRAINT "PK_messages_template" PRIMARY KEY ("id"),
        CONSTRAINT "FK_messages_template_message" FOREIGN KEY ("message_id")
          REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "messages_template"`);
  }
}
