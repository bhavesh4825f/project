# Dynamic Service Management System

## Overview
The dynamic service management system allows administrators to add, edit, and manage services through a web interface without requiring code changes. This makes the platform highly flexible and scalable.

## System Architecture

### Database Models

1. **Service Model** (`models/Service.js`)
   - Stores service definitions with pricing, form fields, and document requirements
   - Fields: name, displayName, description, category, pricing, formFields, requiredDocuments, etc.

2. **Updated Application Model** (`models/Application.js`)
   - Now includes `serviceId` reference to Service model
   - Removed hardcoded `applicationType` enum for flexibility

3. **Updated Payment Model** (`models/Payment.js`)
   - Removed hardcoded service type enum to support any service

### Backend APIs

1. **Service Routes** (`/api/service/`)
   - `GET /active` - Get all active services (public)
   - `GET /:id` - Get single service details
   - `GET /admin/all` - Get all services with stats (admin only)
   - `POST /admin/create` - Create new service (admin only)
   - `PUT /admin/:id` - Update service (admin only)
   - `PATCH /admin/:id/toggle` - Enable/disable service (admin only)
   - `DELETE /admin/:id` - Delete service (admin only)

2. **Updated Payment Routes**
   - Now fetches pricing dynamically from Service model
   - Falls back to hardcoded pricing for legacy services

### Frontend Components

1. **ServiceManagement.jsx** - Admin interface for managing services
2. **ServiceFormModal.jsx** - Modal for creating/editing services with form builder
3. **DynamicServiceApplication.jsx** - Universal application form that adapts to any service
4. **Updated Home.jsx** - Displays dynamic services from database
5. **Updated PaymentModal.jsx** - Fetches dynamic pricing

## Key Features

### For Administrators
- **Service CRUD Operations**: Create, read, update, delete services
- **Dynamic Form Builder**: Define custom form fields for each service
- **Document Requirements**: Specify required documents with validation
- **Pricing Control**: Set service fees and consultancy charges
- **Service Status**: Enable/disable services
- **Application Analytics**: View application counts per service

### For Users
- **Dynamic Forms**: Application forms adapt to service requirements
- **File Uploads**: Upload required documents with validation
- **Dynamic Pricing**: Automatic fee calculation based on service
- **Progress Tracking**: Track application status

## How to Add New Service

### Method 1: Admin Web Interface
1. Login as admin
2. Go to `/service-management`
3. Click "Add New Service"
4. Fill in service details:
   - Basic info (name, description, category)
   - Pricing (service fee, consultancy charge)
   - Form fields (text, select, date, etc.)
   - Document requirements
5. Save and activate

### Method 2: Database Migration (Initial Setup)
Run the migration script to populate default services:
```bash
cd backend
node migrateToServices.js
```

## URL Structure

- **Static Services**: `/apply-pan`, `/apply-income` (legacy, still supported)
- **Dynamic Services**: `/apply/:serviceId` (new unified endpoint)
- **Service Management**: `/service-management` (admin only)

## Service Configuration Examples

### Simple Service (Marriage Certificate)
```json
{
  "name": "Marriage Certificate",
  "displayName": "Marriage Certificate",
  "description": "Apply for marriage certificate verification",
  "category": "certificate",
  "pricing": { "serviceFee": 75, "consultancyCharge": 20 },
  "formFields": [
    {
      "fieldName": "brideName",
      "displayName": "Bride's Name",
      "fieldType": "text",
      "required": true
    },
    {
      "fieldName": "groomName", 
      "displayName": "Groom's Name",
      "fieldType": "text",
      "required": true
    },
    {
      "fieldName": "marriageDate",
      "displayName": "Marriage Date",
      "fieldType": "date",
      "required": true
    }
  ],
  "requiredDocuments": [
    {
      "fieldName": "marriage_certificate",
      "displayName": "Marriage Certificate",
      "required": true,
      "acceptedFormats": [".pdf", ".jpg", ".jpeg", ".png"]
    }
  ]
}
```

### Complex Service (Passport Application)
```json
{
  "name": "Passport Application",
  "displayName": "Passport Application",
  "description": "Apply for new passport or renewal",
  "category": "document",
  "pricing": { "serviceFee": 1500, "consultancyCharge": 100 },
  "formFields": [
    {
      "fieldName": "applicationType",
      "displayName": "Application Type",
      "fieldType": "select",
      "required": true,
      "options": ["New", "Renewal", "Reissue"]
    },
    {
      "fieldName": "passportType",
      "displayName": "Passport Type", 
      "fieldType": "select",
      "required": true,
      "options": ["36 Pages", "60 Pages"]
    }
  ],
  "requiredDocuments": [
    {
      "fieldName": "birth_certificate",
      "displayName": "Birth Certificate",
      "required": true
    },
    {
      "fieldName": "address_proof",
      "displayName": "Address Proof",
      "required": true
    }
  ]
}
```

## Migration Guide

### From Hardcoded to Dynamic Services

1. **Run Migration Script**:
   ```bash
   node migrateToServices.js
   ```

2. **Update Existing Applications**:
   - Script automatically links existing applications to new services
   - Legacy routing still works for backward compatibility

3. **Test New System**:
   - Verify services appear on homepage
   - Test application submission via `/apply/:serviceId`
   - Confirm payment processing works

## Benefits

1. **No Code Changes**: Add services through web interface
2. **Flexible Forms**: Support any form field type
3. **Document Validation**: Custom file requirements per service
4. **Dynamic Pricing**: Easy price updates
5. **Backward Compatibility**: Legacy services still work
6. **Scalability**: Unlimited services without performance impact
7. **Admin Control**: Full service lifecycle management

## Technical Implementation Details

### Form Field Types Supported
- `text` - Text input
- `email` - Email input with validation
- `tel` - Phone number input
- `date` - Date picker
- `number` - Number input
- `select` - Dropdown with custom options
- `textarea` - Multi-line text input

### Document Validation
- File type restrictions (PDF, JPG, PNG, etc.)
- File size limits (configurable)
- Required/optional documents
- Custom descriptions and help text

### Pricing Structure
- Service Fee: Base cost of the service
- Consultancy Charge: Additional processing fee
- Total Amount: Automatically calculated sum
- Dynamic updates through admin interface

This system provides a complete solution for managing government services dynamically while maintaining backward compatibility with existing functionality.