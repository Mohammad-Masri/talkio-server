import { Module } from '@nestjs/common';
import { UserManagementController } from './user-management.controller';
import { UserModuleDependencies } from 'src/models/user/user.module';
import { ServerConfigService } from 'src/models/server-config/server-config.service';

@Module({
  imports: [...UserModuleDependencies.imports],
  controllers: [UserManagementController],
  providers: [...UserModuleDependencies.providers, ServerConfigService],
})
export class UserManagementControllerModule {}
