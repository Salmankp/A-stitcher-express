const mongoose = require("mongoose");

const propertyScema = new mongoose.Schema(
  {
    // parcelNumber: { type: String, trim: true, default: null },
    // longitude: { type: String, trim: true, default: null },
    // latitude: { type: String, trim: true, default: null },
    // lot_area: { type: String, trim: true, default: null },
    propId: { type: Number, default: null },
    status: { type: String, trim: true, default: null },
    addressTxt: { type: String, trim: true, default: null },
    apcAreaCd: { type: String, trim: true, default: null },
    arbNbr: { type: String, trim: true, default: null },
    assrPrclNbr: { type: String, trim: true, default: null },
    blckNbr: { type: String, trim: true, default: null },
    boeDistMapNbr: { type: String, trim: true, default: null },
    boeVldAddrFlg: { type: String, trim: true, default: null },
    censusTractNbr: { type: String, trim: true, default: null },
    cncCd: { type: String, trim: true, default: null },
    cncDesc: { type: String, trim: true, default: null },
    cnclDistNbr: { type: String, trim: true, default: null },
    environClrncDt: { type: String, trim: true, default: null },
    environClrncNbr: { type: String, trim: true, default: null },
    hpoz: { type: String, trim: true, default: null },
    lotAreaSqFtNbr: { type: String, trim: true, default: null },
    lotDimTxt: { type: String, trim: true, default: null },
    lotNbr: { type: String, trim: true, default: null },
    multiLotFlg: { type: String, trim: true, default: null },
    multiPrclFlg: { type: String, trim: true, default: null },
    oldStrnmTxt: { type: String, trim: true, default: null },
    parntPropId: { type: String, trim: true, default: null },
    pin: { type: String, trim: true, default: null },
    planAreaNbr: { type: String, trim: true, default: null },
    planLandUseTxt: { type: String, trim: true, default: null },
    planZoneTxt: { type: String, trim: true, default: null },
    projectReference: { type: String, trim: true, default: null },
    propCmnNm: { type: String, trim: true, default: null },
    propCurrUsgeTxt: { type: String, trim: true, default: null },
    propRetDt: { type: String, trim: true, default: null },
    propTypCd: { type: String, trim: true, default: null },
    strDirCd: { type: String, trim: true, default: null },
    strFracNbr: { type: String, trim: true, default: null },
    strFracNbrRngEnd: { type: String, trim: true, default: null },
    strNbr: { type: String, trim: true, default: null },
    strNbrRngEnd: { type: String, trim: true, default: null },
    strNm: { type: String, trim: true, default: null },
    strSfxCd: { type: String, trim: true, default: null },
    strSfxDirCd: { type: String, trim: true, default: null },
    strUnitTypCd: { type: String, trim: true, default: null },
    totProjSqFtNbr: { type: String, trim: true, default: null },
    tractNbr: { type: String, trim: true, default: null },
    unitNbr: { type: String, trim: true, default: null },
    unitNbrRngEnd: { type: String, trim: true, default: null },
    zipCd: { type: String, trim: true, default: null },
    zipCdSfx: { type: String, trim: true, default: null },
    zoneMapNbr: { type: String, trim: true, default: null },
    zoneRegCd: { type: String, trim: true, default: null },
    primaryCnclDistNbr: { type: String, trim: true, default: null },
    primaryPin: { type: String, trim: true, default: null },
    projectReferences: [
      { type: mongoose.Schema.Types.ObjectId, ref: "project" },
    ],
  },
  {
    timestamps: true,
    // strict: false,
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
  }
);

propertyScema.index({ propId: 1 });

module.exports = mongoose.model("property", propertyScema);

// mongoQuery.where({ $text: { $search: searchtext } });
