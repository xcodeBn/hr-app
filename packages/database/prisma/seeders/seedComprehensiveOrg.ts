import { PrismaClient } from '../../src/generated/prisma/client';
import { hash } from '@node-rs/argon2';

/**
 * Seeds a comprehensive organization with complete data across all database entities
 * Organization: GlobalTech Industries
 * A multinational technology company with complete organizational structure
 */
export async function seedComprehensiveOrg(prisma: PrismaClient) {
  console.log('Seeding comprehensive organization: GlobalTech Industries...');

  // Get super admin for approval
  const superAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });

  if (!superAdmin) {
    throw new Error('Super admin not found. Please seed super admins first.');
  }

  // 1. Create Organization Admin
  const orgAdmin = await prisma.user.create({
    data: {
      email: 'admin@globaltech.com',
      name: 'Jennifer Thompson',
      isConfirmed: true,
      role: 'ORG_ADMIN',
    },
  });

  // Create password for org admin
  await prisma.password.create({
    data: {
      userId: orgAdmin.id,
      hashedPassword: await hash('Admin@2026'),
    },
  });

  // Create profile for org admin
  await prisma.userProfile.create({
    data: {
      userId: orgAdmin.id,
      dateOfBirth: new Date('1985-03-15'),
      gender: 'FEMALE',
      phoneNumber: '+1-555-0100',
      street1: '789 Executive Plaza',
      city: 'San Francisco',
      state: 'California',
      postalCode: '94105',
      country: 'United States',
      timezone: 'America/Los_Angeles',
      maritalStatus: 'MARRIED',
      nationality: 'American',
    },
  });

  // 2. Create Organization
  const organization = await prisma.organization.create({
    data: {
      name: 'GlobalTech Industries',
      description:
        'A leading multinational technology corporation specializing in enterprise software solutions, cloud computing infrastructure, and artificial intelligence research. With over 5,000 employees worldwide, GlobalTech delivers innovative solutions to Fortune 500 companies across various industries.',
      website: 'https://globaltech-industries.com',
      status: 'ACTIVE',
      createdById: orgAdmin.id,
      approvedById: superAdmin.id,
      createdAt: new Date('2020-01-15'),
      approvedAt: new Date('2020-01-20'),
    },
  });

  // Link org admin to organization
  await prisma.user.update({
    where: { id: orgAdmin.id },
    data: { organizationId: organization.id },
  });

  // 3. Create Branches
  const headquarters = await prisma.branch.create({
    data: {
      organizationId: organization.id,
      name: 'Headquarters',
      street1: '1000 Technology Drive',
      city: 'San Francisco',
      state: 'California',
      postalCode: '94105',
      country: 'United States',
      phoneNumber: '+1-555-0101',
      email: 'hq@globaltech.com',
    },
  });

  const asiaPacific = await prisma.branch.create({
    data: {
      organizationId: organization.id,
      name: 'Asia Pacific Office',
      street1: '88 Marina Boulevard',
      street2: 'Level 25',
      city: 'Singapore',
      postalCode: '018981',
      country: 'Singapore',
      phoneNumber: '+65-6555-0200',
      email: 'apac@globaltech.com',
    },
  });

  const europeanOffice = await prisma.branch.create({
    data: {
      organizationId: organization.id,
      name: 'European Headquarters',
      street1: 'Alexanderplatz 15',
      city: 'Berlin',
      postalCode: '10178',
      country: 'Germany',
      phoneNumber: '+49-30-5555-0300',
      email: 'eu@globaltech.com',
    },
  });

  // 4. Create Departments
  const engineeringDept = await prisma.department.create({
    data: {
      branchId: headquarters.id,
      name: 'Engineering',
      description:
        'Software development, architecture, and technical innovation team',
    },
  });

  const productDept = await prisma.department.create({
    data: {
      branchId: headquarters.id,
      name: 'Product Management',
      description:
        'Product strategy, roadmap planning, and stakeholder management',
    },
  });

  const hrDept = await prisma.department.create({
    data: {
      branchId: headquarters.id,
      name: 'Human Resources',
      description:
        'Talent acquisition, employee relations, and organizational development',
    },
  });

  const financeDept = await prisma.department.create({
    data: {
      branchId: headquarters.id,
      name: 'Finance',
      description:
        'Financial planning, accounting, and corporate finance operations',
    },
  });

  const marketingDept = await prisma.department.create({
    data: {
      branchId: headquarters.id,
      name: 'Marketing',
      description:
        'Brand strategy, digital marketing, and customer acquisition',
    },
  });

  const salesDept = await prisma.department.create({
    data: {
      branchId: headquarters.id,
      name: 'Sales',
      description:
        'Enterprise sales, account management, and business development',
    },
  });

  const apacEngineering = await prisma.department.create({
    data: {
      branchId: asiaPacific.id,
      name: 'Engineering',
      description: 'Asia Pacific development team',
    },
  });

  const apacSales = await prisma.department.create({
    data: {
      branchId: asiaPacific.id,
      name: 'Sales',
      description: 'Asia Pacific sales and customer success',
    },
  });

  const euEngineering = await prisma.department.create({
    data: {
      branchId: europeanOffice.id,
      name: 'Engineering',
      description: 'European development team',
    },
  });

  // 5. Create Job Titles
  const jobTitles = await Promise.all([
    prisma.jobTitles.create({ data: { title: 'Chief Technology Officer' } }),
    prisma.jobTitles.create({ data: { title: 'Engineering Manager' } }),
    prisma.jobTitles.create({ data: { title: 'Senior Software Engineer' } }),
    prisma.jobTitles.create({ data: { title: 'Software Engineer' } }),
    prisma.jobTitles.create({ data: { title: 'Junior Software Engineer' } }),
    prisma.jobTitles.create({ data: { title: 'Product Manager' } }),
    prisma.jobTitles.create({ data: { title: 'Senior Product Manager' } }),
    prisma.jobTitles.create({ data: { title: 'UX Designer' } }),
    prisma.jobTitles.create({ data: { title: 'HR Manager' } }),
    prisma.jobTitles.create({ data: { title: 'HR Specialist' } }),
    prisma.jobTitles.create({ data: { title: 'Financial Controller' } }),
    prisma.jobTitles.create({ data: { title: 'Senior Accountant' } }),
    prisma.jobTitles.create({ data: { title: 'Marketing Director' } }),
    prisma.jobTitles.create({ data: { title: 'Content Strategist' } }),
    prisma.jobTitles.create({ data: { title: 'Sales Director' } }),
    prisma.jobTitles.create({ data: { title: 'Account Executive' } }),
    prisma.jobTitles.create({ data: { title: 'DevOps Engineer' } }),
    prisma.jobTitles.create({ data: { title: 'QA Engineer' } }),
    prisma.jobTitles.create({ data: { title: 'Data Scientist' } }),
    prisma.jobTitles.create({ data: { title: 'Technical Writer' } }),
  ]);

  const [
    cto,
    engManager,
    seniorSwe,
    swe,
    juniorSwe,
    productManager,
    seniorPm,
    uxDesigner,
    hrManager,
    hrSpecialist,
    financialController,
    seniorAccountant,
    marketingDirector,
    contentStrategist,
    salesDirector,
    accountExec,
    devopsEngineer,
    qaEngineer,
    dataScientist,
    technicalWriter,
  ] = jobTitles;

  // 6. Create Work Schedule
  const standardSchedule = await prisma.workSchedule.create({
    data: {
      organizationId: organization.id,
      name: 'Standard Full-Time Schedule',
      scheduleType: 'TIME_BASED',
      isDefault: true,
      standardHoursPerDay: 8.0,
      totalWeeklyHours: 40.0,
      effectiveFrom: new Date('2020-01-15'),
      isActive: true,
      dailySchedules: {
        create: [
          {
            dayOfWeek: 1,
            hoursPerDay: 8.0,
            startTime: '09:00',
            endTime: '17:00',
            isWorkingDay: true,
          },
          {
            dayOfWeek: 2,
            hoursPerDay: 8.0,
            startTime: '09:00',
            endTime: '17:00',
            isWorkingDay: true,
          },
          {
            dayOfWeek: 3,
            hoursPerDay: 8.0,
            startTime: '09:00',
            endTime: '17:00',
            isWorkingDay: true,
          },
          {
            dayOfWeek: 4,
            hoursPerDay: 8.0,
            startTime: '09:00',
            endTime: '17:00',
            isWorkingDay: true,
          },
          {
            dayOfWeek: 5,
            hoursPerDay: 8.0,
            startTime: '09:00',
            endTime: '17:00',
            isWorkingDay: true,
          },
          { dayOfWeek: 6, hoursPerDay: 0.0, isWorkingDay: false },
          { dayOfWeek: 0, hoursPerDay: 0.0, isWorkingDay: false },
        ],
      },
    },
  });

  const flexibleSchedule = await prisma.workSchedule.create({
    data: {
      organizationId: organization.id,
      name: 'Flexible Remote Schedule',
      scheduleType: 'DURATION_BASED',
      isDefault: false,
      totalWeeklyHours: 40.0,
      effectiveFrom: new Date('2020-01-15'),
      isActive: true,
      dailySchedules: {
        create: [
          { dayOfWeek: 1, hoursPerDay: 8.0, isWorkingDay: true },
          { dayOfWeek: 2, hoursPerDay: 8.0, isWorkingDay: true },
          { dayOfWeek: 3, hoursPerDay: 8.0, isWorkingDay: true },
          { dayOfWeek: 4, hoursPerDay: 8.0, isWorkingDay: true },
          { dayOfWeek: 5, hoursPerDay: 8.0, isWorkingDay: true },
          { dayOfWeek: 6, hoursPerDay: 0.0, isWorkingDay: false },
          { dayOfWeek: 0, hoursPerDay: 0.0, isWorkingDay: false },
        ],
      },
    },
  });

  // 7. Create Employees with Complete Data

  // CTO
  const ctoUser = await prisma.user.create({
    data: {
      email: 'david.chen@globaltech.com',
      name: 'David Chen',
      isConfirmed: true,
      role: 'EMPLOYEE',
      organizationId: organization.id,
      departmentId: engineeringDept.id,
      profile: {
        create: {
          dateOfBirth: new Date('1982-07-20'),
          gender: 'MALE',
          phoneNumber: '+1-555-0201',
          street1: '450 Pacific Heights',
          city: 'San Francisco',
          state: 'California',
          postalCode: '94109',
          country: 'United States',
          timezone: 'America/Los_Angeles',
          maritalStatus: 'MARRIED',
          nationality: 'American',
          emergencyContactName: 'Lisa Chen',
          emergencyContactPhone: '+1-555-0202',
          emergencyContactRelation: 'Spouse',
        },
      },
    },
  });

  await prisma.password.create({
    data: {
      userId: ctoUser.id,
      hashedPassword: await hash('SecurePass2026'),
    },
  });

  await prisma.employment.create({
    data: {
      userId: ctoUser.id,
      employeeId: 'GT001',
      jobTitleId: cto.id,
      employmentType: 'FULLTIME',
      departmentId: engineeringDept.id,
      effectiveDate: new Date('2020-02-01'),
      isActive: true,
    },
  });

  await prisma.contract.create({
    data: {
      userId: ctoUser.id,
      contractNumber: 'GT-2020-001',
      contractName: 'Executive Employment Agreement',
      contractType: 'FULLTIME_PERMANENT',
      startDate: new Date('2020-02-01'),
      isActive: true,
    },
  });

  await prisma.userWorkSchedule.create({
    data: {
      userId: ctoUser.id,
      scheduleId: flexibleSchedule.id,
      isActive: true,
    },
  });

  // Engineering Manager
  const engManagerUser = await prisma.user.create({
    data: {
      email: 'sarah.williams@globaltech.com',
      name: 'Sarah Williams',
      isConfirmed: true,
      role: 'EMPLOYEE',
      organizationId: organization.id,
      departmentId: engineeringDept.id,
      profile: {
        create: {
          dateOfBirth: new Date('1988-11-05'),
          gender: 'FEMALE',
          phoneNumber: '+1-555-0203',
          street1: '123 Marina Boulevard',
          city: 'San Francisco',
          state: 'California',
          postalCode: '94111',
          country: 'United States',
          timezone: 'America/Los_Angeles',
          maritalStatus: 'SINGLE',
          nationality: 'American',
          emergencyContactName: 'Robert Williams',
          emergencyContactPhone: '+1-555-0204',
          emergencyContactRelation: 'Father',
        },
      },
    },
  });

  await prisma.password.create({
    data: {
      userId: engManagerUser.id,
      hashedPassword: await hash('SecurePass2026'),
    },
  });

  await prisma.employment.create({
    data: {
      userId: engManagerUser.id,
      employeeId: 'GT002',
      jobTitleId: engManager.id,
      employmentType: 'FULLTIME',
      lineManagerId: ctoUser.id,
      departmentId: engineeringDept.id,
      effectiveDate: new Date('2020-03-15'),
      isActive: true,
    },
  });

  await prisma.contract.create({
    data: {
      userId: engManagerUser.id,
      contractNumber: 'GT-2020-002',
      contractName: 'Management Employment Contract',
      contractType: 'FULLTIME_PERMANENT',
      startDate: new Date('2020-03-15'),
      isActive: true,
    },
  });

  await prisma.userWorkSchedule.create({
    data: {
      userId: engManagerUser.id,
      scheduleId: standardSchedule.id,
      isActive: true,
    },
  });

  // Senior Software Engineers
  const seniorEngineers = [];
  const seniorEngineerData = [
    {
      email: 'michael.rodriguez@globaltech.com',
      name: 'Michael Rodriguez',
      dateOfBirth: new Date('1990-04-12'),
      gender: 'MALE' as const,
      phone: '+1-555-0205',
      employeeId: 'GT003',
    },
    {
      email: 'emily.zhang@globaltech.com',
      name: 'Emily Zhang',
      dateOfBirth: new Date('1989-08-23'),
      gender: 'FEMALE' as const,
      phone: '+1-555-0206',
      employeeId: 'GT004',
    },
    {
      email: 'james.miller@globaltech.com',
      name: 'James Miller',
      dateOfBirth: new Date('1987-12-30'),
      gender: 'MALE' as const,
      phone: '+1-555-0207',
      employeeId: 'GT005',
    },
  ];

  for (const data of seniorEngineerData) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        isConfirmed: true,
        role: 'EMPLOYEE',
        organizationId: organization.id,
        departmentId: engineeringDept.id,
        profile: {
          create: {
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            phoneNumber: data.phone,
            street1: '500 Market Street',
            city: 'San Francisco',
            state: 'California',
            postalCode: '94105',
            country: 'United States',
            timezone: 'America/Los_Angeles',
            maritalStatus: 'SINGLE',
            nationality: 'American',
          },
        },
      },
    });

    await prisma.password.create({
      data: {
        userId: user.id,
        hashedPassword: await hash('SecurePass2026'),
      },
    });

    await prisma.employment.create({
      data: {
        userId: user.id,
        employeeId: data.employeeId,
        jobTitleId: seniorSwe.id,
        employmentType: 'FULLTIME',
        lineManagerId: engManagerUser.id,
        departmentId: engineeringDept.id,
        effectiveDate: new Date('2021-01-10'),
        isActive: true,
      },
    });

    await prisma.contract.create({
      data: {
        userId: user.id,
        contractNumber: `GT-2021-${data.employeeId.slice(2)}`,
        contractName: 'Employment Contract',
        contractType: 'FULLTIME_PERMANENT',
        startDate: new Date('2021-01-10'),
        isActive: true,
      },
    });

    await prisma.userWorkSchedule.create({
      data: {
        userId: user.id,
        scheduleId: standardSchedule.id,
        isActive: true,
      },
    });

    seniorEngineers.push(user);
  }

  // Software Engineers
  const engineers = [];
  const engineerData = [
    {
      email: 'alex.patel@globaltech.com',
      name: 'Alex Patel',
      dateOfBirth: new Date('1993-02-18'),
      gender: 'MALE' as const,
      phone: '+1-555-0208',
      employeeId: 'GT006',
    },
    {
      email: 'sophia.martinez@globaltech.com',
      name: 'Sophia Martinez',
      dateOfBirth: new Date('1994-06-25'),
      gender: 'FEMALE' as const,
      phone: '+1-555-0209',
      employeeId: 'GT007',
    },
    {
      email: 'daniel.lee@globaltech.com',
      name: 'Daniel Lee',
      dateOfBirth: new Date('1992-09-14'),
      gender: 'MALE' as const,
      phone: '+1-555-0210',
      employeeId: 'GT008',
    },
    {
      email: 'olivia.brown@globaltech.com',
      name: 'Olivia Brown',
      dateOfBirth: new Date('1995-03-07'),
      gender: 'FEMALE' as const,
      phone: '+1-555-0211',
      employeeId: 'GT009',
    },
  ];

  for (const data of engineerData) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        isConfirmed: true,
        role: 'EMPLOYEE',
        organizationId: organization.id,
        departmentId: engineeringDept.id,
        profile: {
          create: {
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            phoneNumber: data.phone,
            street1: '600 Mission Street',
            city: 'San Francisco',
            state: 'California',
            postalCode: '94105',
            country: 'United States',
            timezone: 'America/Los_Angeles',
            maritalStatus: 'SINGLE',
            nationality: 'American',
          },
        },
      },
    });

    await prisma.password.create({
      data: {
        userId: user.id,
        hashedPassword: await hash('SecurePass2026'),
      },
    });

    await prisma.employment.create({
      data: {
        userId: user.id,
        employeeId: data.employeeId,
        jobTitleId: swe.id,
        employmentType: 'FULLTIME',
        lineManagerId: engManagerUser.id,
        departmentId: engineeringDept.id,
        effectiveDate: new Date('2022-06-01'),
        isActive: true,
      },
    });

    await prisma.contract.create({
      data: {
        userId: user.id,
        contractNumber: `GT-2022-${data.employeeId.slice(2)}`,
        contractName: 'Employment Contract',
        contractType: 'FULLTIME_PERMANENT',
        startDate: new Date('2022-06-01'),
        isActive: true,
      },
    });

    await prisma.userWorkSchedule.create({
      data: {
        userId: user.id,
        scheduleId: standardSchedule.id,
        isActive: true,
      },
    });

    engineers.push(user);
  }

  // Product Team
  const productManagerUser = await prisma.user.create({
    data: {
      email: 'rachel.kim@globaltech.com',
      name: 'Rachel Kim',
      isConfirmed: true,
      role: 'EMPLOYEE',
      organizationId: organization.id,
      departmentId: productDept.id,
      profile: {
        create: {
          dateOfBirth: new Date('1991-05-15'),
          gender: 'FEMALE',
          phoneNumber: '+1-555-0212',
          street1: '200 California Street',
          city: 'San Francisco',
          state: 'California',
          postalCode: '94111',
          country: 'United States',
          timezone: 'America/Los_Angeles',
          maritalStatus: 'MARRIED',
          nationality: 'American',
        },
      },
    },
  });

  await prisma.password.create({
    data: {
      userId: productManagerUser.id,
      hashedPassword: await hash('SecurePass2026'),
    },
  });

  await prisma.employment.create({
    data: {
      userId: productManagerUser.id,
      employeeId: 'GT010',
      jobTitleId: seniorPm.id,
      employmentType: 'FULLTIME',
      departmentId: productDept.id,
      effectiveDate: new Date('2020-09-01'),
      isActive: true,
    },
  });

  await prisma.contract.create({
    data: {
      userId: productManagerUser.id,
      contractNumber: 'GT-2020-010',
      contractName: 'Employment Contract',
      contractType: 'FULLTIME_PERMANENT',
      startDate: new Date('2020-09-01'),
      isActive: true,
    },
  });

  await prisma.userWorkSchedule.create({
    data: {
      userId: productManagerUser.id,
      scheduleId: standardSchedule.id,
      isActive: true,
    },
  });

  // UX Designer
  const uxDesignerUser = await prisma.user.create({
    data: {
      email: 'marcus.johnson@globaltech.com',
      name: 'Marcus Johnson',
      isConfirmed: true,
      role: 'EMPLOYEE',
      organizationId: organization.id,
      departmentId: productDept.id,
      profile: {
        create: {
          dateOfBirth: new Date('1993-10-22'),
          gender: 'MALE',
          phoneNumber: '+1-555-0213',
          street1: '800 Howard Street',
          city: 'San Francisco',
          state: 'California',
          postalCode: '94103',
          country: 'United States',
          timezone: 'America/Los_Angeles',
          maritalStatus: 'SINGLE',
          nationality: 'American',
        },
      },
    },
  });

  await prisma.password.create({
    data: {
      userId: uxDesignerUser.id,
      hashedPassword: await hash('SecurePass2026'),
    },
  });

  await prisma.employment.create({
    data: {
      userId: uxDesignerUser.id,
      employeeId: 'GT011',
      jobTitleId: uxDesigner.id,
      employmentType: 'FULLTIME',
      lineManagerId: productManagerUser.id,
      departmentId: productDept.id,
      effectiveDate: new Date('2021-03-15'),
      isActive: true,
    },
  });

  await prisma.contract.create({
    data: {
      userId: uxDesignerUser.id,
      contractNumber: 'GT-2021-011',
      contractName: 'Employment Contract',
      contractType: 'FULLTIME_PERMANENT',
      startDate: new Date('2021-03-15'),
      isActive: true,
    },
  });

  await prisma.userWorkSchedule.create({
    data: {
      userId: uxDesignerUser.id,
      scheduleId: flexibleSchedule.id,
      isActive: true,
    },
  });

  // HR Manager
  const hrManagerUser = await prisma.user.create({
    data: {
      email: 'patricia.anderson@globaltech.com',
      name: 'Patricia Anderson',
      isConfirmed: true,
      role: 'EMPLOYEE',
      organizationId: organization.id,
      departmentId: hrDept.id,
      profile: {
        create: {
          dateOfBirth: new Date('1986-01-30'),
          gender: 'FEMALE',
          phoneNumber: '+1-555-0214',
          street1: '350 Sansome Street',
          city: 'San Francisco',
          state: 'California',
          postalCode: '94104',
          country: 'United States',
          timezone: 'America/Los_Angeles',
          maritalStatus: 'DIVORCED',
          nationality: 'American',
        },
      },
    },
  });

  await prisma.password.create({
    data: {
      userId: hrManagerUser.id,
      hashedPassword: await hash('SecurePass2026'),
    },
  });

  await prisma.employment.create({
    data: {
      userId: hrManagerUser.id,
      employeeId: 'GT012',
      jobTitleId: hrManager.id,
      employmentType: 'FULLTIME',
      departmentId: hrDept.id,
      effectiveDate: new Date('2020-04-01'),
      isActive: true,
    },
  });

  await prisma.contract.create({
    data: {
      userId: hrManagerUser.id,
      contractNumber: 'GT-2020-012',
      contractName: 'Employment Contract',
      contractType: 'FULLTIME_PERMANENT',
      startDate: new Date('2020-04-01'),
      isActive: true,
    },
  });

  await prisma.userWorkSchedule.create({
    data: {
      userId: hrManagerUser.id,
      scheduleId: standardSchedule.id,
      isActive: true,
    },
  });

  // Sales and Marketing Teams
  const salesDirectorUser = await prisma.user.create({
    data: {
      email: 'thomas.white@globaltech.com',
      name: 'Thomas White',
      isConfirmed: true,
      role: 'EMPLOYEE',
      organizationId: organization.id,
      departmentId: salesDept.id,
      profile: {
        create: {
          dateOfBirth: new Date('1984-07-18'),
          gender: 'MALE',
          phoneNumber: '+1-555-0215',
          street1: '100 Pine Street',
          city: 'San Francisco',
          state: 'California',
          postalCode: '94111',
          country: 'United States',
          timezone: 'America/Los_Angeles',
          maritalStatus: 'MARRIED',
          nationality: 'American',
        },
      },
    },
  });

  await prisma.password.create({
    data: {
      userId: salesDirectorUser.id,
      hashedPassword: await hash('SecurePass2026'),
    },
  });

  await prisma.employment.create({
    data: {
      userId: salesDirectorUser.id,
      employeeId: 'GT013',
      jobTitleId: salesDirector.id,
      employmentType: 'FULLTIME',
      departmentId: salesDept.id,
      effectiveDate: new Date('2020-05-15'),
      isActive: true,
    },
  });

  await prisma.contract.create({
    data: {
      userId: salesDirectorUser.id,
      contractNumber: 'GT-2020-013',
      contractName: 'Executive Employment Contract',
      contractType: 'FULLTIME_PERMANENT',
      startDate: new Date('2020-05-15'),
      isActive: true,
    },
  });

  await prisma.userWorkSchedule.create({
    data: {
      userId: salesDirectorUser.id,
      scheduleId: flexibleSchedule.id,
      isActive: true,
    },
  });

  // APAC Engineers
  const apacEngineerUser = await prisma.user.create({
    data: {
      email: 'wei.tan@globaltech.com',
      name: 'Wei Tan',
      isConfirmed: true,
      role: 'EMPLOYEE',
      organizationId: organization.id,
      departmentId: apacEngineering.id,
      profile: {
        create: {
          dateOfBirth: new Date('1991-11-08'),
          gender: 'MALE',
          phoneNumber: '+65-9555-0220',
          street1: '10 Marina Boulevard',
          city: 'Singapore',
          postalCode: '018983',
          country: 'Singapore',
          timezone: 'Asia/Singapore',
          maritalStatus: 'SINGLE',
          nationality: 'Singaporean',
        },
      },
    },
  });

  await prisma.password.create({
    data: {
      userId: apacEngineerUser.id,
      hashedPassword: await hash('SecurePass2026'),
    },
  });

  await prisma.employment.create({
    data: {
      userId: apacEngineerUser.id,
      employeeId: 'GT014',
      jobTitleId: seniorSwe.id,
      employmentType: 'FULLTIME',
      departmentId: apacEngineering.id,
      effectiveDate: new Date('2021-08-01'),
      isActive: true,
    },
  });

  await prisma.contract.create({
    data: {
      userId: apacEngineerUser.id,
      contractNumber: 'GT-2021-014',
      contractName: 'Employment Contract',
      contractType: 'FULLTIME_PERMANENT',
      startDate: new Date('2021-08-01'),
      isActive: true,
    },
  });

  await prisma.userWorkSchedule.create({
    data: {
      userId: apacEngineerUser.id,
      scheduleId: standardSchedule.id,
      isActive: true,
    },
  });

  // 8. Create Sample Attendance Records
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  // Recent attendance for some employees
  await prisma.attendance.create({
    data: {
      userId: engineers[0].id,
      date: yesterday,
      clockIn: new Date(yesterday.setHours(9, 5, 0)),
      clockInLocation: 'San Francisco, CA',
      clockInTimezone: 'America/Los_Angeles',
      clockOut: new Date(yesterday.setHours(17, 30, 0)),
      clockOutLocation: 'San Francisco, CA',
      clockOutTimezone: 'America/Los_Angeles',
      scheduledHours: 8.0,
      loggedHours: 8.42,
      paidHours: 8.42,
      deficitHours: 0,
      overtimeHours: 0.42,
      status: 'COMPLETED',
    },
  });

  await prisma.attendance.create({
    data: {
      userId: engineers[1].id,
      date: yesterday,
      clockIn: new Date(yesterday.setHours(8, 55, 0)),
      clockInLocation: 'San Francisco, CA',
      clockInTimezone: 'America/Los_Angeles',
      clockOut: new Date(yesterday.setHours(17, 0, 0)),
      clockOutLocation: 'San Francisco, CA',
      clockOutTimezone: 'America/Los_Angeles',
      scheduledHours: 8.0,
      loggedHours: 8.08,
      paidHours: 8.08,
      deficitHours: 0,
      overtimeHours: 0.08,
      status: 'APPROVED',
    },
  });

  // 9. Create Sample Documents
  await prisma.documents.create({
    data: {
      userId: ctoUser.id,
      organizationId: organization.id,
      documentType: 'EMPLOYMENT_CONTRACT',
      fileName: 'David_Chen_Employment_Contract.pdf',
      fileUrl:
        'https://storage.globaltech.com/documents/contracts/GT-2020-001.pdf',
      fileSize: 524288,
      mimeType: 'application/pdf',
    },
  });

  await prisma.documents.create({
    data: {
      userId: engManagerUser.id,
      organizationId: organization.id,
      documentType: 'RESUME',
      fileName: 'Sarah_Williams_Resume.pdf',
      fileUrl:
        'https://storage.globaltech.com/documents/resumes/sarah_williams.pdf',
      fileSize: 245760,
      mimeType: 'application/pdf',
    },
  });

  await prisma.documents.create({
    data: {
      userId: productManagerUser.id,
      organizationId: organization.id,
      documentType: 'DEGREE_CERTIFICATE',
      fileName: 'Rachel_Kim_MBA_Certificate.pdf',
      fileUrl:
        'https://storage.globaltech.com/documents/certificates/rachel_kim_mba.pdf',
      fileSize: 1048576,
      mimeType: 'application/pdf',
    },
  });

  // 10. Create Audit Logs
  await prisma.auditLog.create({
    data: {
      organizationId: organization.id,
      userId: superAdmin.id,
      action: 'ORGANIZATION_APPROVED',
      entityType: 'Organization',
      entityId: organization.id,
      metadata: {
        organizationName: 'GlobalTech Industries',
        approvedAt: organization.approvedAt,
        status: 'ACTIVE',
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: organization.id,
      userId: orgAdmin.id,
      action: 'EMPLOYEE_HIRED',
      entityType: 'User',
      entityId: ctoUser.id,
      metadata: {
        employeeName: 'David Chen',
        jobTitle: 'Chief Technology Officer',
        department: 'Engineering',
        startDate: '2020-02-01',
      },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: organization.id,
      userId: hrManagerUser.id,
      action: 'DOCUMENT_UPLOADED',
      entityType: 'Documents',
      entityId: ctoUser.id,
      metadata: {
        documentType: 'EMPLOYMENT_CONTRACT',
        fileName: 'David_Chen_Employment_Contract.pdf',
      },
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });

  console.log('  ✓ Created Organization: GlobalTech Industries');
  console.log('  ✓ Created 3 Branches (US, APAC, EU)');
  console.log('  ✓ Created 9 Departments');
  console.log('  ✓ Created 20 Job Titles');
  console.log('  ✓ Created 2 Work Schedules');
  console.log('  ✓ Created 15+ Employees with complete profiles');
  console.log('  ✓ Created Employment records with line managers');
  console.log('  ✓ Created Contracts for all employees');
  console.log('  ✓ Created Work schedule assignments');
  console.log('  ✓ Created Sample attendance records');
  console.log('  ✓ Created Sample documents');
  console.log('  ✓ Created Audit log entries');
  console.log('');
  console.log('Sample Login Credentials:');
  console.log('  Org Admin: admin@globaltech.com / Admin@2026');
  console.log('  CTO: david.chen@globaltech.com / SecurePass2026');
  console.log('  All employees: <email> / SecurePass2026');
}
