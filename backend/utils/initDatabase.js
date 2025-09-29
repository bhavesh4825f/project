// Database initialization and seeding script
import User from '../models/User.js';
import Service from '../models/Service.js';

export const initializeDatabase = async () => {
  try {
    console.log('🔧 Starting database initialization...');

    // Check if admin user exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      console.log('👤 Creating admin user...');
      
      // Simple password hashing (you should use bcrypt in production)
      const adminUser = new User({
        username: 'admin',
        email: 'admin@ogsp.gov.in',
        mno: '9999999999',
        password: 'admin123', // Will be hashed by the model's pre-save hook
        role: 'admin'
      });
      
      await adminUser.save();
      console.log('✅ Admin user created - Email: admin@ogsp.gov.in, Password: admin123');
    } else {
      console.log('👤 Admin user already exists');
    }

    // Check if services exist
    const servicesCount = await Service.countDocuments();
    
    if (servicesCount === 0) {
      console.log('🛠️ Creating default services...');
      
      const defaultServices = [
        {
          name: 'PAN Card Application',
          displayName: 'PAN Card Application',
          description: 'Apply for a new PAN card or correction in existing PAN card details',
          isActive: true,
          displayOrder: 1,
          pricing: {
            serviceFee: 107,
            consultancyCharge: 20
          },
          formFields: [
            { fieldName: 'fullName', displayName: 'Full Name', type: 'text', required: true },
            { fieldName: 'fatherName', displayName: 'Father\'s Name', type: 'text', required: true },
            { fieldName: 'motherName', displayName: 'Mother\'s Name', type: 'text', required: true },
            { fieldName: 'dateOfBirth', displayName: 'Date of Birth', type: 'date', required: true },
            { fieldName: 'placeOfBirth', displayName: 'Place of Birth', type: 'text', required: true },
            { fieldName: 'mobileNumber', displayName: 'Mobile Number', type: 'tel', required: true },
            { fieldName: 'email', displayName: 'Email Address', type: 'email', required: true }
          ],
          requiredDocuments: [
            { fieldName: 'adharcard', displayName: 'Aadhar Card', required: true },
            { fieldName: 'passport_photo', displayName: 'Passport Size Photo', required: true }
          ]
        },
        {
          name: 'Income Certificate',
          displayName: 'Income Certificate',
          description: 'Apply for income certificate for educational or other purposes',
          isActive: true,
          displayOrder: 2,
          pricing: {
            serviceFee: 30,
            consultancyCharge: 20
          },
          formFields: [
            { fieldName: 'applicantName', displayName: 'Applicant Name', type: 'text', required: true },
            { fieldName: 'fatherName', displayName: 'Father\'s Name', type: 'text', required: true },
            { fieldName: 'occupation', displayName: 'Occupation', type: 'text', required: true },
            { fieldName: 'annualIncome', displayName: 'Annual Income', type: 'number', required: true },
            { fieldName: 'address', displayName: 'Address', type: 'textarea', required: true },
            { fieldName: 'mobileNumber', displayName: 'Mobile Number', type: 'tel', required: true },
            { fieldName: 'email', displayName: 'Email Address', type: 'email', required: true }
          ],
          requiredDocuments: [
            { fieldName: 'adhar_card', displayName: 'Aadhar Card', required: true },
            { fieldName: 'passport_photo', displayName: 'Passport Size Photo', required: true },
            { fieldName: 'ration_card', displayName: 'Ration Card', required: false },
            { fieldName: 'light_bill', displayName: 'Electricity Bill', required: false }
          ]
        },
        {
          name: 'Birth Certificate',
          displayName: 'Birth Certificate',
          description: 'Apply for birth certificate',
          isActive: true,
          displayOrder: 3,
          pricing: {
            serviceFee: 25,
            consultancyCharge: 20
          },
          formFields: [
            { fieldName: 'applicantName', displayName: 'Name of Child', type: 'text', required: true },
            { fieldName: 'fatherName', displayName: 'Father\'s Name', type: 'text', required: true },
            { fieldName: 'motherName', displayName: 'Mother\'s Name', type: 'text', required: true },
            { fieldName: 'dateOfBirth', displayName: 'Date of Birth', type: 'date', required: true },
            { fieldName: 'placeOfBirth', displayName: 'Place of Birth', type: 'text', required: true },
            { fieldName: 'gender', displayName: 'Gender', type: 'select', required: true, options: ['Male', 'Female', 'Other'] },
            { fieldName: 'address', displayName: 'Address', type: 'textarea', required: true },
            { fieldName: 'mobileNumber', displayName: 'Mobile Number', type: 'tel', required: true },
            { fieldName: 'email', displayName: 'Email Address', type: 'email', required: true }
          ],
          requiredDocuments: [
            { fieldName: 'documents', displayName: 'Hospital Birth Certificate / Birth Proof', required: true },
            { fieldName: 'adhar_card', displayName: 'Parents Aadhar Card', required: true }
          ]
        },
        {
          name: 'Caste Certificate',
          displayName: 'Caste Certificate',
          description: 'Apply for caste certificate',
          isActive: true,
          displayOrder: 4,
          pricing: {
            serviceFee: 30,
            consultancyCharge: 20
          },
          formFields: [
            { fieldName: 'applicantName', displayName: 'Applicant Name', type: 'text', required: true },
            { fieldName: 'fatherName', displayName: 'Father\'s Name', type: 'text', required: true },
            { fieldName: 'motherName', displayName: 'Mother\'s Name', type: 'text', required: true },
            { fieldName: 'dateOfBirth', displayName: 'Date of Birth', type: 'date', required: true },
            { fieldName: 'caste', displayName: 'Caste', type: 'text', required: true },
            { fieldName: 'subCaste', displayName: 'Sub-Caste', type: 'text', required: false },
            { fieldName: 'religion', displayName: 'Religion', type: 'text', required: true },
            { fieldName: 'address', displayName: 'Address', type: 'textarea', required: true },
            { fieldName: 'mobileNumber', displayName: 'Mobile Number', type: 'tel', required: true },
            { fieldName: 'email', displayName: 'Email Address', type: 'email', required: true }
          ],
          requiredDocuments: [
            { fieldName: 'documents', displayName: 'Supporting Documents', required: true },
            { fieldName: 'adhar_card', displayName: 'Aadhar Card', required: true }
          ]
        }
      ];

      await Service.insertMany(defaultServices);
      console.log(`✅ Created ${defaultServices.length} default services`);
    } else {
      console.log(`🛠️ ${servicesCount} services already exist`);
    }

    console.log('🎉 Database initialization completed successfully!');
    return {
      success: true,
      message: 'Database initialized successfully',
      adminCredentials: {
        email: 'admin@ogsp.gov.in',
        password: 'admin123'
      }
    };

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return {
      success: false,
      message: 'Database initialization failed',
      error: error.message
    };
  }
};