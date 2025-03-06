import { Module, ModuleMetadata } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Database } from 'src/config';
import { CallSchema } from './call.schema';
import { CallService } from './call.service';
import { UserModuleDependencies } from '../user/user.module';
import { RoomModuleDependencies } from '../room/room.module';

export const CallModuleDependencies: ModuleMetadata = {
  imports: [
    MongooseModule.forFeature([
      { name: Database.Collections.Call, schema: CallSchema },
    ]),
    ...UserModuleDependencies.imports,
    ...RoomModuleDependencies.imports,
  ],
  providers: [
    CallService,
    ...UserModuleDependencies.providers,
    ...RoomModuleDependencies.providers,
  ],
};

@Module({
  imports: [...CallModuleDependencies.imports],
  providers: [...CallModuleDependencies.providers],
})
export class CallModule {}
