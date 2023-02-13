const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const documentSchema = new mongoose.Schema(
    {
      internalDocumentBaseUri: {type: String, trim: true, default: null},
      externalDocumentBaseUri: {type: String, trim: true, default: null},
      approvalStatus: {type: String, trim: true, default: null},
      caseId: {type: String, trim: true, default: null},
      caseNumber: {type: String, trim: true, default: null},
      comments: {type: String, trim: true, default: null},
      dateModified: {type: String, trim: true, default: null},
      docType: {type: String, trim: true, default: null},
      docTypeRevision: {type: String, trim: true, default: null},
      documentCategory: {type: String, trim: true, default: null},
      documentIdentifier: {type: String, trim: true, default: null},
      encodedId: {type: String, trim: true, default: null},
      extZaCardNumber: {type: String, trim: true, default: null},
      externalUrl: {type: String, trim: true, default: null},
      id: {type: String, trim: true, default: null},
      internalUrl: {type: String, trim: true, default: null},
      isApprovedPlan: {type: String, trim: true, default: null},
      ordinanceNumber: {type: String, trim: true, default: null},
      originalZaCardNumber: {type: String, trim: true, default: null},
      pddTypeCode: {type: String, trim: true, default: null},
      planApprovalDescription: {type: String, trim: true, default: null},
      planApprovalProcessNumber: {type: String, trim: true, default: null},
      processLevel: {type: String, trim: true, default: null},
      processStatus: {type: String, trim: true, default: null},
      scanDate: {type: String, trim: true, default: null},
      signedOff: {type: String, trim: true, default: null},
      sortDocType: {type: String, trim: true, default: null},
      sortDocumentIdentifier: {type: String, trim: true, default: null},
      tpId: {type: Number, default: null},
      listGuid: {type: String, trim: true, default: null},
      listType: {type: String, trim: true, default: null},
      dbType: {type: String, trim: true, default: null},
      dbFileId: {type: String, trim: true, default: null},
      file_location: {type: String, trim: true, default: null},
      document_type: {type: String, trim: true, default: null},
      meetingIdReference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'meeting',
        default: null,
      },
      caseReference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'case',
        default: null,
      },
      projectReference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project',
        default: null,
      },
      No_of_Corrections_Made_on_Initial_QAd_Output: {
        type: String,
        trim: true,
        default: null,
      },
      CF_Notes_Remarks: {type: String, trim: true, default: null},
      meta: Object,
      statue: {type: String, trim: true, default: null},
    },
    {
      timestamps: true,
      // So `res.json()` and other `JSON.stringify()`
      // functions include virtuals
      toJSON: {virtuals: true},
      // So `console.log()` and other
      // functions that use `toObject()` include virtuals
      toObject: {virtuals: true},
    },
);

documentSchema.virtual('project', {
  ref: 'project', // the collection/model name
  localField: 'projectReference',
  foreignField: '_id',
  justOne: true, // default is false
});

documentSchema.virtual('case', {
  ref: 'case', // the collection/model name
  localField: 'caseReference',
  foreignField: '_id',
  justOne: true, // default is false
});

documentSchema.index({dbFileId: 1});
documentSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('document', documentSchema);
