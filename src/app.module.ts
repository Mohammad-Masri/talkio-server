import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './models/user/user.module';
import { UserManagementControllerModule } from './controllers/user/user-management.module';
import { RoomModule } from './models/room/room.module';
import { RoomManagementControllerModule } from './controllers/room/room-management.module';
import { MessageModule } from './models/message/message.module';
import { ChatModule } from './gateway/chat/chat.module';
import { CallModule } from './models/call/call.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    UserModule,
    UserManagementControllerModule,
    RoomModule,
    RoomManagementControllerModule,
    MessageModule,
    ChatModule,
    CallModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
