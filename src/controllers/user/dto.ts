import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsObject } from 'class-validator';
import { ArrayDataResponse, FindAllDto } from 'src/common/global.dto';
import { UserResponse } from 'src/models/user/user.dto';
import { StringUtils } from 'src/utils';

export class CreateUserBody {
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => StringUtils.normalizeString(value))
  username: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatarURL: string | undefined;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata: object | undefined;
}

export class LoginBody {
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => StringUtils.normalizeString(value))
  username: string;
}

export class FindAllUsersDto extends FindAllDto {}

export class UserArrayDataResponse extends ArrayDataResponse<UserResponse> {
  @ApiProperty({ type: UserResponse, isArray: true })
  data: UserResponse[];
  constructor(
    totalCount: number,
    data: Array<UserResponse>,
    page: number,
    limit: number,
  ) {
    super(totalCount, data, page, limit);
    this.data = data;
  }
}
