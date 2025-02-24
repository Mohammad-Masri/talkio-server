import { Module } from '@nestjs/common';
import { RoomModuleDependencies } from 'src/models/room/room.module';
import { RoomManagementController } from './room-management.controller';
import { RoomController } from './room.controller';
import { ServerConfigService } from 'src/models/server-config/server-config.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [...RoomModuleDependencies.imports],
  controllers: [RoomManagementController, RoomController],
  providers: [
    ...RoomModuleDependencies.providers,
    ServerConfigService,
    JwtService,
  ],
})
export class RoomManagementControllerModule {}
