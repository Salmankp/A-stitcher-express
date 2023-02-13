const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    LogMessage: { type: String, trim: true, default: null },
    error: { type: Boolean, default: null },
    LogObject: { type: Object, default: null },
    Origin: { type: String, trim: true, default: null }
  },
  { timestamps: true,
    strict: false,
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
  }
);

module.exports = mongoose.model('log', logSchema);

// mongoQuery.where({ $text: { $search: searchtext } });

