import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ContactOrmEntity } from './entities/contact.orm-entity';
import { ConversationOrmEntity } from './entities/conversation.orm-entity';
import { MessageOrmEntity } from './entities/message.orm-entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [ContactOrmEntity, ConversationOrmEntity, MessageOrmEntity],
  migrations: ['dist/infrastructure/persistence/postgres/migrations/*.js'],
  synchronize: false,
});
