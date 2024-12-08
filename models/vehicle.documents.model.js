const mongoose = require("mongoose");

// Define the schema for vehicle documents
const vehicleDocumentSchema = new mongoose.Schema(
  {
    insuranceValidity: {
      type: String, // Store as a string (e.g., "12/2028")
      required: true, // Required field
    },
    hasInspectionCertificate: {
      type: Boolean, // Store as a boolean
      required: true, // Required field
      default: false, // Default value if not provided
    },
    documents: [
      {
        value: {
          type: String, // Document type (e.g., "Registration Certificate")
          required: true,
        },
        file: {
          type: String, // File name (e.g., "registration_certificate.pdf")
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create the model based on the schema
const VehicleDocuments = mongoose.model(
  "VehicleDocuments",
  vehicleDocumentSchema
);

module.exports = VehicleDocuments;
