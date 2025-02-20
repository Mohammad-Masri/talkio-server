import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CheckSecretKey } from 'src/guards/check-secret-key.guard';
import { UserService } from 'src/models/user/user.service';
import {
  CreateUserBody,
  FindAllUsersDto,
  LoginBody,
  UserArrayDataResponse,
} from './dto';
import { UserResponse } from 'src/models/user/user.dto';
import { RootFilterQuery } from 'mongoose';
import { User } from 'src/models/user/user.schema';

@Controller('/management/users')
@ApiTags('User Management')
@UseGuards(CheckSecretKey)
export class UserManagementController {
  constructor(private readonly userService: UserService) {}

  @Post('/login')
  @ApiOperation({ summary: 'login user' })
  @ApiOkResponse({
    description: 'User login successfully.',
    type: UserResponse,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async loginUser(@Body() body: LoginBody) {
    return await this.userService.login(body.username);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: UserResponse,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async createNewUser(@Body() body: CreateUserBody) {
    const user = await this.userService.create(body);
    return await this.userService.makeUserResponse(user);
  }

  @Get('/')
  @ApiOperation({ summary: 'get users' })
  @ApiOkResponse({
    description: 'Users fetched successfully',
    type: UserArrayDataResponse,
  })
  async fetchUsers(@Query() query: FindAllUsersDto) {
    const { q } = query;

    const filters: RootFilterQuery<User> = {};
    if (q) {
      filters.$or = [
        {
          name: { $regex: q, $options: 'i' },
        },
        {
          username: { $regex: q, $options: 'i' },
        },
      ];
    }

    const { count, users } = await this.userService.findAll(
      filters,
      query.page,
      query.limit,
    );

    const usersResponse = await this.userService.makeUsersResponse(users);

    return await this.userService.makeUserArrayDataResponse(
      count,
      usersResponse,
      query.page,
      query.limit,
    );
  }

  @Get('/:id')
  @ApiOperation({ summary: 'get user details' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID',
  })
  @ApiOkResponse({
    description: 'User fetched successfully',
    type: UserResponse,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async fetchUserDetails(@Param('id') id: string) {
    const user = await this.userService.checkFoundById(id);
    return await this.userService.makeUserResponse(user);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'update user details' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID',
  })
  @ApiOkResponse({
    description: 'user updated successfully',
    type: UserResponse,
  })
  @ApiNotFoundResponse({ description: 'user not found' })
  async updateUserDetails(
    @Param('id') id: string,
    @Body() body: CreateUserBody,
  ) {
    const user = await this.userService.checkFoundById(id);

    const updatedUser = await this.userService.update(user, body);

    return await this.userService.makeUserResponse(updatedUser);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'delete user' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID',
  })
  @ApiOkResponse({
    description: 'user deleted successfully',
    type: UserResponse,
  })
  @ApiNotFoundResponse({ description: 'user not found' })
  async deleteUser(@Param('id') id: string) {
    const user = await this.userService.checkFoundById(id);

    await this.userService.delete(user);

    return await this.userService.makeUserResponse(user);
  }
}
