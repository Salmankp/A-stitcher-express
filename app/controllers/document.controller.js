const Document = require('../models/Document');
const Project = require('../models/Project');
const Meeting = require('../models/Meeting');
const Case = require('../models/Case');
const xlsx = require('node-xlsx');
const {ERROR_CODES, SUCCESS_CODE} = require('../constants/index');

const index = async (req, res, _next) => {
  try {
    const limit = 20;
    let offset = 0;
    if (req.query.page_number && req.query.page_number == 1) offset = 0;
    else if (req.query.page_number && req.query.page_number > 1) {
      offset = (req.query.page_number - 1) * limit;
    }
    const documents = await Document.paginate(
        {},
        {
          offset: offset,
          limit: limit,
          populate: [
            {path: 'caseReference'},
            {path: 'meetingIdReference'},
            {path: 'projectReference'},
          ],
        },
    ).then((documents) => {
      return documents;
    });

    if (documents.length <= 0) {
      return res.status(ERROR_CODES.BAD_REQUEST).json({
        error: false,
        message: 'No documents has been added so far!',
      });
    }
    documents.docs = documents.docs.map((document) => {
      document.dbFileId = process.env.BUCKET_URL.concat(document.dbFileId);
      return document;
    });
    return res.status(SUCCESS_CODE).json({
      error: false,
      documents: documents,
    });
  } catch (error) {
    return res.status(ERROR_CODES.BAD_REQUEST).json({
      error: true,
      message: 'No documents has been added so far!',
    });
  }
};

const store = async (req, res, _next) => {
  try {
    const dbFileId = await Document.findOne({dbFileId: req.body.dbFileId});
    let documentRecord;
    if (dbFileId) {
      documentRecord = await Document.findOne({_id: dbFileId._id});
    } else {
      documentRecord = new Document(req.body);
      await documentRecord.save();
    }
    if (req.body.projectReference) {
      await Project.updateOne(
          {_id: req.body.projectReference},
          {
            $push: {
              documentReferences: documentRecord._id,
            },
          },
      );
    }

    if (req.body.caseReference) {
      await Case.updateOne(
          {_id: req.body.caseReference},
          {
            $push: {
              documents: documentRecord._id,
            },
          },
      );
    }

    if (req.body.meetingIdReference) {
      await Meeting.updateOne(
          {_id: req.body.meetingIdReference},
          {
            $push: {
              supplementalDocs: documentRecord._id,
            },
          },
      );
    }

    return res.status(SUCCESS_CODE).json({
      status: 200,
      message: 'Documet created Successfully !',
      documentRecord,
    });
  } catch (error) {
    console.log('error', error);
    return res.status(ERROR_CODES.BAD_REQUEST).json({
      error: true,
      message: error,
    });
  }
};

const update = async (req, res, _next) => {
  const documentRecord = await Document.findOne({
    _id: req.params.id,
  });
  if (!documentRecord) {
    return res.status(ERROR_CODES.BAD_REQUEST).json({
      error: false,
      message: 'Document not exists',
    });
  } else {
    try {
      let documentResponse;
      const response = await documentRecord.update(req.body);
      if (response) {
        documentResponse = await Document.findOne({
          _id: documentRecord._id,
        });

        if (req.body.projectReference) {
          await Project.updateOne(
              {_id: documentRecord.projectReference},
              {
                $pull: {
                  documentReferences: documentRecord._id,
                },
              },
          );

          await Project.updateOne(
              {_id: req.body.projectReference},
              {
                $push: {
                  documentReferences: documentRecord._id,
                },
              },
          );
        }

        if (req.body.caseReference) {
          await Case.updateOne(
              {_id: documentRecord.caseReference},
              {
                $pull: {
                  documents: documentRecord._id,
                },
              },
          );

          await Case.updateOne(
              {_id: req.body.caseReference},
              {
                $push: {
                  documents: documentRecord._id,
                },
              },
          );
        }

        if (req.body.meetingIdReference) {
          await Meeting.updateOne(
              {_id: documentRecord.meetingIdReference},
              {
                $pull: {
                  supplementalDocs: documentRecord._id,
                },
              },
          );

          await Meeting.updateOne(
              {_id: req.body.meetingIdReference},
              {
                $push: {
                  supplementalDocs: documentRecord._id,
                },
              },
          );
        }
      }
      return res.status(SUCCESS_CODE).json({
        case: documentResponse,
      });
    } catch (error) {
      return res.status(ERROR_CODES.BAD_REQUEST).json({
        error: true,
        message: error,
      });
    }
  }
};

const show = async (req, res, _next) => {
  const documentRecord = await Document.findOne({
    _id: req.params.id,
  })
      .sort({updatedAt: -1})
      .populate('caseReference')
      .populate('meetingIdReference')
      .populate('projectReference');
  if (!documentRecord) {
    return res.status(ERROR_CODES.BAD_REQUEST).json({
      error: false,
      message: 'Document not exists',
    });
  } else {
    try {
      documentRecord.dbFileId = process.env.BUCKET_URL.concat(
          documentRecord.dbFileId,
      );
      return res.status(SUCCESS_CODE).json({
        document: documentRecord,
      });
    } catch (error) {
      return res.status(ERROR_CODES.BAD_REQUEST).json({
        error: true,
        message: error,
      });
    }
  }
};

const destroy = async (req, res, _next) => {
  try {
    const id = req.params.id;

    const documentRecord = await Document.findOne({
      _id: id,
    });

    await Project.updateOne(
        {_id: documentRecord.projectReference},
        {
          $pull: {
            documentReferences: documentRecord._id,
          },
        },
    );

    await Case.updateOne(
        {_id: documentRecord.caseReference},
        {
          $pull: {
            documents: documentRecord._id,
          },
        },
    );

    await Meeting.updateOne(
        {_id: documentRecord.meetingIdReference},
        {
          $pull: {
            supplementalDocs: documentRecord._id,
          },
        },
    );

    await Document.findOneAndDelete({
      _id: id,
    });

    return res.status(SUCCESS_CODE).json({
      message: 'Record deleted successfully',
    });
  } catch (error) {
    return res.status(ERROR_CODES.BAD_REQUEST).json({
      error: false,
      message: 'Document not exists',
    });
  }
};

// const documents_get = async (req, res) => {
//   try {
//     // Fetch Data from Request
//     const q = req.query.q ? req.query.q.trim() : "";
//     const buildingType =
//     req.query.buildingType ? req.query.buildingType : "";
//     const lotSize = req.query.lotSize ? req.query.lotSize : "";
//     const numberOfParkingSpaces = req.query.numberOfParkingSpaces
//       ? req.query.numberOfParkingSpaces
//       : 0;
//     const numberOfUnits =
//     req.query.numberOfUnits ? req.query.numberOfUnits : 0;
//     const zoning = req.query.zoning ? req.query.zoning : "";
//     const far = req.query.far ? req.query.far : "";
//     const setback = req.query.setback ? req.query.setback : "";
//     const varianceType =
//     req.query.varianceType ? req.query.varianceType : "";
//     const cityPlanner = req.query.cityPlanner ? req.query.cityPlanner : "";
//     console.log("Query:", q);

//     // Process
//     // Save Query in Database
//     if (q !== "") {
//       const newQuery = new Query({
//         user: req.user._id,
//         query: q.toLowerCase(),
//       });
//       await newQuery.save();
//     }

//     // Find Query
//     const dbQuery = Document.find();
//     if (q != "") dbQuery.where({ $text: { $search: `\"${q}\"` } });
//     dbQuery.sort({ createdAt: "desc" });
//     dbQuery.select("-content").lean();
//     let documents = await dbQuery.exec();
//     documents = _.groupBy(documents, "project");

//     let data = [];
//     for (const projectId in documents) {
//       let project;
//       if (projectId == "null") {
//         project = {
//           title: "Not Assigned",
//           description: "",
//           latitude: null,
//           longitude: null,
//           location: null,
//         };
//       } else {
//         project = await Project.findById(projectId).lean();
//       }
//       project.documents = documents[projectId];
//       data.push(project);
//     }

//     data = data.filter((project) => {
//       const cond1 =
//         buildingType != ""
//           ? project?.filters?.buildingType?.includes(buildingType)
//           : true;
//       const cond2 =
//         lotSize != "" ? project?.filters?.lotSize?.includes(lotSize) : true;
//       const cond3 =
//         numberOfParkingSpaces != 0
//           ? project?.filters?.numberOfParkingSpaces == numberOfParkingSpaces
//           : true;
//       const cond4 =
//         numberOfUnits != 0
//           ? project?.filters?.numberOfUnits == numberOfUnits
//           : true;
//       const cond5 =
//         zoning != "" ? project?.filters?.zoning?.includes(zoning) : true;
//       const cond6 = far != "" ? project?.filters?.far?.includes(far) : true;
//       const cond7 =
//         setback != "" ? project?.filters?.setback?.includes(setback) : true;
//       const cond8 =
//         varianceType != ""
//           ? project?.filters?.varianceType?.includes(varianceType)
//           : true;
//       const cond9 =
//         cityPlanner != ""
//           ? project?.filters?.cityPlanner?.includes(cityPlanner)
//           : true;
//       return (
//         cond1 &&
//         cond2 &&
//         cond3 &&
//         cond4 &&
//         cond5 &&
//         cond6 &&
//         cond7 &&
//         cond8 &&
//         cond9
//       );
//     });

//     res.status(200).json({ status: 200, data });
//   } catch (error) {
//     console.log("documents_get error", error.stack);
//     res.status(500).json({ status: 500, data: "Server Error" });
//   }
// };

const getDocumentSubtypes = async (req, res) => {
  try {
    const limit = 20;
    let offset = 0;
    if (req.query.page_number && req.query.page_number == 1) offset = 0;
    else if (req.query.page_number && req.query.page_number > 1) {
      offset = (req.query.page_number - 1) * limit;
    }
    const documents = await Document.paginate(
        {},
        {
          offset: offset,
          limit: limit,
        },
    ).then((documents) => {
      return documents;
    });
    const subTypesSet = new Set();
    subTypesSet.add('All');
    for (let i = 0; i < documents.length; i++) {
      subTypesSet.add(documents[i].subType);
    }
    const data = Array.from(subTypesSet);

    res.status(200).json({status: 200, data});
  } catch (error) {
    console.log('documents_subtypes_get error', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};

const insertScrapedData = async (req, res) => {
  try {
    const bulkOps = req.body.record_objects.map((object) => ({
      updateOne: {
        filter: {dbFileId: object.dbFileId},
        update: object,
        upsert: true,
      },
    }));

    const propDBFileIds = req.body.record_objects.map(function(object) {
      return object.dbFileId;
    });

    await Document.bulkWrite(bulkOps)
        .then(console.log.bind(console, 'BULK update OK:'))
        .catch(console.error.bind(console, 'BULK update error:'));

    const project = await Project.findOne({
      _id: req.body.record_objects[0].projectReference,
    });
    const documents = await Document.find({
      dbFileId: {$in: propDBFileIds},
    });
    for (const document of documents) {
      if (project) {
        if (!project.documentReferences.includes(document._id)) {
          project.documentReferences.push(document._id);
        }
      }
      const caseRecord = await Case.findOne({caseNbr: document.caseNumber});
      if (caseRecord) {
        if (!caseRecord.documents.includes(document._id)) {
          caseRecord.documents.push(document._id);
        }
        await caseRecord.save();
        document.caseReference = caseRecord._id;
        await document.save();
      }
    }
    await project?.save();
    res.status(200).json({
      status: 200,
      message: 'Documents scrapped data inserted successfully.',
    });
  } catch (error) {
    console.log('insert scrapped data of document error', error.stack);
    res.status(500).json({status: 500, data: error});
  }
};

const importCsvQaData = async (req, res) => {
  try {
    const categories = xlsx
        .parse(__dirname + '/Resource Engagements.xlsx'); // parses a file
    for (const category of categories) {
      if (category.name === 'Dev Availability') {
        for (const dev of category.data.slice(1)) {
          if (dev.length > 0) {
            if (dev[0]) {
              const employee = await EmployeeModel.findOne({
                where: {name: dev[0].toLowerCase()},
              });
              if (employee) {
                await employee.update({
                  is_sqa: false,
                });
              }
            }
          }
        }
      } else if (category.name === 'QA Availability') {
        for (const dev of category.data.slice(1)) {
          if (dev.length > 0) {
            if (dev[0]) {
              const employee = await EmployeeModel.findOne({
                where: {name: dev[0].toLowerCase()},
              });
              if (employee) {
                await employee.update({
                  is_sqa: true,
                  sqa_status: dev[11],
                });
              }
            }
          }
        }
      }
    }
    res.status(200).json({message: 'sqa data imported'});
  } catch (e) {
    console.log(e);
    res.status(500).json({error: e.message});
  }
};

module.exports = {
  index,
  store,
  show,
  update,
  destroy,
  importCsvQaData,
  insertScrapedData,
  getDocumentSubtypes,
};
