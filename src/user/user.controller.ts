import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserAndCustomerDto } from './dto/create-user-and-customer';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from 'src/auth/decorator/current_user.decorator';
import { Public } from 'src/auth/decorator/public.decorator';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { UpdateCustomerDto } from './dto/update-customer';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('current')
  async getCurrentUser(@CurrentUser() user: any) {
    return user;
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  async create(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Post('register-customer')
  @Public()
  async createUserWithCustomer(@Body() dto: CreateUserAndCustomerDto) {
    console.log(dto);
    await this.userService.createUserWithCustomer(dto);
    return { message: 'User & customer created successfully' };
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  async findAll() {
    return this.userService.findAll();
  }

  @Get('customer/me')
  async findCustomer(@CurrentUser() user: any) {
    return (await this.userService.findOneById(user.sub)).customer;
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.findOneById(id);
  }

  @Get('phone/:phone')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  async findByPhone(@Param('phone') phone: string) {
    const user = await this.userService.findByPhone(phone);
    if (!user) return { message: 'User not found' };
    return user;
  }

  @Patch('me')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER, Role.USER)
  async updateMe(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(user.sub, dto);
  }

  @Post('update-customer/:id')
  async updateCustomer(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.userService.updateCustomer(id, dto);
  }

  @Patch('me/password')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER, Role.USER)
  async changePasswordMe(
    @CurrentUser() user: any,
    @Body('password') password: string,
  ) {
    return this.userService.changePassword(user.sub, password);
  }

  @Patch(':id/deactivate')
  @Roles(Role.SUPER_ADMIN)
  async deactivate(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.deactivateUser(id);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id/activate')
  async activate(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.activateUser(id);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.removeUser(id);
  }
}
