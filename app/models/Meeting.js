const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const meetingSchema = new mongoose.Schema(
  {
    itemId: { type: Number, default: null },
    agendaLocation: { type: String, trim: true, default: null },
    caseNumbers: { type: Array, default: null },
    category: { type: String, trim: true, default: null },
    communityImpactStatement: { type: String, trim: true, default: null },
    councilDistrict: { type: Number, default: null },
    councilFileNumber: { type: String, trim: true, default: null },
    councilVoteInformation: { type: Array, default: null },
    dateReceivedIntroduced: { type: String, trim: true, default: null },
    expirationDate: { type: String, trim: true, default: null },
    externalLink: { type: Array, default: null },
    fileActivities: { type: Array, default: null },
    fiscalImpactStatement: { type: String, trim: true, default: null },
    initiatedBy: { type: String, trim: true, default: null },
    lastChangedDate: { type: String, trim: true, default: null },
    meetingDate: { type: Date, default: null },
    meetingId: { type: String, trim: true, default: null },
    meetingNotes: { type: String, trim: true, default: null },
    mover: { type: Array, default: null },
    moverSeconderComment: { type: Array, default: null },
    region: { type: String, trim: true, default: null },
    second: { type: Array, default: null },
    title: { type: String, trim: true, default: null },
    fileLocation: [
      { type: mongoose.Schema.Types.ObjectId, ref: "document", default: null },
    ],
    supplementalDocs: [
      { type: mongoose.Schema.Types.ObjectId, ref: "document", default: null },
    ],
    projectReferences: [
      { type: mongoose.Schema.Types.ObjectId, ref: "project", default: null },
    ],
  },
  {
    timestamps: true,
    // strict: false,
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
  }
);

meetingSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("meeting", meetingSchema);

// mongoQuery.where({ $text: { $search: searchtext } });
