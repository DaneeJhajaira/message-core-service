import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConversationLastMessageFields1743378600000
  implements MigrationInterface
{
  name = 'AddConversationLastMessageFields1743378600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "conversations" ADD "last_message_id" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" ADD "last_message_preview" character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" ADD "last_message_type" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" ADD "last_message_direction" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" ADD "unread_count" integer NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "conversations" DROP COLUMN "unread_count"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" DROP COLUMN "last_message_direction"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" DROP COLUMN "last_message_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" DROP COLUMN "last_message_preview"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" DROP COLUMN "last_message_id"`,
    );
  }
}
