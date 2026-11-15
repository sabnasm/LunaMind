
require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the LunaMind website from the public folder
app.use(express.static(path.join(__dirname, "public")));

// NASA DONKI API
app.get("/api/donki", async (req, res) => {
    try {
        // Use the last 7 days by default
        const today = new Date().toISOString().slice(0, 10);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);

        const defaultStart = sevenDaysAgo.toISOString().slice(0, 10);

        const startDate = req.query.startDate || defaultStart;
        const endDate = req.query.endDate || today;

        // Validate date format
        const validDate = /^\d{4}-\d{2}-\d{2}$/;

        if (!validDate.test(startDate) || !validDate.test(endDate)) {
            return res.status(400).json({
                error: "Invalid date format. Use YYYY-MM-DD."
            });
        }

        // Validate actual calendar dates
        const isRealDate = (date) => {
            const parsed = new Date(`${date}T00:00:00Z`);
            return !isNaN(parsed.getTime()) &&
                parsed.toISOString().slice(0, 10) === date;
        };

        if (!isRealDate(startDate) || !isRealDate(endDate)) {
            return res.status(400).json({
                error: "Invalid calendar date."
            });
        }

        if (startDate > endDate) {
            return res.status(400).json({
                error: "Start date must be before or equal to end date."
            });
        }

        // Check NASA API key
        if (!process.env.NASA_API_KEY) {
            return res.status(500).json({
                error: "NASA API key is missing. Check your .env file."
            });
        }

        // Build NASA DONKI request
        const url = new URL(
            "https://api.nasa.gov/DONKI/notifications"
        );

        url.searchParams.set("startDate", startDate);
        url.searchParams.set("endDate", endDate);
        url.searchParams.set("type", "all");
        url.searchParams.set("api_key", process.env.NASA_API_KEY);

        console.log(`Requesting NASA data: ${startDate} to ${endDate}`);

        const response = await fetch(url);

        // Handle NASA API errors
        if (!response.ok) {
            const errorDetails = await response.text();

            console.error(
                "NASA API error:",
                response.status,
                errorDetails
            );

            return res.status(response.status).json({
                error: "NASA API request failed.",
                status: response.status
            });
        }

        const data = await response.json();

        // Return consistent data for the frontend
        res.json({
            source: "NASA DONKI",
            retrievedAt: new Date().toISOString(),
            events: Array.isArray(data) ? data : []
        });

        console.log(
            `NASA connection successful. Events received: ${data.length}`
        );

    } catch (error) {
        console.error("NASA connection error:", error);

        res.status(500).json({
            error: "Unable to retrieve NASA data.",
            details: error.message
        });
    }
});

// Start LunaMind server

// ==========================================
// NASA RADLAB API PROXY
// ==========================================

app.get("/api/radlab", async (req, res) => {

    try {

        console.log("Requesting NASA RadLab data...");

        const query =
            "spacecraft=ISS" +
            "&instrument=DosTel" +
            "&timestamp%3E=2022-04-01T23%3A00" +
            "&timestamp%3C2022-04-02T01%3A05" +
            "&absorbed_dose_rate%3E2" +
            "&timestamp" +
            "&instrument" +
            "&absorbed_dose_rate" +
            "&dose_equivalent_rate" +
            "&flux" +
            "&format=json";

        const nasaURL =
            "https://visualization.osdr.nasa.gov/radlab/api/?" +
            query;

        const response = await fetch(nasaURL);

        if (!response.ok) {

            const details = await response.text();

            console.error("NASA RadLab error:", details);

            return res.status(502).json({
                error: "NASA RadLab request failed.",
                status: response.status,
                details: details.slice(0, 500)
            });
        }

        const data = await response.json();

        console.log("NASA RadLab connection successful!");

        res.json({
            source: "NASA RadLab",
            retrievedAt: new Date().toISOString(),
            data: data
        });

    } catch (error) {

        console.error("RadLab connection error:", error);

        res.status(500).json({
            error: "Unable to retrieve NASA RadLab data.",
            details: error.message
        });

    }

});

app.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("🌕 LUNAMIND MISSION CONTROL");
    console.log(`🚀 Running at http://localhost:${PORT}`);
    console.log("--------------------------------");
});
