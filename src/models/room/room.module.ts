import { forwardRef, Module, ModuleMetadata } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Database } from 'src/config';
import { RoomParticipantSchema, RoomSchema } from './room.schema';
import { RoomService } from './room.service';
import { UserModule } from '../user/user.module';
import { MessageModule } from '../message/message.module';

export const RoomModuleDependencies: ModuleMetadata = {
  imports: [
    MongooseModule.forFeature([
      { name: Database.Collections.Room, schema: RoomSchema },
    ]),
    MongooseModule.forFeature([
      {
        name: Database.Collections.RoomParticipant,
        schema: RoomParticipantSchema,
      },
    ]),
    forwardRef(() => MessageModule),
    UserModule, // Import required modules explicitly
    // MessageModule, // Import MessageModule here
    // ...UserModuleDependencies.imports,
  ],
  providers: [RoomService],
};

@Module({
  imports: [...RoomModuleDependencies.imports],
  providers: [...RoomModuleDependencies.providers],
  exports: [RoomService],
})
export class RoomModule {}
