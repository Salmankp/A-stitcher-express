const mongoose = require("mongoose");

const fieldsAllowedValuesSchema = new mongoose.Schema(
  {
    fieldName: { type: String, trim: true, default: null },
    allowedValue: { type: String, trim: true, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

fieldsAllowedValuesSchema.index({ allowedValue: 1 });

module.exports = mongoose.model("fields_allowed_value", fieldsAllowedValuesSchema);
