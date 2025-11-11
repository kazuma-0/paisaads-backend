import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from 'src/common/types/base-entity';

@Entity()
export class Admin extends BaseEntity {
  @OneToOne(() => User, (user) => user.admin)
  @JoinColumn()
  user: User;
}
