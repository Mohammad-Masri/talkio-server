import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.schema';

export class UserResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  username: string;
  @ApiProperty({ nullable: true })
  avatarURL: string | undefined;

  @ApiProperty({ type: Boolean })
  isOnline: boolean;
  @ApiProperty({ nullable: true })
  lastSeen: Date;

  @ApiProperty({ type: Object, nullable: true })
  metadata: object;

  constructor(user: User) {
    this.id = user._id + '';
    this.name = user.name;
    this.username = user.username;
    this.avatarURL = user.avatarURL;
    this.isOnline = user.isOnline;
    this.lastSeen = user.lastSeen;
    this.metadata = user.metadata;
  }
}

export class LoginResponse {
  user: UserResponse;

  token: string;

  constructor(user: UserResponse, token: string) {
    this.user = user;
    this.token = token;
  }
}
