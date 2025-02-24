import { forwardRef, Module, ModuleMetadata } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Database } from 'src/config';
import { MessageSchema } from './message.schema';
import { MessageService } from './message.service';
import { MessageAttachmentSchema } from './message-attachment.schema';
import { MessageReadSchema } from './message-read.schema';
import { RoomModule } from '../room/room.module';
import { UserModule } from '../user/user.module';

export const MessageModuleDependencies: ModuleMetadata = {
  imports: [
    MongooseModule.forFeature([
      { name: Database.Collections.Message, schema: MessageSchema },
    ]),
    MongooseModule.forFeature([
      {
        name: Database.Collections.MessageAttachment,
        schema: MessageAttachmentSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: Database.Collections.MessageRead,
        schema: MessageReadSchema,
      },
    ]),
    forwardRef(() => RoomModule), // Import RoomModule to access RoomService
    UserModule, // Import UserModule explicitly
  ],
  providers: [MessageService],
};

@Module({
  imports: [...MessageModuleDependencies.imports],
  providers: [...MessageModuleDependencies.providers],
  exports: [MessageService],
})
export class MessageModule {}
