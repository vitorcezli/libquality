const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
    repository: {type: String, required: true},
});

/* According to documentation, "LibQuality should keep track of searches by
project and by user visit. I am adding this index to retrieve efficiently the
time that a user searched about some project. */
searchSchema.index({repository: 1, created_at: 1});

module.exports = mongoose.model('search', searchSchema);
