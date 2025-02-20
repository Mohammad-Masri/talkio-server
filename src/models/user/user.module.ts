import { Module, ModuleMetadata } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user.schema';
import { UserService } from './user.service';
import { Database } from 'src/config';
import { JwtService } from '@nestjs/jwt';
import { ServerConfigService } from '../server-config/server-config.service';

export const UserModuleDependencies: ModuleMetadata = {
  imports: [
    MongooseModule.forFeature([
      { name: Database.Collections.User, schema: UserSchema },
    ]),
  ],
  providers: [UserService, JwtService, ServerConfigService],
};

@Module({
  imports: [...UserModuleDependencies.imports],
  providers: [...UserModuleDependencies.providers],
})
export class UserModule {}
