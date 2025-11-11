import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { User } from 'src/user/entities/user.entity';
import { Customer } from 'src/user/entities/customer.entity';
import { Admin } from 'src/user/entities/admin.entity';
import { Role } from 'src/common/enums/role.enum';
import { GENDER } from 'src/common/enums/gender.enum';
import { Image } from 'src/image/entities/image.entity';
import * as bcrypt from 'bcrypt';

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const userRepo = dataSource.getRepository(User);
    if ((await userRepo.count()) > 0) {
      console.log('User table already seeded, skipping...');
      return;
    }
    const customerRepo = dataSource.getRepository(Customer);
    const adminRepo = dataSource.getRepository(Admin);
    const imageRepo = dataSource.getRepository(Image);

    const demoImage = imageRepo.create({
      fileName: 'demo.png',
      filePath: 'uploads/proofs/demo.png',
      isTemp: false,
    });
    await imageRepo.save(demoImage);

    const superAdmin = userRepo.create({
      name: 'Super Admin',
      email: 'superadmin@paisaads.com',
      phone_number: '9000000001',w
      email_verified: true,
      phone_verified: true,
      password: await bcrypt.hash('superadmin123', 10),
      role: Role.SUPER_ADMIN,
      isActive: true,
    });
    await userRepo.save(superAdmin);
    await adminRepo.save(adminRepo.create({ user: superAdmin }));

    const admin = userRepo.create({
      name: 'Admin User',
      email: 'admin@paisaads.com',
      phone_number: '9000000002',
      email_verified: true,
      phone_verified: true,
      password: await bcrypt.hash('admin123', 10),
      role: Role.SUPER_ADMIN,
      isActive: true,
    });
    await userRepo.save(admin);
    await adminRepo.save(adminRepo.create({ user: admin }));

    const editor = userRepo.create({
      name: 'Editor User',
      email: 'editor@paisaads.com',
      phone_number: '9000000003',
      email_verified: true,
      phone_verified: true,
      password: await bcrypt.hash('editor123', 10),
      role: Role.EDITOR,
      isActive: true,
    });
    await userRepo.save(editor);
    await adminRepo.save(adminRepo.create({ user: editor }));

    const reviewer = userRepo.create({
      name: 'Reviewer User',
      email: 'reviewer@paisaads.com',
      phone_number: '9000000004',
      email_verified: true,
      phone_verified: true,
      password: await bcrypt.hash('reviewer123', 10),
      role: Role.REVIEWER,
      isActive: true,
    });
    await userRepo.save(reviewer);
    await adminRepo.save(adminRepo.create({ user: reviewer }));

    const customerUser = userRepo.create({
      name: 'Regular User',
      email: 'user@paisaads.com',
      phone_number: '9000000005',
      email_verified: true,
      phone_verified: true,
      password: await bcrypt.hash('user123', 10),
      role: Role.USER,
      isActive: true,
    });
    await userRepo.save(customerUser);
    await customerRepo.save(
      customerRepo.create({
        country: 'India',
        country_id: 'IN',
        state: 'Maharashtra',
        state_id: 'MH',
        city: 'Mumbai',
        city_id: 'BOM',
        proof: demoImage, // Link the demo image as proof
        gender: GENDER.MALE,
        user: customerUser,
      }),
    );
  }
}
