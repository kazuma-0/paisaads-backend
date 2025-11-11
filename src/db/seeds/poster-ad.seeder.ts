import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { PosterAd } from 'src/poster-ad/entities/poster-ad.entity';
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

export default class PosterAdSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const posterAdRepo = dataSource.getRepository(PosterAd);
    const customerRepo = dataSource.getRepository(Customer);
    const mainCategoryRepo = dataSource.getRepository(MainCategory);
    const categoryOneRepo = dataSource.getRepository(CategoryOne);
    const categoryTwoRepo = dataSource.getRepository(CategoryTwo);
    const categoryThreeRepo = dataSource.getRepository(CategoryThree);
    const imageRepo = dataSource.getRepository(Image);
    const paymentRepo = dataSource.getRepository(Payment);
    const adPositionRepo = dataSource.getRepository(AdPosition);

    const existingPosterAds = await posterAdRepo.count();
    if (existingPosterAds > 0) {
      console.log(
        `${existingPosterAds} poster ads already exist. Skipping poster ad seeder.`,
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
      { name: 'Health & Beauty', color: '#EC4899', font: '#FFFFFF' },
      { name: 'Food & Beverages', color: '#F97316', font: '#FFFFFF' },
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
      Electronics: ['Mobile Phones', 'Laptops', 'TV & Audio', 'Cameras'],
      Fashion: [
        "Men's Clothing",
        "Women's Clothing",
        'Accessories',
        'Footwear',
      ],
      'Real Estate': ['Residential', 'Commercial', 'Land', 'Rental'],
      Automotive: ['Cars', 'Bikes', 'Auto Parts', 'Services'],
      Entertainment: ['Movies', 'Music', 'Gaming', 'Events'],
      'Health & Beauty': [
        'Healthcare',
        'Beauty Products',
        'Fitness',
        'Wellness',
      ],
      'Food & Beverages': ['Restaurants', 'Cafes', 'Groceries', 'Catering'],
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

    const imageFiles = [
      '1746748722095.png',
      '1747127356626.jpg',
      '1747127917692.png',
      '1747127958198.jpg',
      '1747127984078.jpg',
      '1747128020849.png',
      '1747128110753.png',
      '1747129101989.jpg',
      '1747137072307.jpg',
      '1747137114466.png',
      '1747137139997.png',
      '1747137211980.webp',
      '1747137238094.png',
      '1747137338295.png',
      '1747137410573.jpg',
      '1747137454541.png',
      '1747137818693.jpeg',
      '1747137941337.png',
      '1747138043355.jpg',
      '1747138113703.jpg',
      '1747138166093.webp',
      '1747138203361.png',
      '1747138223552.png',
      '1747138237214.png',
      '1747138371156.jpg',
      '1747138409072.png',
      '1747138422507.png',
    ];

    const proofImages = [
      '1748082308698.jpg',
      '1748083591038.jpg',
      '1748121465146.jpg',
      '1748121466739.jpg',
      '1748121467579.jpg',
      '1748121469239.jpg',
      '1748121470857.jpg',
      '1748121471697.jpg',
    ];

    const posterAdsData = [
      {
        mainCategory: 'Electronics',
        categoryOne: 'Mobile Phones',
        imageFile: imageFiles[0],
        proofImage: proofImages[0],
        state: 'Maharashtra',
        city: 'Mumbai',
        sid: 27,
        cid: 1001,
        postedBy: 'TechnoWorld Electronics',
        pageType: PageType.HOME,
        side: PositionType.LEFT_SIDE,
        position: 1,
        status: AdStatus.PUBLISHED,
        amount: 4000,
        paymentMethod: 'Credit Card',
        paymentDetails: 'Visa ending in 1234',
      },
      {
        mainCategory: 'Fashion',
        categoryOne: "Women's Clothing",
        imageFile: imageFiles[1],
        proofImage: proofImages[1],
        state: 'Karnataka',
        city: 'Bangalore',
        sid: 29,
        cid: 1002,
        postedBy: 'Glamour Fashion Store',
        pageType: PageType.HOME,
        side: PositionType.LEFT_SIDE,
        position: 2,
        status: AdStatus.PUBLISHED,
        amount: 3000,
        paymentMethod: 'UPI',
        paymentDetails: 'UPI ID: glamour@paytm',
      },
      {
        mainCategory: 'Health & Beauty',
        categoryOne: 'Beauty Products',
        imageFile: imageFiles[2],
        proofImage: proofImages[2],
        state: 'Tamil Nadu',
        city: 'Chennai',
        sid: 33,
        cid: 1003,
        postedBy: 'Beauty Palace',
        pageType: PageType.CATEGORY,
        side: PositionType.LEFT_SIDE,
        position: 3,
        status: AdStatus.PUBLISHED,
        amount: 2500,
        paymentMethod: 'Debit Card',
        paymentDetails: 'MasterCard ending in 5678',
      },

      {
        mainCategory: 'Real Estate',
        categoryOne: 'Residential',
        imageFile: imageFiles[3],
        proofImage: proofImages[3],
        state: 'Delhi',
        city: 'New Delhi',
        sid: 7,
        cid: 1004,
        postedBy: 'Dream Homes Realty',
        pageType: PageType.HOME,
        side: PositionType.RIGHT_SIDE,
        position: 1,
        status: AdStatus.PUBLISHED,
        amount: 8000,
        paymentMethod: 'Bank Transfer',
        paymentDetails: 'NEFT Transfer - REF456789',
      },
      {
        mainCategory: 'Automotive',
        categoryOne: 'Cars',
        imageFile: imageFiles[4],
        proofImage: proofImages[4],
        state: 'Gujarat',
        city: 'Ahmedabad',
        sid: 24,
        cid: 1005,
        postedBy: 'Auto Gallery',
        pageType: PageType.HOME,
        side: PositionType.RIGHT_SIDE,
        position: 2,
        status: AdStatus.FOR_REVIEW,
        amount: 6000,
        paymentMethod: 'Credit Card',
        paymentDetails: 'American Express ending in 9012',
      },
      {
        mainCategory: 'Food & Beverages',
        categoryOne: 'Restaurants',
        imageFile: imageFiles[5],
        proofImage: proofImages[5],
        state: 'West Bengal',
        city: 'Kolkata',
        sid: 19,
        cid: 1006,
        postedBy: 'Spice Garden Restaurant',
        pageType: PageType.CATEGORY,
        side: PositionType.RIGHT_SIDE,
        position: 3,
        status: AdStatus.PUBLISHED,
        amount: 3500,
        paymentMethod: 'Cash',
        paymentDetails: 'Cash payment at office',
      },

      {
        mainCategory: 'Entertainment',
        categoryOne: 'Events',
        imageFile: imageFiles[6],
        proofImage: proofImages[6],
        state: 'Rajasthan',
        city: 'Jaipur',
        sid: 8,
        cid: 1007,
        postedBy: 'Event Masters',
        pageType: PageType.HOME,
        side: PositionType.CENTER_TOP,
        position: 1,
        status: AdStatus.PUBLISHED,
        amount: 10000,
        paymentMethod: 'Bank Transfer',
        paymentDetails: 'RTGS Transfer - REF123789',
      },
      {
        mainCategory: 'Electronics',
        categoryOne: 'Cameras',
        imageFile: imageFiles[7],
        proofImage: proofImages[7],
        state: 'Haryana',
        city: 'Gurgaon',
        sid: 6,
        cid: 1008,
        postedBy: 'Photo Pro Store',
        pageType: PageType.CATEGORY,
        side: PositionType.CENTER_TOP,
        position: 1,
        status: AdStatus.PUBLISHED,
        amount: 7500,
        paymentMethod: 'UPI',
        paymentDetails: 'UPI ID: photopro@gpay',
      },

      {
        mainCategory: 'Fashion',
        categoryOne: 'Footwear',
        imageFile: imageFiles[8],
        proofImage: proofImages[0], // Reusing proof images
        state: 'Punjab',
        city: 'Chandigarh',
        sid: 4,
        cid: 1009,
        postedBy: 'Shoe Palace',
        pageType: PageType.HOME,
        side: PositionType.CENTER_BOTTOM,
        position: 1,
        status: AdStatus.PUBLISHED,
        amount: 4500,
        paymentMethod: 'Debit Card',
        paymentDetails: 'Rupay ending in 3456',
      },
      {
        mainCategory: 'Health & Beauty',
        categoryOne: 'Fitness',
        imageFile: imageFiles[9],
        proofImage: proofImages[1],
        state: 'Telangana',
        city: 'Hyderabad',
        sid: 36,
        cid: 1010,
        postedBy: 'Fit Life Gym',
        pageType: PageType.CATEGORY,
        side: PositionType.CENTER_BOTTOM,
        position: 1,
        status: AdStatus.HOLD,
        amount: 5000,
        paymentMethod: 'Wallet',
        paymentDetails: 'Paytm Wallet',
      },

      {
        mainCategory: 'Real Estate',
        categoryOne: 'Commercial',
        imageFile: imageFiles[10],
        proofImage: proofImages[2],
        state: 'Uttar Pradesh',
        city: 'Noida',
        sid: 9,
        cid: 1011,
        postedBy: 'Commercial Hub',
        pageType: PageType.HOME,
        side: PositionType.LEFT_SIDE,
        position: 4,
        status: AdStatus.YET_TO_BE_PUBLISHED,
        amount: 12000,
        paymentMethod: 'Credit Card',
        paymentDetails: 'Visa ending in 7890',
      },
      {
        mainCategory: 'Automotive',
        categoryOne: 'Services',
        imageFile: imageFiles[11],
        proofImage: proofImages[3],
        state: 'Kerala',
        city: 'Kochi',
        sid: 32,
        cid: 1012,
        postedBy: 'Auto Care Center',
        pageType: PageType.HOME,
        side: PositionType.RIGHT_SIDE,
        position: 4,
        status: AdStatus.DRAFT,
        amount: 2800,
        paymentMethod: 'Bank Transfer',
        paymentDetails: 'IMPS Transfer - REF654321',
      },
      {
        mainCategory: 'Food & Beverages',
        categoryOne: 'Cafes',
        imageFile: imageFiles[12],
        proofImage: proofImages[4],
        state: 'Goa',
        city: 'Panaji',
        sid: 30,
        cid: 1013,
        postedBy: 'Coffee Culture',
        pageType: PageType.CATEGORY,
        side: PositionType.LEFT_SIDE,
        position: 5,
        status: AdStatus.REJECTED,
        amount: 1800,
        paymentMethod: 'UPI',
        paymentDetails: 'UPI ID: coffee@phonepe',
      },
    ];

    for (const adData of posterAdsData) {
      const mainCategory = createdCategories.find(
        (c) => c.name === adData.mainCategory,
      );
      const categoryOne = categoryOneMap.get(
        `${adData.mainCategory}-${adData.categoryOne}`,
      );

      const posterImage = imageRepo.create({
        fileName: adData.imageFile,
        filePath: `uploads/${adData.imageFile}`,
        isTemp: false,
      });
      await imageRepo.save(posterImage);

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
        adType: AdType.POSTER,
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

      const posterAd = posterAdRepo.create({
        customer: customer,
        mainCategory: mainCategory,
        categoryOne: categoryOne,
        image: posterImage,
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

      await posterAdRepo.save(posterAd);
      console.log(
        `Created poster ad for ${adData.postedBy} in ${adData.city} (${adData.side}-${adData.position})`,
      );
    }

    console.log('Poster Ad seeder completed successfully!');
  }
}
