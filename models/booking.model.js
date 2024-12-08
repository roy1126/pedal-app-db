const mongoose = require("mongoose");

// Define the schema for booking details
const bookingSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model if applicable
      default: null, // Default is null if there's no driver assigned
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model (for customer)
      required: true,
    },
    isPwd: {
      type: Boolean,
      required: true,
      default: false, // Default is false, assuming _isPWD is a boolean
    },
    pwdType: {
      type: String,
      required: false,
      default: "regular", // Assuming _selectedPWDType is a string like "regular" or other types
    },
    notes: {
      type: String,
      default: "", // Default empty string if no notes
    },
    dateCompleted: {
      type: Date,
      default: null, // Default is null
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true, // Default is true indicating the booking is active
    },
    bookingStatus: {
      type: String,
      enum: ["IN-PROGRESS", "COMPLETED", "CANCELLED"], // Enum for booking status
      required: true,
      default: "IN-PROGRESS", // Default value is IN-PROGRESS
    },
    eta: {
      type: Date,
      required: true, // Assuming _eta is a Date object
    },
    price: {
      type: Number,
      required: true,
      default: 0, // Default is 0 if price is not provided
    },
    startLocation: {
      type: String,
      required: true, // Required field for starting location
    },
    destination: {
      type: String,
      required: true, // Required field for destination
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create the model based on the schema
const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
