const mongoose = require("mongoose");

// Define the schema for vehicle details
const vehicleDetailsSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: true, // Required field
    },
    yearModel: {
      type: Number,
      required: true, // Required field
    },
    licenseNumber: {
      type: String,
      required: true, // Required field
    },
    rampOrLiftAvailability: {
      type: Boolean,
      required: true, // Required field
      default: false, // Default value
    },
    wheelCapacity: {
      type: Number,
      required: true, // Required field
      default: 0, // Default value if not provided
    },
    otherAccessibilityFeat: {
      type: String,
      required: false, // Optional field
      default: "", // Default empty string if not provided
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create the model based on the schema
const VehicleDetails = mongoose.model("VehicleDetails", vehicleDetailsSchema);

module.exports = VehicleDetails;
