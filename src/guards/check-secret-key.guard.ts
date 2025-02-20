import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AuthorizedRequest } from 'src/common/global.dto';

import { ServerConfigService } from 'src/models/server-config/server-config.service';

@Injectable()
export class CheckSecretKey implements CanActivate {
  constructor(private readonly serverConfigService: ServerConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: AuthorizedRequest & Request = context
      .switchToHttp()
      .getRequest();

    const authorization = (request.headers as any).authorization;

    if (!authorization)
      throw new UnauthorizedException(
        'the key is not provided in the authorization request headers',
      );

    let key = authorization;
    if (authorization.startsWith('Bearer ')) key = authorization.substring(7);

    const API_SECRET_KEY =
      this.serverConfigService.get<string>('API_SECRET_KEY');

    if (key !== API_SECRET_KEY) {
      throw new UnauthorizedException(`invalid key`);
    }

    return true;
  }
}
