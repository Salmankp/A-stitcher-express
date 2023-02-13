const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    refreshToken: { type: String, trim: true, default: null },
    user_id: { type: String, trim: true, default: null }
  },
  { timestamps: true,
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
  }
);

module.exports = mongoose.model('refresh_token', tokenSchema);

// mongoQuery.where({ $text: { $search: searchtext } });

