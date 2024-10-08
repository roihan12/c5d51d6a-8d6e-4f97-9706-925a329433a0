import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: UserEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of all users' })
  @ApiResponse({
    status: 200,
    description: 'Return all users',
    type: [UserEntity],
  })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'filter', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'requireTotalCount', required: false, type: Boolean })
  async getAllUsers(
    @Query('skip') skip: number,
    @Query('take') take: number,
    @Query('filter') filter: string,
    @Query('sort') sort: string,
    @Query('requireTotalCount') requireTotalCount: boolean,
  ) {
    const parsedFilter = filter ? JSON.parse(filter) : [];
    const parsedSort = sort ? JSON.parse(sort) : [];

    return this.usersService.getAllUsers({
      skip: +skip || 0,
      take: +take || 20,
      filter: parsedFilter,
      sort: parsedSort,
      requireTotalCount: requireTotalCount,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the user',
    type: UserEntity,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
    type: UserEntity,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateUserDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
    type: UserEntity,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Post('batch')
  @ApiResponse({ status: 200, description: 'Batch update successful' })
  batch(@Body() changes: any[]) {
    try {
      return this.usersService.batchUpdate(changes);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('check-email/:email')
  @ApiOperation({ summary: 'Check if email is valid and available' })
  @ApiResponse({ status: 200, description: 'Email is available.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid email format or email is already in use.',
  })
  async checkEmail(@Param('email') email: string) {
    try {
      await this.usersService.checkEmailIsValidOrExists(email);
      return { message: 'Email is available.' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
