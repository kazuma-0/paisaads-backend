import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Customer } from './entities/customer.entity';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ImageService } from 'src/image/image.service';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/enums/role.enum';
import { CreateUserAndCustomerDto } from './dto/create-user-and-customer';
import { UpdateCustomerDto } from './dto/update-customer';
import { SmsService } from 'src/sms.service';
import { OtpService } from 'src/otp/otp.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
    private imageService: ImageService,
    private smsService: SmsService,
    private otpService: OtpService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    if (
      await this.userRepo.findOne({ where: { phone_number: dto.phone_number } })
    )
      throw new ConflictException('Phone number already registered');
    if (await this.userRepo.findOne({ where: { email: dto.email } }))
      throw new ConflictException('Email already registered');

    const hashed = await this.hashPassword(dto.password);

    const user = this.userRepo.create({
      ...dto,
      password: hashed,
      role: dto.role ?? Role.USER,
      isActive: true,
    });

    const newUser = await this.userRepo.save(user);

    if (user.role === Role.USER) {
      await this.customerRepo.save(this.customerRepo.create({ user: newUser }));

      console.log(
        `User registered: ${newUser.email} / ${newUser.phone_number}`,
      );
      console.log(
        'Please use /auth/send-verification-otp to verify your account',
      );
    } else {
      await this.adminRepo.save(this.adminRepo.create({ user: newUser }));
    }
    return newUser;
  }

  async createUserWithCustomer(dto: CreateUserAndCustomerDto): Promise<void> {
    console.log('creating 1');
    
    if (
      await this.userRepo.findOne({ where: { phone_number: dto.phone_number } })
    )
      throw new ConflictException('Phone number already registered');
    if (await this.userRepo.findOne({ where: { email: dto.email } }))
      throw new ConflictException('Email already registered');

    console.log('creating');
    try {
      let savedUser: User | undefined;
      await this.userRepo.manager.transaction(async (manager) => {
        const hashed = await this.hashPassword(dto.password);
        const user = manager.create(User, {
          name: dto.name,
          email: dto.email,
          phone_number: dto.phone_number,
          secondary_number: dto.secondary_number,
          password: hashed,
          role: Role.USER,
          isActive: true,
        });
        savedUser = await manager.save(User, user);
        let proof;
        if (dto.proof) {
          proof = await this.imageService.confirmImage(dto.proof);
        }

        const customer = manager.create(Customer, {
          country: dto.country,
          country_id: dto.country_id,
          state: dto.state,
          state_id: dto.state_id,
          city: dto.city,
          city_id: dto.city_id,
          gender: dto.gender,
          user: savedUser,
          proof: proof ?? undefined,
        });
        await manager.save(Customer, customer);
      });

      if (savedUser) {
        console.log(savedUser);
        const otp = await this.otpService.generateOtp(
          savedUser.phone_number,
          savedUser,
          'LOGIN',
        );
        console.log(otp)
        await this.smsService.sendOtp(savedUser.phone_number, otp);
      }
    } catch (exception) {
      throw new BadRequestException(exception);
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userRepo.find({ relations: ['customer', 'admin'] });
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['admin', 'customer'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByPhone(phone: string): Promise<User | null> {
    return await this.userRepo.findOne({
      where: { phone_number: phone },
      relations: ['customer', 'admin'],
    });
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, dto);
    if ('password' in dto) delete dto['password'];
    await this.userRepo.save(user);
    return await this.findOneById(id);
  }

  async updateCustomer(id: string, dto: UpdateCustomerDto) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['customer'],
    });
    if (!user) throw new NotFoundException('User not found');

    const customer = await this.customerRepo.findOne({
      where: { id: user.customer.id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    Object.assign(customer, dto);
    await this.customerRepo.save(customer);
    return await this.findOneById(id);
  }

  async changePassword(id: string, newPassword: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.password = await this.hashPassword(newPassword);
    await this.userRepo.save(user);
    return await this.findOneById(id);
  }

  async deactivateUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = false;
    await this.userRepo.save(user);
    return { message: 'User deactivated' };
  }
  async activateUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = true;
    await this.userRepo.save(user);
    return { message: 'User activated' };
  }
  async removeUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.remove(user);
    return { message: 'User deleted' };
  }

  async findByPhoneOrEmailWithPassword(
    identifier: string,
  ): Promise<User | null> {
    return await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.phone_number = :identifier OR user.email = :identifier', {
        identifier,
      })
      .getOne();
  }
}
