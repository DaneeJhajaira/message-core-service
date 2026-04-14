import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MessageOrmEntity } from './message.orm-entity';

@Entity({ name: 'messages_template' })
export class MessageTemplateOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'message_id', type: 'int' })
  messageId: number;

  @OneToOne(() => MessageOrmEntity, (message) => message.messageTemplate, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'message_id' })
  message: MessageOrmEntity;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 10 })
  language: string;

  @Column({ name: 'header_type', type: 'varchar', length: 20, nullable: true })
  headerType: string | null;

  @Column({ name: 'header_text', type: 'text', nullable: true })
  headerText: string | null;

  @Column({
    name: 'header_media_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  headerMediaId: string | null;

  @Column({ name: 'header_media_url', type: 'text', nullable: true })
  headerMediaUrl: string | null;

  @Column({ name: 'header_location', type: 'jsonb', nullable: true })
  headerLocation: Record<string, any> | null;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'text', nullable: true })
  footer: string | null;

  @Column({ type: 'jsonb', nullable: true })
  buttons: Record<string, any>[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
