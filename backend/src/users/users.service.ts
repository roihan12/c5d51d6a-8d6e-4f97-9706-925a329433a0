import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
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
  private buildWhereClause(filter: any) {
    if (!filter || filter.length === 0) return {};

    if (Array.isArray(filter[0])) {
      // Handle nested array filter
      return filter.reduce((acc, [field, operator, value]) => {
        acc[field] = { [operator]: value };
        return acc;
      }, {});
    } else {
      // Handle simple array filter
      const [field, operator, value] = filter;
      return {
        [field]: {
          [operator]: value,
        },
      };
    }
  }

  private buildOrderByClause(sort: any) {
    return sort.map((s: any) => ({
      [s.selector]: s.desc ? 'desc' : 'asc',
    }));
  }

  async getAllUsers(query: {
    skip: number;
    take: number;
    filter?: any; // Marked as optional
    sort?: any; // Marked as optional
    requireTotalCount: boolean;
  }) {
    const { skip, take, filter, sort, requireTotalCount } = query;

    // Handle empty filter and sort
    const whereClause = filter ? this.buildWhereClause(filter) : {};
    const orderByClause = sort ? this.buildOrderByClause(sort) : [];

    try {
      const users = await this.prisma.user.findMany({
        skip,
        take,
        where: whereClause,
        orderBy: orderByClause,
      });

      const totalCount = requireTotalCount
        ? await this.prisma.user.count({ where: whereClause })
        : null;

      return {
        data: users,
        totalCount,
        summary: null, // if you have summary logic, implement it here
        groupCount: null, // if you have group count logic, implement it here
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
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
