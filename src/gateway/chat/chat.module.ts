import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { JwtService } from '@nestjs/jwt';
import { ServerConfigService } from 'src/models/server-config/server-config.service';
import { MessageModuleDependencies } from 'src/models/message/message.module';
import { CallModuleDependencies } from 'src/models/call/call.module';

@Module({
  imports: [
    ...MessageModuleDependencies.imports,
    ...CallModuleDependencies.imports,
  ],
  providers: [
    ChatGateway,
    JwtService,
    ServerConfigService,
    ...MessageModuleDependencies.providers,
    ...CallModuleDependencies.providers,
  ],
})
export class ChatModule {}
