import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageCoreModule } from './message-core/message-core.module';
import { ContactOrmEntity } from './infrastructure/persistence/postgres/entities/contact.orm-entity';
import { ConversationOrmEntity } from './infrastructure/persistence/postgres/entities/conversation.orm-entity';
import { MessageOrmEntity } from './infrastructure/persistence/postgres/entities/message.orm-entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT')),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [ContactOrmEntity, ConversationOrmEntity, MessageOrmEntity],
        synchronize: true,
      }),
    }),

    TypeOrmModule.forFeature([
      ContactOrmEntity,
      ConversationOrmEntity,
      MessageOrmEntity,
    ]),

    MessageCoreModule,
  ],
})
export class AppModule {}