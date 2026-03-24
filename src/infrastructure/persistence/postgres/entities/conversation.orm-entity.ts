import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'conversations' })
export class ConversationOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'contact_id', type: 'int' })
  contactId: number;

  @Column({ name: 'external_id', type: 'varchar', length: 50, unique: true })
  externalId: string;

  @Column({ type: 'varchar', length: 30, default: 'open' })
  status: string;

  @Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
  lastMessageAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}