const mongoose = require("mongoose");

// Define the Document Schema
const documentSchema = new mongoose.Schema({
  value: { type: String, required: true },
  file: { type: String, required: true },
});

// Define the Car Schema
const carSchema = new mongoose.Schema({
  carId: { type: Number, required: true },
  licenseNumber: { type: Number, required: true },
  insuranceValidity: { type: String, required: true },
  documents: [documentSchema], // Array of documents (subdocuments)
});

// Define the User Schema
const userSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isDriver: { type: Boolean, required: true },
  dateCreated: { type: Date, default: Date.now },
  lastLogin: { type: Date, required: false },
  vehicleDetails: { type: mongoose.Schema.Types.Mixed, required: false }, // Optional carDetails as an embedded document
  vehicleDocuments: { type: mongoose.Schema.Types.Mixed, required: false }, // Optional carDetails as an embedded document
});

// Create the User Model
const User = mongoose.model("User", userSchema);

module.exports = User;
