import { Module } from '@nestjs/common';
import { RoomModuleDependencies } from 'src/models/room/room.module';
import { RoomManagementController } from './room-management.controller';
import { RoomController } from './room.controller';

@Module({
  imports: [...RoomModuleDependencies.imports],
  controllers: [RoomManagementController, RoomController],
  providers: [...RoomModuleDependencies.providers],
})
export class RoomManagementControllerModule {}
