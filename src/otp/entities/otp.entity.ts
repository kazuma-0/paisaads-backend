import { BaseEntity } from 'src/common/types/base-entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity('otps')
export class Otp extends BaseEntity {
  @Column()
  phone_number: string;

  @Column()
  otp_code: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'LOGIN' })
  purpose: string; // 'LOGIN', 'EMAIL_VERIFICATION', 'PHONE_VERIFICATION'

  @ManyToOne(() => User, (user) => user.otps, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
