const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    item_name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String
    },
    is_available: {
        type: Boolean,
        default: true
    },
    discount_percent: {
        type: Number,
        default: 0
    },
    sequence: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Menu', menuSchema);
