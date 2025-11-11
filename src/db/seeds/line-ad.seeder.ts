import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { LineAd } from 'src/line-ad/entities/line-ad.entity';
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

export default class LineAdSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const lineAdRepo = dataSource.getRepository(LineAd);
    const customerRepo = dataSource.getRepository(Customer);
    const mainCategoryRepo = dataSource.getRepository(MainCategory);
    const categoryOneRepo = dataSource.getRepository(CategoryOne);
    const categoryTwoRepo = dataSource.getRepository(CategoryTwo);
    const categoryThreeRepo = dataSource.getRepository(CategoryThree);
    const imageRepo = dataSource.getRepository(Image);
    const paymentRepo = dataSource.getRepository(Payment);
    const adPositionRepo = dataSource.getRepository(AdPosition);

    const existingLineAds = await lineAdRepo.count();
    if (existingLineAds > 0) {
      console.log(
        `${existingLineAds} line ads already exist. Skipping line ad seeder.`,
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
      { name: 'Services', color: '#6B7280', font: '#FFFFFF' },
      { name: 'Jobs', color: '#059669', font: '#FFFFFF' },
      { name: 'Education', color: '#7C3AED', font: '#FFFFFF' },
      { name: 'Home & Garden', color: '#DC2626', font: '#FFFFFF' },
      { name: 'Sports & Fitness', color: '#EA580C', font: '#FFFFFF' },
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
      Electronics: [
        'Mobile Phones',
        'Laptops',
        'TV & Audio',
        'Cameras',
        'Gaming',
        'Accessories',
      ],
      Fashion: [
        "Men's Clothing",
        "Women's Clothing",
        'Accessories',
        'Footwear',
        'Watches',
        'Bags',
      ],
      'Real Estate': [
        'Residential',
        'Commercial',
        'Land',
        'Rental',
        'PG/Hostel',
        'Office Space',
      ],
      Automotive: [
        'Cars',
        'Bikes',
        'Auto Parts',
        'Services',
        'Commercial Vehicles',
        'Accessories',
      ],
      Entertainment: [
        'Movies',
        'Music',
        'Gaming',
        'Events',
        'Books',
        'Tickets',
      ],
      'Health & Beauty': [
        'Healthcare',
        'Beauty Products',
        'Fitness',
        'Wellness',
        'Medical Equipment',
        'Supplements',
      ],
      'Food & Beverages': [
        'Restaurants',
        'Cafes',
        'Groceries',
        'Catering',
        'Food Delivery',
        'Beverages',
      ],
      Services: [
        'Home Services',
        'Professional Services',
        'Repair Services',
        'Consulting',
        'Legal Services',
        'Financial Services',
      ],
      Jobs: [
        'IT Jobs',
        'Sales Jobs',
        'Marketing Jobs',
        'Healthcare Jobs',
        'Education Jobs',
        'Part Time Jobs',
      ],
      Education: [
        'Tuitions',
        'Coaching Classes',
        'Online Courses',
        'Schools',
        'Colleges',
        'Skill Development',
      ],
      'Home & Garden': [
        'Furniture',
        'Home Decor',
        'Appliances',
        'Garden Tools',
        'Lighting',
        'Kitchen Items',
      ],
      'Sports & Fitness': [
        'Gym Equipment',
        'Sports Goods',
        'Outdoor Sports',
        'Fitness Classes',
        'Sports Coaching',
        'Yoga Classes',
      ],
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

    const lineAdsData = [
      {
        mainCategory: 'Real Estate',
        categoryOne: 'Residential',
        content:
          '3BHK flat for sale in Bandra West. Prime location, sea view, fully furnished. Ready to move. 1200 sq ft. Parking available.',
        contactOne: 9876543210,
        contactTwo: 8765432109,
        state: 'Maharashtra',
        city: 'Mumbai',
        sid: 27,
        cid: 1001,
        postedBy: 'Mumbai Properties',
        hasImages: true,
        imageFiles: [imageFiles[0], imageFiles[1]],
        proofImage: proofImages[0],
        status: AdStatus.PUBLISHED,
        amount: 2500,
        paymentMethod: 'UPI',
        paymentDetails: 'UPI ID: mumbaiproperties@paytm',
        pageType: PageType.HOME,
      },
      {
        mainCategory: 'Real Estate',
        categoryOne: 'Rental',
        content:
          '2BHK apartment for rent in Koramangala. Well ventilated, near metro station. Rs 25,000/month. Family preferred.',
        contactOne: 9988776655,
        contactTwo: undefined,
        state: 'Karnataka',
        city: 'Bangalore',
        sid: 29,
        cid: 1002,
        postedBy: 'Bangalore Rentals',
        hasImages: true,
        imageFiles: [imageFiles[2], imageFiles[3]],
        proofImage: proofImages[1],
        status: AdStatus.PUBLISHED,
        amount: 1800,
        paymentMethod: 'Credit Card',
        paymentDetails: 'Visa ending in 1234',
        pageType: PageType.CATEGORY,
      },

      {
        mainCategory: 'Jobs',
        categoryOne: 'IT Jobs',
        content:
          'Software Developer required. React, Node.js, 2+ years exp. Salary: 8-12 LPA. Work from home available. Immediate joining.',
        contactOne: 7766554433,
        contactTwo: 9988112233,
        state: 'Delhi',
        city: 'New Delhi',
        sid: 7,
        cid: 1003,
        postedBy: 'TechSoft Solutions',
        hasImages: false,
        imageFiles: [],
        proofImage: proofImages[2],
        status: AdStatus.PUBLISHED,
        amount: 1200,
        paymentMethod: 'Bank Transfer',
        paymentDetails: 'NEFT Transfer - REF456789',
        pageType: PageType.HOME,
      },
      {
        mainCategory: 'Jobs',
        categoryOne: 'Sales Jobs',
        content:
          'Sales Executive needed for leading FMCG company. Field sales, Delhi NCR. Good communication skills. Attractive incentives.',
        contactOne: 8877665544,
        contactTwo: undefined,
        state: 'Haryana',
        city: 'Gurgaon',
        sid: 6,
        cid: 1004,
        postedBy: 'FMCG Corp',
        hasImages: false,
        imageFiles: [],
        proofImage: proofImages[3],
        status: AdStatus.FOR_REVIEW,
        amount: 1000,
        paymentMethod: 'UPI',
        paymentDetails: 'UPI ID: fmcgcorp@phonepe',
        pageType: PageType.CATEGORY,
      },

      {
        mainCategory: 'Automotive',
        categoryOne: 'Cars',
        content:
          'Maruti Swift 2019 for sale. Single owner, well maintained. 45,000 km driven. All documents ready. Price negotiable.',
        contactOne: 9876543211,
        contactTwo: 8765432110,
        state: 'Tamil Nadu',
        city: 'Chennai',
        sid: 33,
        cid: 1005,
        postedBy: 'Auto World Chennai',
        hasImages: true,
        imageFiles: [imageFiles[5], imageFiles[6]],
        proofImage: proofImages[4],
        status: AdStatus.PUBLISHED,
        amount: 2000,
        paymentMethod: 'Cash',
        paymentDetails: 'Cash payment at office',
        pageType: PageType.HOME,
      },
      {
        mainCategory: 'Automotive',
        categoryOne: 'Bikes',
        content:
          'Honda Activa 5G, 2020 model. Excellent condition, serviced regularly. Single owner. Price: Rs 65,000 negotiable.',
        contactOne: 9876543212,
        contactTwo: undefined,
        state: 'West Bengal',
        city: 'Kolkata',
        sid: 19,
        cid: 1006,
        postedBy: 'Bike Gallery',
        hasImages: true,
        imageFiles: [imageFiles[7], imageFiles[8]],
        proofImage: proofImages[5],
        status: AdStatus.PUBLISHED,
        amount: 1500,
        paymentMethod: 'Debit Card',
        paymentDetails: 'MasterCard ending in 5678',
        pageType: PageType.CATEGORY,
      },

      {
        mainCategory: 'Services',
        categoryOne: 'Home Services',
        content:
          'Professional AC repair & servicing. All brands. 24/7 service. Experienced technicians. Warranty provided. Call now!',
        contactOne: 7788996655,
        contactTwo: 9988776644,
        state: 'Gujarat',
        city: 'Ahmedabad',
        sid: 24,
        cid: 1007,
        postedBy: 'CoolAir Services',
        hasImages: false,
        imageFiles: [],
        proofImage: proofImages[6],
        status: AdStatus.PUBLISHED,
        amount: 800,
        paymentMethod: 'UPI',
        paymentDetails: 'UPI ID: coolair@gpay',
        pageType: PageType.HOME,
      },
      {
        mainCategory: 'Services',
        categoryOne: 'Professional Services',
        content:
          'CA Services - Income Tax, GST, Company Registration, Audit. 15+ years experience. Reasonable rates. Free consultation.',
        contactOne: 9876543213,
        contactTwo: undefined,
        state: 'Rajasthan',
        city: 'Jaipur',
        sid: 8,
        cid: 1008,
        postedBy: 'Tax Solutions',
        hasImages: false,
        imageFiles: [],
        proofImage: proofImages[7],
        status: AdStatus.PUBLISHED,
        amount: 1200,
        paymentMethod: 'Bank Transfer',
        paymentDetails: 'RTGS Transfer - REF123789',
        pageType: PageType.CATEGORY,
      },

      {
        mainCategory: 'Electronics',
        categoryOne: 'Mobile Phones',
        content:
          'iPhone 13 128GB for sale. 11 months old, excellent condition. Bill & box available. No scratches. Price: Rs 55,000.',
        contactOne: 8877665511,
        contactTwo: 7766554422,
        state: 'Punjab',
        city: 'Chandigarh',
        sid: 4,
        cid: 1009,
        postedBy: 'Mobile Hub',
        hasImages: true,
        imageFiles: [imageFiles[9], imageFiles[10]],
        proofImage: proofImages[0],
        status: AdStatus.PUBLISHED,
        amount: 1800,
        paymentMethod: 'Credit Card',
        paymentDetails: 'American Express ending in 9012',
        pageType: PageType.HOME,
      },
      {
        mainCategory: 'Electronics',
        categoryOne: 'Laptops',
        content:
          'Dell Inspiron 15 - Intel i5, 8GB RAM, 512GB SSD. Perfect for work & study. 2 years warranty remaining.',
        contactOne: 9988776633,
        contactTwo: undefined,
        state: 'Telangana',
        city: 'Hyderabad',
        sid: 36,
        cid: 1010,
        postedBy: 'Laptop Store',
        hasImages: true,
        imageFiles: [imageFiles[11], imageFiles[12]],
        proofImage: proofImages[1],
        status: AdStatus.HOLD,
        amount: 2200,
        paymentMethod: 'UPI',
        paymentDetails: 'UPI ID: laptopstore@paytm',
        pageType: PageType.CATEGORY,
      },

      {
        mainCategory: 'Fashion',
        categoryOne: "Women's Clothing",
        content:
          'Designer sarees collection. Wedding & party wear. Premium quality silk. Direct from manufacturer. Wholesale rates available.',
        contactOne: 7766554411,
        contactTwo: 8877665522,
        state: 'Uttar Pradesh',
        city: 'Varanasi',
        sid: 9,
        cid: 1011,
        postedBy: 'Silk Palace',
        hasImages: true,
        imageFiles: [imageFiles[13], imageFiles[14]],
        proofImage: proofImages[2],
        status: AdStatus.PUBLISHED,
        amount: 1600,
        paymentMethod: 'Cash',
        paymentDetails: 'Cash payment at shop',
        pageType: PageType.HOME,
      },
      {
        mainCategory: 'Fashion',
        categoryOne: "Men's Clothing",
        content:
          'Branded shirts & trousers. Formal & casual wear. All sizes available. Best quality at reasonable prices. Home delivery.',
        contactOne: 9876543214,
        contactTwo: undefined,
        state: 'Kerala',
        city: 'Kochi',
        sid: 32,
        cid: 1012,
        postedBy: 'Fashion Point',
        hasImages: false,
        imageFiles: [],
        proofImage: proofImages[3],
        status: AdStatus.YET_TO_BE_PUBLISHED,
        amount: 1400,
        paymentMethod: 'Debit Card',
        paymentDetails: 'Rupay ending in 3456',
        pageType: PageType.CATEGORY,
      },

      {
        mainCategory: 'Education',
        categoryOne: 'Tuitions',
        content:
          'Mathematics & Physics tuition for 11th & 12th. IIT JEE preparation. 10+ years experience. Online & offline classes.',
        contactOne: 8877665533,
        contactTwo: 7766554444,
        state: 'Madhya Pradesh',
        city: 'Indore',
        sid: 23,
        cid: 1013,
        postedBy: 'Success Academy',
        hasImages: false,
        imageFiles: [],
        proofImage: proofImages[4],
        status: AdStatus.PUBLISHED,
        amount: 1000,
        paymentMethod: 'UPI',
        paymentDetails: 'UPI ID: successacademy@phonepe',
        pageType: PageType.HOME,
      },
      {
        mainCategory: 'Education',
        categoryOne: 'Coaching Classes',
        content:
          'UPSC Civil Services coaching. Experienced faculty, study material provided. Demo class available. Limited seats.',
        contactOne: 9876543215,
        contactTwo: undefined,
        state: 'Delhi',
        city: 'New Delhi',
        sid: 7,
        cid: 1014,
        postedBy: 'Elite IAS Academy',
        hasImages: false,
        imageFiles: [],
        proofImage: proofImages[5],
        status: AdStatus.DRAFT,
        amount: 2500,
        paymentMethod: 'Bank Transfer',
        paymentDetails: 'IMPS Transfer - REF654321',
        pageType: PageType.CATEGORY,
      },

      {
        mainCategory: 'Health & Beauty',
        categoryOne: 'Beauty Products',
        content:
          'Skincare products - Natural & organic. Anti-aging creams, face wash, moisturizers. All skin types. Chemical-free.',
        contactOne: 7788996644,
        contactTwo: 9988776655,
        state: 'Goa',
        city: 'Panaji',
        sid: 30,
        cid: 1015,
        postedBy: 'Natural Glow',
        hasImages: true,
        imageFiles: [imageFiles[15], imageFiles[16]],
        proofImage: proofImages[6],
        status: AdStatus.PUBLISHED,
        amount: 1300,
        paymentMethod: 'Credit Card',
        paymentDetails: 'Visa ending in 7890',
        pageType: PageType.HOME,
      },
      {
        mainCategory: 'Health & Beauty',
        categoryOne: 'Fitness',
        content:
          'Personal trainer available. Weight loss, muscle building, yoga. Home visits. Certified trainer with 5+ years experience.',
        contactOne: 8877665544,
        contactTwo: undefined,
        state: 'Odisha',
        city: 'Bhubaneswar',
        sid: 21,
        cid: 1016,
        postedBy: 'Fitness Pro',
        hasImages: false,
        imageFiles: [],
        proofImage: proofImages[7],
        status: AdStatus.REJECTED,
        amount: 900,
        paymentMethod: 'UPI',
        paymentDetails: 'UPI ID: fitnesspro@gpay',
        pageType: PageType.CATEGORY,
      },

      {
        mainCategory: 'Home & Garden',
        categoryOne: 'Furniture',
        content:
          'Wooden dining table set for sale. 6 seater, excellent condition. Teak wood, carved design. Must sell urgently.',
        contactOne: 9876543216,
        contactTwo: 8765432111,
        state: 'Assam',
        city: 'Guwahati',
        sid: 18,
        cid: 1017,
        postedBy: 'Wood Craft',
        hasImages: true,
        imageFiles: [imageFiles[17], imageFiles[18]],
        proofImage: proofImages[0],
        status: AdStatus.PUBLISHED,
        amount: 1700,
        paymentMethod: 'Cash',
        paymentDetails: 'Cash on delivery',
        pageType: PageType.HOME,
      },
      {
        mainCategory: 'Home & Garden',
        categoryOne: 'Appliances',
        content:
          'Samsung refrigerator 265L, double door. 3 years old, working perfectly. Moving out sale. Price negotiable.',
        contactOne: 7766554433,
        contactTwo: undefined,
        state: 'Jharkhand',
        city: 'Ranchi',
        sid: 20,
        cid: 1018,
        postedBy: 'Home Appliances',
        hasImages: true,
        imageFiles: [imageFiles[19], imageFiles[20]],
        proofImage: proofImages[1],
        status: AdStatus.PUBLISHED,
        amount: 1200,
        paymentMethod: 'UPI',
        paymentDetails: 'UPI ID: homeappliances@paytm',
        pageType: PageType.CATEGORY,
      },

      {
        mainCategory: 'Sports & Fitness',
        categoryOne: 'Gym Equipment',
        content:
          'Home gym setup for sale. Dumbbells, bench, barbell set. Excellent condition. Complete package deal available.',
        contactOne: 8877665555,
        contactTwo: 7766554466,
        state: 'Bihar',
        city: 'Patna',
        sid: 10,
        cid: 1019,
        postedBy: 'Fitness Equipment',
        hasImages: true,
        imageFiles: [imageFiles[21], imageFiles[22]],
        proofImage: proofImages[2],
        status: AdStatus.PUBLISHED,
        amount: 1400,
        paymentMethod: 'Bank Transfer',
        paymentDetails: 'NEFT Transfer - REF789456',
        pageType: PageType.HOME,
      },
      {
        mainCategory: 'Sports & Fitness',
        categoryOne: 'Sports Coaching',
        content:
          'Cricket coaching for kids & adults. Professional coach, group & individual sessions. Ground available. Weekend batches.',
        contactOne: 9876543217,
        contactTwo: undefined,
        state: 'Uttarakhand',
        city: 'Dehradun',
        sid: 5,
        cid: 1020,
        postedBy: 'Cricket Academy',
        hasImages: false,
        imageFiles: [],
        proofImage: proofImages[3],
        status: AdStatus.FOR_REVIEW,
        amount: 800,
        paymentMethod: 'Cash',
        paymentDetails: 'Cash payment monthly',
        pageType: PageType.CATEGORY,
      },

      {
        mainCategory: 'Food & Beverages',
        categoryOne: 'Restaurants',
        content:
          'New restaurant opening! Best North Indian cuisine. Family restaurant, home delivery available. Grand opening discounts.',
        contactOne: 7788996666,
        contactTwo: 8877665577,
        state: 'Himachal Pradesh',
        city: 'Shimla',
        sid: 2,
        cid: 1021,
        postedBy: 'Spice Garden',
        hasImages: false,
        imageFiles: [],
        proofImage: proofImages[4],
        status: AdStatus.PUBLISHED,
        amount: 1500,
        paymentMethod: 'UPI',
        paymentDetails: 'UPI ID: spicegarden@phonepe',
        pageType: PageType.HOME,
      },
      {
        mainCategory: 'Food & Beverages',
        categoryOne: 'Catering',
        content:
          'Wedding catering services. Multi-cuisine menu, experienced chefs. Packages for 50-500 guests. Free tasting session.',
        contactOne: 9876543218,
        contactTwo: undefined,
        state: 'Chhattisgarh',
        city: 'Raipur',
        sid: 22,
        cid: 1022,
        postedBy: 'Royal Caterers',
        hasImages: true,
        imageFiles: [imageFiles[23], imageFiles[24]],
        proofImage: proofImages[5],
        status: AdStatus.PUBLISHED,
        amount: 2000,
        paymentMethod: 'Credit Card',
        paymentDetails: 'MasterCard ending in 2468',
        pageType: PageType.CATEGORY,
      },

      {
        mainCategory: 'Entertainment',
        categoryOne: 'Events',
        content:
          'DJ services for parties & weddings. Latest sound system, lighting available. Experienced DJ, all types of music.',
        contactOne: 8877665588,
        contactTwo: 7766554499,
        state: 'Tripura',
        city: 'Agartala',
        sid: 16,
        cid: 1023,
        postedBy: 'Sound Waves',
        hasImages: false,
        imageFiles: [],
        proofImage: proofImages[6],
        status: AdStatus.HOLD,
        amount: 1100,
        paymentMethod: 'UPI',
        paymentDetails: 'UPI ID: soundwaves@gpay',
        pageType: PageType.HOME,
      },
      {
        mainCategory: 'Entertainment',
        categoryOne: 'Music',
        content:
          'Guitar classes - Acoustic & electric. Beginner to advanced levels. Music theory included. Group & individual lessons.',
        contactOne: 9876543219,
        contactTwo: undefined,
        state: 'Nagaland',
        city: 'Kohima',
        sid: 17,
        cid: 1024,
        postedBy: 'Music School',
        hasImages: true,
        imageFiles: [imageFiles[25]],
        proofImage: proofImages[7],
        status: AdStatus.PUBLISHED,
        amount: 900,
        paymentMethod: 'Cash',
        paymentDetails: 'Monthly fee payment',
        pageType: PageType.CATEGORY,
      },

      {
        mainCategory: 'Services',
        categoryOne: 'Legal Services',
        content:
          'Advocate services - Civil, criminal, family matters. High court practice. Consultation available. Reasonable fees.',
        contactOne: 7788996677,
        contactTwo: undefined,
        state: 'Manipur',
        city: 'Imphal',
        sid: 14,
        cid: 1025,
        postedBy: 'Legal Aid',
        hasImages: false,
        imageFiles: [],
        proofImage: proofImages[0],
        status: AdStatus.PUBLISHED,
        amount: 1800,
        paymentMethod: 'Bank Transfer',
        paymentDetails: 'RTGS Transfer - REF456123',
        pageType: PageType.HOME,
      },
      {
        mainCategory: 'Electronics',
        categoryOne: 'Gaming',
        content:
          'PS5 console for sale with 5 games. 1 year old, warranty remaining. Extra controller included. Genuine buyer contact.',
        contactOne: 8877665599,
        contactTwo: 9988776688,
        state: 'Arunachal Pradesh',
        city: 'Itanagar',
        sid: 12,
        cid: 1026,
        postedBy: 'Game Zone',
        hasImages: true,
        imageFiles: [imageFiles[26]],
        proofImage: proofImages[1],
        status: AdStatus.DRAFT,
        amount: 2500,
        paymentMethod: 'UPI',
        paymentDetails: 'UPI ID: gamezone@paytm',
        pageType: PageType.CATEGORY,
      },
      {
        mainCategory: 'Jobs',
        categoryOne: 'Part Time Jobs',
        content:
          'Data entry work from home. Flexible timing, weekly payment. Computer & internet required. Students welcome.',
        contactOne: 9876543220,
        contactTwo: undefined,
        state: 'Mizoram',
        city: 'Aizawl',
        sid: 15,
        cid: 1027,
        postedBy: 'Work From Home',
        hasImages: false,
        imageFiles: [],
        proofImage: proofImages[2],
        status: AdStatus.REJECTED,
        amount: 600,
        paymentMethod: 'UPI',
        paymentDetails: 'UPI ID: workfromhome@phonepe',
        pageType: PageType.HOME,
      },
    ];

    for (const adData of lineAdsData) {
      const mainCategory = createdCategories.find(
        (c) => c.name === adData.mainCategory,
      );
      const categoryOne = categoryOneMap.get(
        `${adData.mainCategory}-${adData.categoryOne}`,
      );

      const adImages: Image[] = [];
      if (adData.hasImages && adData.imageFiles.length > 0) {
        for (const imageFile of adData.imageFiles) {
          const adImage = imageRepo.create({
            fileName: imageFile,
            filePath: `uploads/${imageFile}`,
            isTemp: false,
          });
          await imageRepo.save(adImage);
          adImages.push(adImage);
        }
      }

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
        adType: AdType.LINE,
        pageType: adData.pageType,
      });
      await adPositionRepo.save(adPosition);

      const dates: string[] = [];
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }

      const lineAd = lineAdRepo.create({
        customer: customer,
        mainCategory: mainCategory,
        categoryOne: categoryOne,
        content: adData.content,
        images: adImages,
        payment: payment,
        position: adPosition,
        state: adData.state,
        city: adData.city,
        sid: adData.sid,
        cid: adData.cid,
        postedBy: adData.postedBy,
        contactOne: adData.contactOne,
        contactTwo: adData.contactTwo,
        dates: dates,
        status: adData.status,
        isActive: true,
      });

      await lineAdRepo.save(lineAd);
      const imageCount = adImages.length;
      const imageText =
        imageCount > 0 ? `with ${imageCount} image(s)` : 'without images';
      console.log(
        `Created line ad for ${adData.postedBy} in ${adData.city} (${imageText})`,
      );
    }

    console.log('Line Ad seeder completed successfully!');
  }
}
