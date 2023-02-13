const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");

const entitySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: null },
    address: { type: String, trim: true, default: null },
    email: { type: String, trim: true, default: null },
    primaryContact: { type: String, trim: true, default: null },
    phoneNumber: { type: String, trim: true, default: null },
    category: { type: String, default: null, trim: true },
    phoneNumberExt: { type: String, trim: true, default: null },
    companyFirm: { type: String, trim: true, default: null },
    city: { type: String, trim: true, default: null },
    state: { type: String, trim: true, default: null },
    unit: { type: String, trim: true, default: null },
    zipCode: { type: String, trim: true, default: null },
    entityCategoriesReferences : [
      {type: mongoose.Schema.Types.ObjectId,ref:'entity_category', default:null}
    ],    
    status: { type: String, trim: true, default: null },
    // documents : [
    //   {type: mongoose.Schema.Types.ObjectId,ref:'project_document'}
    // ],
    projectReferences : [
        {type: mongoose.Schema.Types.ObjectId,ref:'project', default: null}
    ]
  },
  { timestamps: true,
    // strict: false,
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
  }
);
entitySchema.index({ name: 1, companyFirm:1 });
entitySchema.index({ name: "text", companyFirm: "text", email: "text", address: "text", state: "text", city: "text" });

// entitySchema.pre('save', function (next) {
//   // capitalize
//   if(this.name && this.name!=null){
//     let splitStr = this.name.toLowerCase().split(' ');
//     for (let i = 0; i < splitStr.length; i++) {
//         // You do not need to check if i is larger than splitStr length, as your for does that for you
//         // Assign it back to the array
//         splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
//     }
//     // Directly return the joined string
//     this.name = splitStr.join(' '); 
//   }
//   if(this.companyFirm && this.companyFirm!=null){
//     let splitStrComp = this.companyFirm.toLowerCase().split(' ');
//     for (let i = 0; i < splitStrComp.length; i++) {
//         // You do not need to check if i is larger than splitStr length, as your for does that for you
//         // Assign it back to the array
//         splitStrComp[i] = splitStrComp[i].charAt(0).toUpperCase() + splitStrComp[i].substring(1);     
//     }
//     // Directly return the joined string
//     this.companyFirm = splitStrComp.join(' '); 
//   }
//   if(this.primaryContact && this.primaryContact!=null){
//     var cleaned = ('' + this.primaryContact).replace(/\D/g, '');
//     var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
//     if (match) {
//       this.primaryContact = '(' + match[1] + ') ' + match[2] + '-' + match[3];
//     }
//   }
//   next();
// });

entitySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('entity', entitySchema);

// mongoQuery.where({ $text: { $search: searchtext } });

