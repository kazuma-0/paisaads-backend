import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { VideoAd } from 'src/video-ad/entities/video-ad.entity';
import { Customer } from 'src/user/entities/customer.entity';
import { MainCategory } from 'src/category/entities/main-category.entity';
import { CategoryOne } from 'src/category/entities/category-one.entity';
import { CategoryTwo } from 'src/category/entities/category-two.entity';
import { CategoryThree } from 'src/category/entities/category-three.entity';
import { Image } from 'src/image/entities/image.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { AdPosition } from 'src/ad-position/entities/ad-position.entity';
import { AdStatus } from 'src/common/enums/ad-status.enum';
import { AdType } from 'src/common/enums/ad-type';
import { PageType } from 'src/common/enums/page-type.enum';
import { PositionType } from 'src/common/enums/position-type.enum';

export default class VideoAdSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const videoAdRepo = dataSource.getRepository(VideoAd);
    const customerRepo = dataSource.getRepository(Customer);
    const mainCategoryRepo = dataSource.getRepository(MainCategory);
    const categoryOneRepo = dataSource.getRepository(CategoryOne);
    const categoryTwoRepo = dataSource.getRepository(CategoryTwo);
    const categoryThreeRepo = dataSource.getRepository(CategoryThree);
    const imageRepo = dataSource.getRepository(Image);
    const paymentRepo = dataSource.getRepository(Payment);
    const adPositionRepo = dataSource.getRepository(AdPosition);

    const existingVideoAds = await videoAdRepo.count();
    if (existingVideoAds > 0) {
      console.log(
        `${existingVideoAds} video ads already exist. Skipping video ad seeder.`,
      );
      return;
    }

    const customers = await customerRepo.find({
      relations: ['user'],
      take: 1,
    });

    if (!customers || customers.length === 0) {
      throw new Error('No customer found. Please run user seeder first.');
    }

    const customer = customers[0];

    const categories = [
      { name: 'Electronics', color: '#3B82F6', font: '#FFFFFF' },
      { name: 'Fashion', color: '#F59E0B', font: '#FFFFFF' },
      { name: 'Real Estate', color: '#10B981', font: '#FFFFFF' },
      { name: 'Automotive', color: '#EF4444', font: '#FFFFFF' },
      { name: 'Entertainment', color: '#8B5CF6', font: '#FFFFFF' },
    ];

    const createdCategories: MainCategory[] = [];
    for (const cat of categories) {
      let mainCategory = await mainCategoryRepo.findOne({
        where: { name: cat.name },
      });
      if (!mainCategory) {
        mainCategory = mainCategoryRepo.create({
          name: cat.name,
          categories_color: cat.color,
          font_color: cat.font,
          isActive: true,
        });
        await mainCategoryRepo.save(mainCategory);
      }
      createdCategories.push(mainCategory);
    }

    const subcategories = {
      Electronics: ['Mobile Phones', 'Laptops', 'TV & Audio'],
      Fashion: ["Men's Clothing", "Women's Clothing", 'Accessories'],
      'Real Estate': ['Residential', 'Commercial', 'Land'],
      Automotive: ['Cars', 'Bikes', 'Auto Parts'],
      Entertainment: ['Movies', 'Music', 'Gaming'],
    };

    const categoryOneMap = new Map();
    for (const [mainCatName, subCats] of Object.entries(subcategories)) {
      const mainCategory = createdCategories.find(
        (c) => c.name === mainCatName,
      );
      if (mainCategory) {
        for (const subCatName of subCats) {
          let categoryOne = await categoryOneRepo.findOne({
            where: { name: subCatName, parent: { id: mainCategory.id } },
          });
          if (!categoryOne) {
            categoryOne = categoryOneRepo.create({
              name: subCatName,
              parent: mainCategory,
              isActive: true,
            });
            await categoryOneRepo.save(categoryOne);
          }
          categoryOneMap.set(`${mainCatName}-${subCatName}`, categoryOne);
        }
      }
    }

    const videoFiles = [
      '1747128083548.mp4',
      '1747138958973.mp4',
      '1747138967967.mp4',
      '1748206048957.mp4',
      '1748206051353.mp4',
      '1748206053666.mp4',
      '1748206172870.mp4',
      '1748206175250.mp4',
      '1748206177619.mp4',
      '1748206179961.mp4',
      '1748206182320.mp4',
      '1748206184653.mp4',
      '1748206187070.mp4',
      '1748206189499.mp4',
      '1748250127236.mp4',
      '1748250129537.mp4',
      '1748250131831.mp4',
      '1748255522515.mp4',
    ];

    const proofImages = [
      '1747127356626.jpg',
      '1747127917692.png',
      '1747127958198.jpg',
      '1747127984078.jpg',
      '1747128020849.png',
      '1747128110753.png',
    ];

    const videoAdsData = [
      {
        mainCategory: 'Electronics',
        categoryOne: 'Mobile Phones',
        videoFile: videoFiles[0],
        proofImage: proofImages[0],
        state: 'Maharashtra',
        city: 'Mumbai',
        sid: 27,
        cid: 1001,
        postedBy: 'Tech Solutions Ltd',
        pageType: PageType.HOME,
        side: PositionType.LEFT_SIDE,
        position: 1,
        status: AdStatus.PUBLISHED,
        amount: 5000,
        paymentMethod: 'Credit Card',
        paymentDetails: 'Visa ending in 4567',
      },
      {
        mainCategory: 'Fashion',
        categoryOne: "Women's Clothing",
        videoFile: videoFiles[1],
        proofImage: proofImages[1],
        state: 'Karnataka',
        city: 'Bangalore',
        sid: 29,
        cid: 1002,
        postedBy: 'Fashion Hub',
        pageType: PageType.HOME,
        side: PositionType.RIGHT_SIDE,
        position: 2,
        status: AdStatus.PUBLISHED,
        amount: 3500,
        paymentMethod: 'Debit Card',
        paymentDetails: 'MasterCard ending in 8901',
      },
      {
        mainCategory: 'Real Estate',
        categoryOne: 'Residential',
        videoFile: videoFiles[2],
        proofImage: proofImages[2],
        state: 'Delhi',
        city: 'New Delhi',
        sid: 7,
        cid: 1003,
        postedBy: 'Prime Properties',
        pageType: PageType.CATEGORY,
        side: PositionType.RIGHT_SIDE,
        position: 3,
        status: AdStatus.PUBLISHED,
        amount: 10000,
        paymentMethod: 'Bank Transfer',
        paymentDetails: 'NEFT Transfer - REF123456',
      },
      {
        mainCategory: 'Automotive',
        categoryOne: 'Cars',
        videoFile: videoFiles[3],
        proofImage: proofImages[3],
        state: 'Tamil Nadu',
        city: 'Chennai',
        sid: 33,
        cid: 1004,
        postedBy: 'Auto World',
        pageType: PageType.HOME,
        side: PositionType.LEFT_SIDE,
        position: 3,
        status: AdStatus.FOR_REVIEW,
        amount: 7500,
        paymentMethod: 'UPI',
        paymentDetails: 'UPI ID: autoworld@paytm',
      },
      {
        mainCategory: 'Entertainment',
        categoryOne: 'Movies',
        videoFile: videoFiles[4],
        proofImage: proofImages[4],
        state: 'West Bengal',
        city: 'Kolkata',
        sid: 19,
        cid: 1005,
        postedBy: 'Cinema Palace',
        pageType: PageType.HOME,
        side: PositionType.RIGHT_SIDE,
        position: 4,
        status: AdStatus.HOLD,
        amount: 4000,
        paymentMethod: 'Cash',
        paymentDetails: 'Cash payment at office',
      },
      {
        mainCategory: 'Electronics',
        categoryOne: 'Laptops',
        videoFile: videoFiles[5],
        proofImage: proofImages[5],
        state: 'Gujarat',
        city: 'Ahmedabad',
        sid: 24,
        cid: 1006,
        postedBy: 'Digital Store',
        pageType: PageType.CATEGORY,
        side: PositionType.RIGHT_SIDE,
        position: 2,
        status: AdStatus.YET_TO_BE_PUBLISHED,
        amount: 6000,
        paymentMethod: 'Credit Card',
        paymentDetails: 'American Express ending in 2345',
      },
      {
        mainCategory: 'Fashion',
        categoryOne: "Men's Clothing",
        videoFile: videoFiles[6],
        proofImage: proofImages[0],
        state: 'Rajasthan',
        city: 'Jaipur',
        sid: 8,
        cid: 1007,
        postedBy: 'Style Point',
        pageType: PageType.HOME,
        side: PositionType.LEFT_SIDE,
        position: 5,
        status: AdStatus.PUBLISHED,
        amount: 4500,
        paymentMethod: 'Debit Card',
        paymentDetails: 'Rupay ending in 6789',
      },
      {
        mainCategory: 'Real Estate',
        categoryOne: 'Commercial',
        videoFile: videoFiles[7],
        proofImage: proofImages[1],
        state: 'Haryana',
        city: 'Gurgaon',
        sid: 6,
        cid: 1008,
        postedBy: 'Commercial Spaces',
        pageType: PageType.CATEGORY,
        side: PositionType.RIGHT_SIDE,
        position: 3,
        status: AdStatus.PUBLISHED,
        amount: 12000,
        paymentMethod: 'Bank Transfer',
        paymentDetails: 'RTGS Transfer - REF789012',
      },
      {
        mainCategory: 'Automotive',
        categoryOne: 'Bikes',
        videoFile: videoFiles[8],
        proofImage: proofImages[2],
        state: 'Punjab',
        city: 'Chandigarh',
        sid: 4,
        cid: 1009,
        postedBy: 'Bike World',
        pageType: PageType.HOME,
        side: PositionType.LEFT_SIDE,
        position: 6,
        status: AdStatus.DRAFT,
        amount: 3000,
        paymentMethod: 'UPI',
        paymentDetails: 'UPI ID: bikeworld@gpay',
      },
      {
        mainCategory: 'Entertainment',
        categoryOne: 'Gaming',
        videoFile: videoFiles[9],
        proofImage: proofImages[3],
        state: 'Telangana',
        city: 'Hyderabad',
        sid: 36,
        cid: 1010,
        postedBy: 'Game Zone',
        pageType: PageType.CATEGORY,
        side: PositionType.LEFT_SIDE,
        position: 4,
        status: AdStatus.REJECTED,
        amount: 2500,
        paymentMethod: 'Wallet',
        paymentDetails: 'Paytm Wallet',
      },
    ];

    for (const adData of videoAdsData) {
      const mainCategory = createdCategories.find(
        (c) => c.name === adData.mainCategory,
      );
      const categoryOne = categoryOneMap.get(
        `${adData.mainCategory}-${adData.categoryOne}`,
      );

      const videoImage = imageRepo.create({
        fileName: adData.videoFile,
        filePath: `uploads/${adData.videoFile}`,
        isTemp: false,
      });
      await imageRepo.save(videoImage);

      const proofImage = imageRepo.create({
        fileName: adData.proofImage,
        filePath: `uploads/${adData.proofImage}`,
        isTemp: false,
      });
      await imageRepo.save(proofImage);

      const payment = paymentRepo.create({
        method: adData.paymentMethod,
        amount: adData.amount,
        details: adData.paymentDetails,
        customer: customer,
        proof: proofImage,
      });
      await paymentRepo.save(payment);

      const adPosition = adPositionRepo.create({
        adType: AdType.VIDEO,
        pageType: adData.pageType,
        side: adData.side,
        position: adData.position,
      });
      await adPositionRepo.save(adPosition);

      const dates: string[] = [];
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }

      const videoAd = videoAdRepo.create({
        customer: customer,
        mainCategory: mainCategory,
        categoryOne: categoryOne,
        image: videoImage,
        payment: payment,
        position: adPosition,
        state: adData.state,
        city: adData.city,
        sid: adData.sid,
        cid: adData.cid,
        postedBy: adData.postedBy,
        dates: dates,
        status: adData.status,
        isActive: true,
      });

      await videoAdRepo.save(videoAd);
      console.log(`Created video ad for ${adData.postedBy} in ${adData.city}`);
    }

    console.log('Video Ad seeder completed successfully!');
  }
}
