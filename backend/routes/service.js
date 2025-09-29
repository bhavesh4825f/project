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
    const services = await Service.find({ isActive: true })
      .select("-__v")
      .sort({ displayOrder: 1, createdAt: 1 });

    res.json({
      success: true,
      services
    });
  } catch (err) {
    console.error("GET ACTIVE SERVICES ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching services"
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