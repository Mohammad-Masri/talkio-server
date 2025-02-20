import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ArrayDataResponse<T> {
  @ApiProperty({ type: Number })
  totalCount: number;
  @ApiProperty({ type: Number })
  page: number;
  @ApiProperty({ type: Number })
  limit: number;
  @ApiProperty({ isArray: true })
  data: Array<T>;
  @ApiProperty({ type: Number })
  totalPages: number;

  constructor(totalCount: number, data: Array<T>, page: number, limit: number) {
    this.data = data;
    this.totalCount = totalCount;
    this.page = page;
    this.limit = limit;
    this.totalPages = 0;
    if (limit !== 0) this.totalPages = Math.ceil(totalCount / limit);
  }
}

export class FindAllDto {
  @ApiProperty({
    description: 'Page number for pagination (default is 1)',
    example: 1,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page (default is 10)',
    example: 10,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    type: String,
    description: 'the search query',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  q?: string = '';
}

export class AuthorizedRequest {
  context:
    | {
        id: string;
        user: object | undefined;
      }
    | undefined;
}
