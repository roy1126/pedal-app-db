const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = 4000;

// Use CORS middleware to allow cross-origin requests
app.use(cors());

// Google Maps API Key (replace this with your own)
const googleApiKey = "AIzaSyBYSfMMUGh0UAI1cYJmA5zfoAyW8gCWYmU"; // Replace securely

// Route to fetch place autocomplete suggestions
app.get("/places", async (req, res) => {
  try {
    const { input } = req.query; // Ensure input is passed as a query parameter
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
    const { place_id } = req.query; // Ensure place_id is passed as a query parameter
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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
