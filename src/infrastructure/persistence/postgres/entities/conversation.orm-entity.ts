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

  @OneToMany(() => MessageOrmEntity, (message) => message.conversation)
  messages: MessageOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
