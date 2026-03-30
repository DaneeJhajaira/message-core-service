import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContactOrmEntity } from './contact.orm-entity';
import { MessageOrmEntity } from './message.orm-entity';

@Index('idx_conversations_last_message_at', ['lastMessageAt'])
@Entity({ name: 'conversations' })
export class ConversationOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'contact_id', type: 'int' })
  contactId: number;

  @ManyToOne(() => ContactOrmEntity, (contact) => contact.conversations, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'contact_id' })
  contact: ContactOrmEntity;

  @Column({ name: 'external_id', type: 'varchar', length: 50, unique: true })
  externalId: string;

  @Column({ type: 'varchar', length: 30, default: 'open' })
  status: string;

  @Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
  lastMessageAt: Date | null;
  
  @Column({ name: 'last_message_id', type: 'varchar', length: 255, nullable: true })
  lastMessageId!: string | null;

  @Column({ name: 'last_message_preview', type: 'varchar', length: 500, nullable: true })
  lastMessagePreview!: string | null;

  @Column({ name: 'last_message_type', type: 'varchar', length: 50, nullable: true })
  lastMessageType!: string | null;

  @Column({ name: 'last_message_direction', type: 'varchar', length: 20, nullable: true })
  lastMessageDirection!: string | null;

  @Column({ name: 'unread_count', type: 'int', default: 0 })
  unreadCount!: number;

  @OneToMany(() => MessageOrmEntity, (message) => message.conversation)
  messages: MessageOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
