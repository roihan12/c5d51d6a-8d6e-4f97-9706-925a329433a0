import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: createUserDto,
      });
    } catch (error) {
      throw new BadRequestException('Failed to create user');
    }
  }

  async getAllUsers(params: {
    skip?: number;
    take?: number;
    filter?: any;
    sort?: any;
    requireTotalCount?: boolean;
  }) {
    const {
      skip = 0,
      take = 20,
      filter,
      sort,
      requireTotalCount = false,
    } = params;

    const where = this.buildWhereClause(filter);
    const orderBy = this.buildOrderByClause(sort);

    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        where,
        orderBy,
      }),
      requireTotalCount
        ? this.prisma.user.count({ where })
        : Promise.resolve(0),
    ]);

    return {
      data: users,
      totalCount: requireTotalCount ? totalCount : undefined,
      groupCount: -1,
      summary: null,
    };
  }
  private buildOrderByClause(sort: any) {
    if (!Array.isArray(sort)) return [];

    return sort.map((s: any) => {
      const { selector, desc } = s;
      return { [selector]: desc ? 'desc' : 'asc' };
    });
  }

  private buildWhereClause(filter: any) {
    if (!filter || !Array.isArray(filter)) return {};

    const whereClause: any = {};

    filter.forEach((f: any) => {
      const [field, operator, value] = f;

      switch (operator) {
        case 'contains':
          whereClause[field] = { contains: value, mode: 'insensitive' }; // Case-insensitive search
          break;
        case 'equals':
          whereClause[field] = { equals: value };
          break;
        case 'startsWith':
          whereClause[field] = { startsWith: value, mode: 'insensitive' };
          break;
        case 'endsWith':
          whereClause[field] = { endsWith: value, mode: 'insensitive' };
          break;

        default:
          break;
      }
    });

    return whereClause;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error) {
      throw new NotFoundException(`Failed to update user with ID ${id}`);
    }
  }

  async remove(id: number): Promise<User> {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Failed to remove user with ID ${id}`);
    }
  }

  async batchUpdate(changes: any[]) {
    for (const change of changes) {
      const { type, data, key } = change;

      let user;
      if (type === 'update' || type === 'remove') {
        user = await this.prisma.user.findUnique({ where: { id: +key } });
        if (!user) throw new NotFoundException(`User with ID ${key} not found`);
      }

      if (type === 'insert' || type === 'update') {
        if (type === 'insert') {
          await this.prisma.user.create({ data });
        } else if (type === 'update') {
          await this.prisma.user.update({ where: { id: +key }, data });
        }
      } else if (type === 'remove') {
        await this.prisma.user.delete({ where: { id: +key } });
      }
    }
    return changes;
  }

  async checkEmailIsValidOrExists(
    email: string,
    userId?: number,
  ): Promise<void> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('Email is already in use');
    }
  }
}
