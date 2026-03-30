import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
  const clientId = process.env.KAFKA_CLIENT_ID || 'message-core-service';
  const groupId = process.env.KAFKA_GROUP_ID || 'message-core-group';

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId,
        brokers,
      },
      consumer: {
        groupId,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3004);

  console.log(
    `Message core service HTTP running on http://localhost:${process.env.PORT || 3004}`,
  );
  console.log('Message core service Kafka consumer running');
}
bootstrap();
