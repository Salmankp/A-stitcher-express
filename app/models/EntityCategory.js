const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const entityCategorySchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
      default: null,
    },
    entity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "entity",
      default: null,
    },
    category: { type: String, trim: true, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
  }
);

entityCategorySchema.index({ project_id: 1 });
entityCategorySchema.index({ entity_id: 1 });

entityCategorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("entity_category", entityCategorySchema);
