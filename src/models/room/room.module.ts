import { Module, ModuleMetadata } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Database } from 'src/config';
import { RoomParticipantSchema, RoomSchema } from './room.schema';
import { RoomService } from './room.service';
import { UserModuleDependencies } from '../user/user.module';

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
    ...UserModuleDependencies.imports,
  ],
  providers: [RoomService, ...UserModuleDependencies.providers],
};

@Module({
  imports: [...RoomModuleDependencies.imports],
  providers: [...RoomModuleDependencies.providers],
})
export class RoomModule {}
