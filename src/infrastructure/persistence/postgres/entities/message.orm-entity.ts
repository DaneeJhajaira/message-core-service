import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContactOrmEntity } from './contact.orm-entity';
import { ConversationOrmEntity } from './conversation.orm-entity';

@Index('idx_messages_conversation_timestamp', ['conversationId', 'messageTimestamp'])
@Index('idx_messages_original_event_id', ['originalEventId'])
@Entity({ name: 'messages' })
export class MessageOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'conversation_id', type: 'int' })
  conversationId: number;

  @ManyToOne(() => ConversationOrmEntity, (conversation) => conversation.messages, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: ConversationOrmEntity;

  @Column({ name: 'contact_id', type: 'int' })
  contactId: number;

  @ManyToOne(() => ContactOrmEntity, (contact) => contact.messages, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'contact_id' })
  contact: ContactOrmEntity;

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

  @Column({ name: 'media_status', type: 'varchar', length: 50, nullable: true })
  mediaStatus: string | null;

  @Column({ name: 'media_url', type: 'text', nullable: true })
  mediaUrl: string | null;

  @Column({ name: 'media_mime_type', type: 'varchar', length: 150, nullable: true })
  mediaMimeType: string | null;

  @Column({ name: 'media_storage_bucket', type: 'varchar', length: 255, nullable: true })
  mediaStorageBucket: string | null;

  @Column({ name: 'media_storage_object_key', type: 'varchar', length: 500, nullable: true })
  mediaStorageObjectKey: string | null;

  @Column({ name: 'media_asset_id', type: 'varchar', length: 255, nullable: true })
  mediaAssetId: string | null;

  @Column({ name: 'media_error_message', type: 'text', nullable: true })
  mediaErrorMessage: string | null;

  @Column({ type: 'varchar', length: 50, default: 'received' })
  status: string;

  @Column({ name: 'message_timestamp', type: 'timestamp' })
  messageTimestamp: Date;

  @Column({ name: 'raw_payload', type: 'jsonb' })
  rawPayload: Record<string, any>;

  @Column({ name: 'original_event_id', type: 'varchar', length: 255, nullable: true })
  originalEventId: string | null;

  @Column({ name: 'provider_name', type: 'varchar', length: 50, nullable: true })
  providerName: string | null;

  @Column({ name: 'provider_phone_number_id', type: 'varchar', length: 255, nullable: true })
  providerPhoneNumberId: string | null;

  @Column({ name: 'agent_id', type: 'varchar', length: 100, nullable: true })
  agentId: string | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt: Date | null;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date | null;

  @Column({ name: 'status_error_code', type: 'int', nullable: true })
  statusErrorCode: number | null;

  @Column({ name: 'status_error_title', type: 'varchar', length: 255, nullable: true })
  statusErrorTitle: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}