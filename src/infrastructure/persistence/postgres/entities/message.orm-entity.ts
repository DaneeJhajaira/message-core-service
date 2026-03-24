import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'messages' })
export class MessageOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'conversation_id', type: 'int' })
  conversationId: number;

  @Column({ name: 'contact_id', type: 'int' })
  contactId: number;

  @Column({ name: 'message_id', type: 'varchar', length: 255, unique: true })
  messageId: string;

  @Column({ type: 'varchar', length: 20 })
  direction: string;

  @Column({ name: 'message_type', type: 'varchar', length: 50 })
  messageType: string;

  @Column({ type: 'text', nullable: true })
  body: string | null;

  @Column({ name: 'provider_media_id', type: 'varchar', length: 255, nullable: true })
  providerMediaId: string | null;

  @Column({ type: 'varchar', length: 50, default: 'received' })
  status: string;

  @Column({ name: 'message_timestamp', type: 'timestamp' })
  messageTimestamp: Date;

  @Column({ name: 'raw_payload', type: 'jsonb' })
  rawPayload: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}