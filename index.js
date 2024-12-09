const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const User = require("./models/user.model");
const Booking = require("./models/booking.model");
const VehicleDetails = require("./models/vehicle.details.model");
const VehicleDocuments = require("./models/vehicle.documents.model");
const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      address,
      email,
      password,
      isDriver,
      vehicleDetails,
      vehicleDocuments,
    } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document
    const user = new User({
      firstName,
      lastName,
      phoneNumber,
      address,
      email,
      password: hashedPassword,
      isDriver,
      vehicleDetails,
      vehicleDocuments,
    });

    // Save the user to the database
    await user.save();

    // Assign the generated _id to the custom id field
    user.id = user._id.toString(); // MongoDB _id as string

    // Save the updated user object with custom id
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare the password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update lastLogin before sending the response
    user.lastLogin = new Date();
    await user.save(); // Save the updated user

    // Send the response with the updated user (including lastLogin)
    res.status(200).json({
      message: "Login successful",
      user: user, // Send the user object after updating lastLogin
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/booking", async (req, res) => {
  try {
    const user = await User.findById(req.body.customerId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const booking = await Booking.create(req.body);

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/bookings/accepted", async (req, res) => {
  try {
    const { driverId } = req.body;
    // Query the database for bookings with IN-PROGRESS status, active, and no driverId
    const bookings = await Booking.find({
      driverId: driverId,
      isActive: true,
    });


    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/bookings/available", async (req, res) => {
  try {
    // Query the database for bookings with IN-PROGRESS status, active, and no driverId
    const bookings = await Booking.find({
      bookingStatus: "IN-PROGRESS",
      isActive: true,
      driverId: null,
    });


    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/booking/user/cancel", async (req, res) => {
  try {
    const { bookingId } = req.body; // Assuming the body contains driverId and bookingStatus

    // Find the booking by its _id and update the driverId and bookingStatus
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        driverId: null, // If driverId is provided, it will be updated; otherwise, it will be set to null
        bookingStatus: "CANCELLED",
        isActive: false,
      },
      { new: true } // To return the updated document
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(updatedBooking);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/booking/driver/accept", async (req, res) => {
  try {
    const { bookingId, driverId } = req.body; // Assuming the body contains driverId and bookingStatus

    // Find the booking by its _id and update the driverId and bookingStatus
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        driverId: driverId, // If driverId is provided, it will be updated; otherwise, it will be set to null
        bookingStatus: "PICK-UP",
      },
      { new: true } // To return the updated document
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(updatedBooking);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/booking/driver/cancel", async (req, res) => {
  try {
    const { bookingId, driverId } = req.body; // Assuming the body contains driverId and bookingStatus

    // Find the booking by its _id and update the driverId and bookingStatus
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        driverId: null, // If driverId is provided, it will be updated; otherwise, it will be set to null
        bookingStatus: "IN-PROGRESS",
      },
      { new: true } // To return the updated document
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(updatedBooking);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/booking/driver/finish", async (req, res) => {
  try {
    const { bookingId, driverId } = req.body; // Assuming the body contains driverId and bookingStatus

    // Find the booking by its _id and update the driverId and bookingStatus
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        bookingStatus: "COMPLETED",
        isActive: false,
        dateCompleted: Date.now(),
      },
      { new: true } // To return the updated document
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(updatedBooking);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/vehicle/details", async (req, res) => {
  try {
    const { userId, vehicleDetails } = req.body;

    try {
      // Find the user by userId
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const {
        model,
        yearModel,
        licenseNumber,
        address,
        rampOrLiftAvailability,
        wheelCapacity,
        otherAccessibilityFeat,
      } = vehicleDetails;

      const newVehicleDetails = new VehicleDetails({
        model,
        yearModel,
        licenseNumber,
        address,
        rampOrLiftAvailability,
        wheelCapacity,
        otherAccessibilityFeat,
      });

      user.vehicleDetails = newVehicleDetails;

      // Save the updated user document
      await user.save();

      // Return a success response with the updated user
      res
        .status(200)
        .json({ message: "Car details updated successfully", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/vehicle/documents", async (req, res) => {
  try {
    const { userId, vehicleDocuments } = req.body;

    try {
      // Find the user by userId
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { insuranceValidity, hasInspectionCertificate } = vehicleDocuments;

      const newVehicleDocuments = new VehicleDocuments({
        insuranceValidity,
        hasInspectionCertificate,
      });

      user.vehicleDocuments = newVehicleDocuments;

      // Save the updated user document
      await user.save();

      // Return a success response with the updated user
      res
        .status(200)
        .json({ message: "Car details updated successfully", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/bookings/current", async (req, res) => {
  try {
    const { userId } = req.body; // Extract userId from request body

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Query to find bookings that match the conditions
    const bookings = await Booking.find({
      customerId: userId, // Match userId
      isActive: true, // Only active bookings
      bookingStatus: "IN-PROGRESS", // Only bookings with "IN-PROGRESS" status
    });

    // Return the filtered bookings
    res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/bookings/archived", async (req, res) => {
  try {
    const { userId } = req.body; // Extract userId from request body

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Query to find bookings that match the conditions
    const bookings = await Booking.find({
      customerId: userId, // Match userId
      isActive: false, // Only inactive bookings
      bookingStatus: { $ne: "IN-PROGRESS" }, // bookingStatus not equal to "IN-PROGRESS"
    });

    // Return the filtered bookings
    res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PLACES API

// Google Maps API Key (replace this with your own)
const googleApiKey = "AIzaSyBYSfMMUGh0UAI1cYJmA5zfoAyW8gCWYmU"; // Replace securely

// OpenRouteService API Key
const openRouteServiceApiKey =
  "5b3ce3597851110001cf62483a5657d52fa942079916e1e42b33a209"; // Replace securely

// Route to fetch place autocomplete suggestions
app.get("/places", async (req, res) => {
  try {
    const { input } = req.query; // Ensure `input` is passed as a query parameter
    if (!input) {
      return res.status(400).send({ error: "Input query is required" });
    }

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${googleApiKey}`
    );

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching place suggestions");
  }
});

// Route to get place details
app.get("/places/details", async (req, res) => {
  try {
    const { place_id } = req.query; // Ensure `place_id` is passed as a query parameter
    if (!place_id) {
      return res.status(400).send({ error: "Place ID is required" });
    }

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${googleApiKey}`
    );

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching place details");
  }
});

// Route to calculate the route, price, and ETA
app.post("/api/route", async (req, res) => {
  try {
    const { from, to } = req.body; // Expects `from` and `to` lat-lng from the frontend

    if (!from || !to) {
      return res
        .status(400)
        .send({ error: "From and To locations are required" });
    }

    // OpenRouteService API endpoint
    const matrixApiUrl =
      "https://api.openrouteservice.org/v2/matrix/driving-car";

    // Prepare the data to send in the POST body
    const postData = {
      locations: [
        [from.longitude, from.latitude], // OpenRouteService expects [lon, lat]
        [to.longitude, to.latitude],
      ],
    };

    // Send the POST request to OpenRouteService API
    const response = await axios.post(matrixApiUrl, postData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openRouteServiceApiKey}`, // Use Authorization header with the API Key
      },
    });

    // Extract data from the response
    const { durations, distances, routes } = response.data;
    const duration = durations[0][0] / 60; // ETA in minutes
    const distance = distances[0][0] / 1000; // Distance in km

    // Example price calculation (adjust per your logic)
    const baseFare = 40;
    const ratePerKm = 15;
    const ratePerMinute = 2;
    const price = baseFare + distance * ratePerKm + duration * ratePerMinute;

    // Decode polyline for the route
    const routePoints = decodePolyline(routes[0].geometry);

    // Send the data back to the frontend
    res.json({
      eta: `ETA: ${duration.toFixed(0)} mins`,
      price: `Price: ₱${price.toFixed(2)}`,
      routePoints: routePoints,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching route data");
  }
});

// Helper function to decode polyline
function decodePolyline(encoded) {
  let polylinePoints = [];
  let index = 0;
  let len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index) - 63;
      index++;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    let dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index) - 63;
      index++;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    let dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    polylinePoints.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return polylinePoints;
}

mongoose
  .connect(
    "mongodb+srv://royabanilla:jo3upyA5knn1Qjfo@backenddb.qlpi0.mongodb.net/?retryWrites=true&w=majority&appName=BackendDB"
  )
  .then(() => {
    console.log("Connected to database !");
    app.listen(3000, () => {
      console.log("server is running on port 3000");
    });
  })
  .catch(() => {
    console.log("cannot connect to database!");
  });
