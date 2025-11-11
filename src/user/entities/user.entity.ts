import { Role } from 'src/common/enums/role.enum';
import { BaseEntity } from 'src/common/types/base-entity';
import { Column, Entity, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Admin } from './admin.entity';
import { Customer } from './customer.entity';
import { Otp } from 'src/otp/entities/otp.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ unique: true })
  phone_number: string;

  @Column({ nullable: true })
  secondary_number: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  email_verified: boolean;

  @Column({ default: false })
  phone_verified: boolean;

  @OneToOne(() => Admin, (admin) => admin.user, { nullable: true })
  admin: Admin;

  @OneToOne(() => Customer, (customer) => customer.user, { nullable: true })
  customer: Customer;

  @OneToMany(() => Otp, (otp) => otp.user, {nullable:true})
  otps: Otp[];
}
