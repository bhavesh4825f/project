import mongoose from "mongoose";
import Application from "./models/Application.js";
import User from "./models/User.js";
import Service from "./models/Service.js";

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://admin:admin@ogsp.tucbm1y.mongodb.net/ogsp", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  }
};

const createTestApplication = async () => {
  await connectDB();
  
  try {
    // First, create a test user
    let testUser = await User.findOne({ email: 'bhavesh@gmail.com' });
    if (!testUser) {
      testUser = new User({
        username: 'Bhavesh',
        email: 'bhavesh@gmail.com',
        mno: '9510348699',
        password: 'test123',
        role: 'client'
      });
      await testUser.save();
      console.log("✅ Created test user");
    }

    // Create a PAN service if it doesn't exist
    let panService = await Service.findOne({ name: 'PAN Card Application' });
    if (!panService) {
      panService = new Service({
        name: 'PAN Card Application',
        displayName: 'PAN Card Application',
        description: 'Apply for a new PAN card',
        category: 'card',
        isActive: true,
        pricing: { serviceFee: 107, consultancyCharge: 20 },
        formFields: [
          { fieldName: 'fullName', displayName: 'Full Name', fieldType: 'text', required: true },
          { fieldName: 'phoneNumber', displayName: 'Phone Number', fieldType: 'tel', required: true },
          { fieldName: 'address', displayName: 'Address', fieldType: 'textarea', required: true }
        ]
      });
      await panService.save();
      console.log("✅ Created PAN service");
    }

    // Create a test application
    const testApplication = new Application({
      userId: testUser._id,
      applicationType: 'PAN Card',
      serviceId: panService._id,
      status: 'approved',
      applicationData: {
        fullName: 'Bhavesh',
        phoneNumber: '9510348699',
        address: 'M-203 pandit din dyayal nagar surat-39509'
      },
      documents: {
        adharcard: 'test_aadhar.jpg',
        passport_photo: 'test_photo.jpg'
      },
      paymentStatus: 'completed'
    });

    await testApplication.save();
    console.log("✅ Created test application with ID:", testApplication._id);
    console.log("   You can access it at: /application-details/" + testApplication._id);

  } catch (error) {
    console.error("Error creating test application:", error);
  }
  
  process.exit(0);
};

createTestApplication();