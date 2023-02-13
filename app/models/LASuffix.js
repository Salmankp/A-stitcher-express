const mongoose = require('mongoose');

const laSuffixSchema = new mongoose.Schema(
  {
    active: { type: String, trim: true, default: null },
    case_suffix: { type: String, trim: true, default: null },
    description: { type: String, trim: true, default: null },
    prefix_usage: { type: String, trim: true, default: null },
    notes: { type: String, trim: true, default: null },
  },
  { timestamps: true,
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
  }
);

laSuffixSchema.index({ case_suffix: 1 });

module.exports = mongoose.model('la_suffix', laSuffixSchema);

