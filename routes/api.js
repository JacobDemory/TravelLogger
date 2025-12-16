const express = require('express');
const router = express.Router();
const axios = require('axios');
const Trip = require('../models/Trip');

// 1. External API Route (Weather)
router.get('/weather/:city', async (req, res) => {
    try {
        const city = req.params.city;
        // Step A: Geocoding
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
        const geoRes = await axios.get(geoUrl);

        if (!geoRes.data.results) return res.status(404).json({ error: 'City not found' });

        const { latitude, longitude, name, country } = geoRes.data.results[0];

        // Step B: Weather
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        const weatherRes = await axios.get(weatherUrl);
        const currentWeather = weatherRes.data.current_weather;

        const data = {
            name: name,
            country: country,
            temperature: currentWeather.temperature,
            windspeed: currentWeather.windspeed,
            weathercode: currentWeather.weathercode
        };
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'API Error' });
    }
});

// 2. Create (Log a Trip)
router.post('/log', async (req, res) => {
    try {
        const { city, country, temperature, condition, notes } = req.body;
        const newTrip = new Trip({ city, country, temperature, condition, notes });
        await newTrip.save();
        res.json({ message: 'Trip logged successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 3. Read (Get All Logs)
router.get('/logs', async (req, res) => {
    try {
        const logs = await Trip.find({}).sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 4. Search Logs (Database Search)
router.get('/logs/search', async (req, res) => {
    try {
        const query = req.query.q;
        // Search for city OR notes containing the query (case insensitive)
        const logs = await Trip.find({
            $or: [
                { city: { $regex: query, $options: 'i' } },
                { notes: { $regex: query, $options: 'i' } }
            ]
        }).sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 5. Update (Edit a Trip)
router.post('/update', async (req, res) => {
    try {
        const { id, notes } = req.body;
        // We only allow updating notes to keep it simple, but you could update anything
        await Trip.findByIdAndUpdate(id, { notes: notes });
        res.json({ message: 'Trip updated!' });
    } catch (err) {
        res.status(500).send(err);
    }
});

// 6. Delete
router.post('/delete', async (req, res) => {
    try {
        await Trip.findByIdAndDelete(req.body.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).send(err);
    }
});

// 7. Clear All Logs
router.post('/clear', async (req, res) => {
    try {
        await Trip.deleteMany({}); // Deletes everything in the collection
        res.json({ message: 'All logs cleared!' });
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;