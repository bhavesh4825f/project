import mongoose from "mongoose";
import Application from "./models/Application.js";

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

const checkApplication = async () => {
  await connectDB();
  
  const applicationId = "68dcbe022e53e52579dca0fb";
  console.log("Checking application ID:", applicationId);
  
  try {
    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      console.log("❌ Invalid ObjectId format");
      return;
    }
    
    // Find the application
    const application = await Application.findById(applicationId);
    
    if (application) {
      console.log("✅ Application found!");
      console.log("Full application object:");
      console.log(JSON.stringify(application, null, 2));
      
      console.log("\nDate fields specifically:");
      console.log("createdAt:", application.createdAt);
      console.log("updatedAt:", application.updatedAt);
      console.log("submittedAt:", application.submittedAt);
      
      console.log("\nApplication data:");
      console.log("applicationData:", application.applicationData);
    } else {
      console.log("❌ Application not found in database");
      
      // Let's check the total count and get any applications
      const totalCount = await Application.countDocuments();
      console.log(`Total applications in database: ${totalCount}`);
      
      if (totalCount > 0) {
        const allApps = await Application.find({}).populate('userId', 'username email').populate('serviceId', 'displayName').limit(10);
        console.log("\nApplications in database:");
        allApps.forEach(app => {
          console.log(`- ID: ${app._id}`);
          console.log(`  Service: ${app.serviceType} (${app.serviceId?.displayName || 'No service name'})`);
          console.log(`  Status: ${app.status}`);
          console.log(`  User: ${app.userId?.username || 'No user'} (${app.userId?.email || 'No email'})`);
          console.log(`  Created: ${app.createdAt}`);
          console.log(`  Updated: ${app.updatedAt}`);
          console.log('---');
        });
      } else {
        console.log("No applications found in database. Database might be empty.");
      }
    }
    
  } catch (error) {
    console.error("Error checking application:", error);
  }
  
  process.exit(0);
};

checkApplication();