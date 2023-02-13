const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const querySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    query: { type: String, trim: true, default: null },
  },
  { timestamps: true }
);

querySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Query", querySchema);
