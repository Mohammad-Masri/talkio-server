import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, RootFilterQuery, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { Database, JWTConfig } from 'src/config';
import { LoginResponse, UserResponse } from './user.dto';
import { JwtService } from '@nestjs/jwt';
import { ServerConfigService } from '../server-config/server-config.service';
import { UserArrayDataResponse } from 'src/controllers/user/dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(Database.Collections.User)
    private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly serverConfigService: ServerConfigService,
  ) {}

  async findById(id: string | ObjectId) {
    if (id && Types.ObjectId.isValid(id + '')) {
      return await this.userModel.findById(id).exec();
    }
    return undefined;
  }

  async findOne(filters: RootFilterQuery<User>) {
    return await this.userModel.findOne(filters);
  }

  async findAll(filters: RootFilterQuery<User>, page: number, limit: number) {
    const skip = (Number(page) - 1) * Number(limit);

    const users = await this.userModel
      .find(filters)
      .skip(skip)
      .limit(limit)
      .exec();

    const count = await this.userModel.countDocuments(filters);

    return {
      users,
      count,
    };
  }

  async checkFoundById(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new BadRequestException(`user with id (${id}) is not found`);
    }
    return user;
  }

  async checkFoundByUsername(username: string) {
    const user = await this.findOne({
      username,
    });
    if (!user) {
      throw new BadRequestException(
        `user with username (${username}) is not found`,
      );
    }
    return user;
  }

  async checkAlreadyFoundByUsername(username: string) {
    const user = await this.findOne({
      username,
    });
    if (user) {
      throw new BadRequestException(
        `user with username (${username}) is already registered`,
      );
    }
    return user;
  }

  async create(user: Partial<User>): Promise<User> {
    await this.checkAlreadyFoundByUsername(user.username);

    return await this.userModel.create(user);
  }

  async update(user: UserDocument, newUserDate: Partial<User>): Promise<User> {
    await this.checkAlreadyFoundByUsername(newUserDate.username);

    user.username = newUserDate.username;
    user.name = newUserDate.name;
    user.avatarURL = newUserDate.avatarURL;

    return await user.save();
  }

  async setOnline(userId: string, online: boolean) {
    await this.userModel.updateOne(
      { _id: userId },
      {
        isOnline: online,
        lastSeen: new Date(),
      },
    );
  }

  async delete(user: UserDocument) {
    // TODO: delete all related data
    return await user.deleteOne();
  }

  private async signToken(user: UserDocument) {
    const JWT_SECRET_KEY =
      this.serverConfigService.get<string>('JWT_SECRET_KEY') ||
      'JWT_SECRET_KEY';

    const token = this.jwtService.sign(
      {
        id: user._id,
        username: user.username,
      },
      {
        secret: JWT_SECRET_KEY,
        ...JWTConfig.JWT_OPTIONS,
      },
    );

    return token;
  }

  async login(username: string) {
    const user = await this.checkFoundByUsername(username);

    const token = await this.signToken(user);

    const userResponse = await this.makeUserResponse(user);

    return new LoginResponse(userResponse, token);
  }

  async makeUserResponse(user: User | undefined) {
    if (!user) return undefined;
    return new UserResponse(user);
  }

  async makeUsersResponse(users: User[]) {
    const usersResponse: UserResponse[] = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const UserResponse = await this.makeUserResponse(user);
      usersResponse.push(UserResponse);
    }
    return usersResponse;
  }

  async makeUserArrayDataResponse(
    totalCount: number,
    data: Array<UserResponse>,
    page: number,
    limit: number,
  ) {
    return new UserArrayDataResponse(totalCount, data, page, limit);
  }
}
