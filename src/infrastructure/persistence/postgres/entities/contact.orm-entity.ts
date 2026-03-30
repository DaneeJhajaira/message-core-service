import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConversationOrmEntity } from './conversation.orm-entity';
import { MessageOrmEntity } from './message.orm-entity';

@Entity({ name: 'contacts' })
export class ContactOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'wa_id', type: 'varchar', length: 30, unique: true })
  waId: string;

  @Column({ type: 'varchar', length: 30 })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
  lastMessageAt: Date | null;

  @OneToMany(
    () => ConversationOrmEntity,
    (conversation) => conversation.contact,
  )
  conversations: ConversationOrmEntity[];

  @OneToMany(() => MessageOrmEntity, (message) => message.contact)
  messages: MessageOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
