const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
	city: String,
	state: String,
	country: String,
	temperature: Number,
	condition: String,
	notes: String,
	date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', tripSchema);