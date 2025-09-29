// routes/service.js
import express from "express";
import Service from "../models/Service.js";
import Application from "../models/Application.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ---------------------
// Get All Active Services (Public)
// ---------------------
router.get("/active", async (req, res) => {
  try {
    console.log("Fetching active services...");
    
    // Check if we can connect to database
    const services = await Service.find({ isActive: true })
      .select("-__v")
      .sort({ displayOrder: 1, createdAt: 1 });

    console.log(`Found ${services.length} active services`);

    // If no services found, return default services for demo
    if (services.length === 0) {
      console.log("No services in database, returning default services");
      const defaultServices = [
        {
          _id: "demo1",
          name: "PAN Card Application",
          displayName: "PAN Card Application", 
          description: "Apply for a new PAN card or correction in existing PAN card details",
          isActive: true,
          displayOrder: 1,
          pricing: { serviceFee: 107, consultancyCharge: 20 }
        },
        {
          _id: "demo2", 
          name: "Income Certificate",
          displayName: "Income Certificate",
          description: "Apply for income certificate for educational or other purposes",
          isActive: true,
          displayOrder: 2,
          pricing: { serviceFee: 30, consultancyCharge: 20 }
        },
        {
          _id: "demo3",
          name: "Birth Certificate", 
          displayName: "Birth Certificate",
          description: "Apply for birth certificate",
          isActive: true,
          displayOrder: 3,
          pricing: { serviceFee: 25, consultancyCharge: 20 }
        }
      ];
      
      return res.json({
        success: true,
        services: defaultServices,
        count: defaultServices.length,
        note: "Demo services - database not yet initialized"
      });
    }

    res.json({
      success: true,
      services,
      count: services.length
    });
  } catch (err) {
    console.error("GET ACTIVE SERVICES ERROR:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    
    // Return demo services as fallback
    const fallbackServices = [
      {
        _id: "fallback1",
        name: "PAN Card Application",
        displayName: "PAN Card Application", 
        description: "Apply for a new PAN card",
        isActive: true,
        displayOrder: 1,
        pricing: { serviceFee: 107, consultancyCharge: 20 }
      }
    ];
    
    res.json({
      success: true,
      services: fallbackServices,
      count: fallbackServices.length,
      note: "Fallback services - database connection issue",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Database connection error'
    });
  }
});

// ---------------------
// Initialize Default Services (Public - for setup)
// ---------------------
router.get("/init-services", async (req, res) => {
  try {
    // Check if services already exist
    const existingServices = await Service.find({});
    
    if (existingServices.length > 0) {
      return res.json({
        success: true,
        message: "Services already exist",
        count: existingServices.length,
        services: existingServices
      });
    }

    // Create default services
    const defaultServices = [
      {
        name: "PAN Card Application",
        displayName: "PAN Card Application",
        description: "Apply for a new PAN card or correction in existing PAN card",
        isActive: true,
        displayOrder: 1,
        pricing: {
          serviceFee: 107,
          consultancyCharge: 20
        },
        formFields: [
          { fieldName: "fullName", displayName: "Full Name", type: "text", required: true },
          { fieldName: "fatherName", displayName: "Father's Name", type: "text", required: true },
          { fieldName: "dateOfBirth", displayName: "Date of Birth", type: "date", required: true },
          { fieldName: "mobileNumber", displayName: "Mobile Number", type: "tel", required: true },
          { fieldName: "email", displayName: "Email Address", type: "email", required: true }
        ],
        requiredDocuments: [
          { fieldName: "adharcard", displayName: "Aadhar Card", required: true },
          { fieldName: "passport_photo", displayName: "Passport Photo", required: true }
        ]
      },
      {
        name: "Income Certificate",
        displayName: "Income Certificate",
        description: "Apply for income certificate for various purposes",
        isActive: true,
        displayOrder: 2,
        pricing: {
          serviceFee: 30,
          consultancyCharge: 20
        },
        formFields: [
          { fieldName: "applicantName", displayName: "Applicant Name", type: "text", required: true },
          { fieldName: "mobileNumber", displayName: "Mobile Number", type: "tel", required: true },
          { fieldName: "email", displayName: "Email Address", type: "email", required: true }
        ],
        requiredDocuments: [
          { fieldName: "adhar_card", displayName: "Aadhar Card", required: true },
          { fieldName: "passport_photo", displayName: "Passport Photo", required: true }
        ]
      },
      {
        name: "Birth Certificate",
        displayName: "Birth Certificate",
        description: "Apply for birth certificate",
        isActive: true,
        displayOrder: 3,
        pricing: {
          serviceFee: 25,
          consultancyCharge: 20
        },
        formFields: [
          { fieldName: "applicantName", displayName: "Applicant Name", type: "text", required: true },
          { fieldName: "dateOfBirth", displayName: "Date of Birth", type: "date", required: true },
          { fieldName: "placeOfBirth", displayName: "Place of Birth", type: "text", required: true }
        ],
        requiredDocuments: [
          { fieldName: "documents", displayName: "Supporting Documents", required: true }
        ]
      }
    ];

    const createdServices = await Service.insertMany(defaultServices);

    res.json({
      success: true,
      message: "Default services created successfully",
      count: createdServices.length,
      services: createdServices
    });

  } catch (err) {
    console.error("INIT SERVICES ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to initialize services",
      error: err.message
    });
  }
});

// ---------------------
// Get Single Service Details (Public)
// ---------------------
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    res.json({
      success: true,
      service
    });
  } catch (err) {
    console.error("GET SERVICE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching service"
    });
  }
});

// ---------------------
// Get All Services (Admin Only)
// ---------------------
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const services = await Service.find({})
      .select("-__v")
      .sort({ displayOrder: 1, createdAt: 1 });

    // Get application count for each service
    const servicesWithStats = await Promise.all(
      services.map(async (service) => {
        const applicationCount = await Application.countDocuments({
          serviceId: service._id
        });
        
        return {
          ...service.toObject(),
          applicationCount
        };
      })
    );

    res.json({
      success: true,
      services: servicesWithStats
    });
  } catch (err) {
    console.error("GET ALL SERVICES ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching services"
    });
  }
});

// ---------------------
// Create New Service (Admin Only)
// ---------------------
router.post("/admin/create", protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      displayName,
      description,
      category,
      pricing,
      requiredDocuments,
      formFields,
      processingTime,
      icon,
      displayOrder
    } = req.body;

    // Validate required fields
    if (!name || !displayName || !description || !category || !pricing) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Check if service with same name already exists
    const existingService = await Service.findOne({ name });
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: "Service with this name already exists"
      });
    }

    // Create new service
    const service = new Service({
      name,
      displayName,
      description,
      category,
      pricing,
      requiredDocuments: requiredDocuments || [],
      formFields: formFields || [],
      processingTime: processingTime || "5-7 working days",
      icon: icon || "bi-file-earmark",
      displayOrder: displayOrder || 0
    });

    await service.save();

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service
    });
  } catch (err) {
    console.error("CREATE SERVICE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error while creating service"
    });
  }
});

// ---------------------
// Update Service (Admin Only)
// ---------------------
router.put("/admin/:id", protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    res.json({
      success: true,
      message: "Service updated successfully",
      service
    });
  } catch (err) {
    console.error("UPDATE SERVICE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error while updating service"
    });
  }
});

// ---------------------
// Toggle Service Status (Admin Only)
// ---------------------
router.patch("/admin/:id/toggle", protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    service.isActive = !service.isActive;
    await service.save();

    res.json({
      success: true,
      message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`,
      service
    });
  } catch (err) {
    console.error("TOGGLE SERVICE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error while toggling service status"
    });
  }
});

// ---------------------
// Delete Service (Admin Only)
// ---------------------
router.delete("/admin/:id", protect, adminOnly, async (req, res) => {
  try {
    // Check if service has any applications
    const applicationCount = await Application.countDocuments({
      serviceId: req.params.id
    });

    if (applicationCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete service. It has ${applicationCount} applications associated with it.`
      });
    }

    const service = await Service.findByIdAndDelete(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    res.json({
      success: true,
      message: "Service deleted successfully"
    });
  } catch (err) {
    console.error("DELETE SERVICE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error while deleting service"
    });
  }
});

// ---------------------
// Update Service Pricing (Admin Only)
// ---------------------
router.patch("/admin/:id/pricing", protect, adminOnly, async (req, res) => {
  try {
    const { serviceFee, consultancyCharge } = req.body;
    
    // Validate pricing data
    if (serviceFee === undefined || consultancyCharge === undefined) {
      return res.status(400).json({
        success: false,
        message: "Both serviceFee and consultancyCharge are required"
      });
    }
    
    if (serviceFee < 0 || consultancyCharge < 0) {
      return res.status(400).json({
        success: false,
        message: "Fees cannot be negative"
      });
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { 
        "pricing.serviceFee": parseFloat(serviceFee),
        "pricing.consultancyCharge": parseFloat(consultancyCharge)
      },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    res.json({
      success: true,
      message: "Service pricing updated successfully",
      service: {
        _id: service._id,
        displayName: service.displayName,
        pricing: service.pricing
      }
    });
  } catch (err) {
    console.error("UPDATE SERVICE PRICING ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error while updating service pricing"
    });
  }
});

export default router;