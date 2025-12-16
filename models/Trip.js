const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
	city: String,
	country: String,
	temperature: Number,
	condition: String, // We'll store the weather code or description
	notes: String,
	date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', tripSchema);