const express = require('express');
const router = express.Router();
const axios = require('axios');
const Trip = require('../models/Trip');

// 1. External API Route (Search City Weather)
router.get('/weather/:city', async (req, res) => {
	try {
        const city = req.params.city;

        // Step A: Get Coordinates (Geocoding API - No Key Needed)
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
        const geoRes = await axios.get(geoUrl);

        if (!geoRes.data.results) {
            return res.status(404).json({ error: 'City not found' });
        }

        const { latitude, longitude, name, country } = geoRes.data.results[0];

        // Step B: Get Weather (Weather API - No Key Needed)
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        const weatherRes = await axios.get(weatherUrl);
        const currentWeather = weatherRes.data.current_weather;

        // Construct Data
        const data = {
            name: name,
            country: country,
            temperature: currentWeather.temperature,
            windspeed: currentWeather.windspeed,
            weathercode: currentWeather.weathercode // OpenMeteo returns a code (0=clear, etc)
        };
        
        res.json(data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'API Error' });
    }
});

// 2. Database Store Route (Create)
router.post('/log', async (req, res) => {
    try {
        const { city, country, temperature, condition, notes } = req.body;
        
        const newTrip = new Trip({ 
            city, 
            country, 
            temperature, 
            condition, 
            notes 
        });
        
        await newTrip.save();
        res.json({ message: 'Trip logged successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 3. Database Retrieve Route (Read)
router.get('/logs', async (req, res) => {
    try {
        // Sort by newest first
        const logs = await Trip.find({}).sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 4. Database Delete Route (Optional but good)
router.post('/delete', async (req, res) => {
    try {
        await Trip.findByIdAndDelete(req.body.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;