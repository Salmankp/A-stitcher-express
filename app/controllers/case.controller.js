const Project = require('../models/Project');
const Case = require('../models/Case');
const Document = require('../models/Document');
const Property = require('../models/Property');
const LaPrefix = require('../models/LAPreifix');
const LaSuffix = require('../models/LASuffix');
const {ERROR_CODES, SUCCESS_CODE} = require('../constants/index');

const index = async (req, res, _next) => {
  try {
    const limit = 20;
    let offset = 0;
    if (req.query.page_number && req.query.page_number == 1) offset = 0;
    else if (req.query.page_number && req.query.page_number > 1) {
      offset = (req.query.page_number - 1) * limit;
    }
    const cases = await Case.paginate(
        {},
        {
          offset: offset,
          limit: limit,
          populate: [
            {
              path: 'projectReference',
              populate: [
                {
                  path: 'entityReferences',
                  select: {
                    name: 1,
                    companyFirm: 1,
                    email: 1,
                    primaryContact: 1,
                    address: 1,
                    city: 1,
                    zipCode: 1,
                    state: 1,
                    category: 1,
                    unit: 1,
                  },
                },
                {path: 'propertyReferences'},
                {
                  path: 'documentReferences',
                  select: {docType: 1},
                },
              ],
            },
            {path: 'documents'},
            {path: 'meetingReferences'},
          ],
        },
    ).then((cases) => {
      return cases;
    });
    if (cases.length <= 0) {
      return res.status(ERROR_CODES.BAD_REQUEST).json({
        error: false,
        message: 'No cases has been added so far!',
      });
    }
    return res.status(SUCCESS_CODE).json({
      error: false,
      cases: cases,
    });
  } catch (error) {
    return res.status(ERROR_CODES.BAD_REQUEST).json({
      error: true,
      message: 'No cases has been added so far!',
    });
  }
};

const store = async (req, res, _next) => {
  try {
    let propertyId = await Property
        .findOne({addressTxt: req.body.primaryAddress});
    if (propertyId) {
      propertyId = propertyId._id;
    } else {
      propertyId = null;
    }
    delete req.body.primaryPropId;

    let caseNbrId = await Case.findOne({
      caseNbr: {$in: req.body.related_cases},
    });
    if (caseNbrId) {
      caseNbrId = caseNbrId._id;
    } else {
      caseNbrId = null;
    }
    delete req.body.related_cases;

    const caseRecord = new Case(req.body);
    caseRecord.primaryPropId = propertyId;
    caseRecord.related_cases.push(caseNbrId);
    await caseRecord.save();
    if (req.body.projectReference) {
      await Project.updateOne(
          {_id: req.body.projectReference},
          {
            $push: {
              caseReferences: caseRecord._id,
            },
          },
      );
    }
    if (req.body.documents) {
      await Document.updateMany(
          {_id: {$in: req.body.documents}},
          {
            $set: {
              caseReference: caseRecord._id,
            },
          },
          {multi: true},
      );
    }
    return res.status(SUCCESS_CODE).json({
      message: 'Case created Successfully !',
      caseRecord,
    });
  } catch (error) {
    console.log('rrrr', error);
    const validationErrors = req.flash('validation_errors');
    if (validationErrors.length > 0) {
      return res.status(ERROR_CODES.BAD_REQUEST).json({
        error: true,
        message: validationErrors,
      });
    }
  }
};

const update = async (req, res, _next) => {
  const caseRecord = await Case.findOne({
    _id: req.params.id,
  });
  caseRecord.related_cases = [];
  if (!caseRecord) {
    return res.status(ERROR_CODES.BAD_REQUEST).json({
      error: false,
      message: 'Case not exists',
    });
  } else {
    try {
      let caseResponse;
      let propertyId = await Property.findOne({
        addressTxt: req.body.primaryAddress,
      });
      if (propertyId) {
        propertyId = propertyId._id;
      } else {
        propertyId = null;
      }
      delete req.body.primaryPropId;

      let caseNbrId = await Case.findOne({
        caseNbr: {$in: req.body.related_cases},
      });
      if (caseNbrId) {
        caseNbrId = caseNbrId._id;
      } else {
        caseNbrId = null;
      }
      delete req.body.related_cases;

      const caseRecord = new Case(req.body);

      const response = await caseRecord.update(req.body);
      caseRecord.primaryPropId = propertyId;

      caseRecord.related_cases.push(caseNbrId);

      await caseRecord.save();
      if (response) {
        caseResponse = await Case.findOne({
          _id: caseRecord._id,
        });

        if (req.body.projectReference) {
          await Project.updateOne(
              {_id: caseRecord.projectReference},
              {
                $pull: {
                  caseReferences: caseRecord._id,
                },
              },
          );

          await Project.updateOne(
              {_id: req.body.projectReference},
              {
                $push: {
                  caseReferences: caseRecord._id,
                },
              },
          );
        }

        if (req.body.documents) {
          await Document.updateMany(
              {_id: {$in: caseRecord.documents}},
              {
                $set: {
                  caseReference: null,
                },
              },
              {multi: true},
          );

          await Document.updateMany(
              {_id: {$in: req.body.documents}},
              {
                $set: {
                  caseReference: caseRecord._id,
                },
              },
              {multi: true},
          );
        }
      }
      return res.status(SUCCESS_CODE).json({
        case: caseResponse,
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
  const caseRecord = await Case.findOne({
    _id: req.params.id,
  })
      .sort({updatedAt: -1})
      .populate({
        path: 'projectReference',
        populate: [
          {
            path: 'entityReferences',
            select: {
              name: 1,
              companyFirm: 1,
              email: 1,
              primaryContact: 1,
              address: 1,
              city: 1,
              zipCode: 1,
              state: 1,
              category: 1,
              unit: 1,
            },
          },
          {path: 'propertyReferences'},
          {
            path: 'documentReferences',
            select: {docType: 1},
          },
        ],
      })
      .populate('documents')
      .populate('meetingReferences');
  if (!caseRecord) {
    return res.status(ERROR_CODES.BAD_REQUEST).json({
      error: false,
      message: 'Case not exists',
    });
  } else {
    try {
      return res.status(SUCCESS_CODE).json({
        case: caseRecord,
      });
    } catch (error) {
      const validationErrors = req.flash('validation_errors');
      if (validationErrors.length > 0) {
        return res.status(ERROR_CODES.BAD_REQUEST).json({
          error: true,
          message: validationErrors,
        });
      }
    }
  }
};

const destroy = async (req, res, _next) => {
  try {
    const id = req.params.id;

    const caseRecord = await Case.findOne({
      _id: id,
    });

    await Project.updateOne(
        {_id: caseRecord.projectReference},
        {
          $pull: {
            caseReferences: caseRecord._id,
          },
        },
    );

    await Document.deleteMany({_id: caseRecord.documents});

    await Case.findOneAndDelete({
      _id: id,
    });

    return res.status(SUCCESS_CODE).json({
      message: 'Record deleted successfully',
    });
  } catch (error) {
    return res.status(ERROR_CODES.BAD_REQUEST).json({
      error: false,
      message: 'Case not exists',
    });
  }
};

const caseSingleGet = async (req, res) => {
  try {
    const caseNbr = req.params.caseNbr ? req.params.caseNbr : '';
    const caseRecord = await Case.findOne({caseNbr: caseNbr});
    if (caseRecord) {
      const result = await Case.findOne({caseNbr: caseNbr})
          .populate({
            path: 'projectReference',
            populate: [
              {
                path: 'entityReferences',
                select: {
                  name: 1,
                  companyFirm: 1,
                  email: 1,
                  primaryContact: 1,
                  address: 1,
                  city: 1,
                  zipCode: 1,
                  state: 1,
                  category: 1,
                  unit: 1,
                },
                populate: {
                  path: 'entity_categories',
                  match: {project_id: caseRecord.projectReference},
                },
              },
              {path: 'propertyReferences'},
              {
                path: 'documentReferences',
                select: {docType: 1},
              },
            ],
          })
          .populate({
            path: 'documents',
            select: {docType: 1},
          })
          .populate({path: 'meetingReferences'});
      res.status(200).json({status: 200, data: [result]});
    } else {
      res
          .status(400)
          .json({status: 400, message: 'Case not found against that caseNbr.'});
    }
  } catch (error) {
    console.log('project_single_get error', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};

const insertScrapedData = async (req, res) => {
  try {
    const caseBulkOps = req.body.case_objects.map((object) => ({
      updateOne: {
        filter: {caseNbr: object.caseNbr},
        update: object,
        upsert: true,
      },
    }));
    await Case.bulkWrite(caseBulkOps)
        .then(console.log.bind(console, 'BULK update OK:'))
        .catch(console.error.bind(console, 'BULK update error:'));
    let project = null;
    if (req.body.case_objects[0] != undefined) {
      if (
        req.body.case_objects[0].project_id &&
        req.body.case_objects[0].project_id != null
      ) {
        project = await Project.findById(req.body.case_objects[0].project_id);
      } else {
        project = new Project({baseCases: []});
        await project.save();
      }
    }

    for (const object of req.body.case_objects) {
      const caseRecord = await Case.findOne({caseNbr: object.caseNbr});
      caseRecord.related_cases = [];
      await caseRecord.save();
      if (caseRecord) {
        if (project) {
          if (!project.caseReferences.includes(caseRecord._id)) {
            project.caseReferences.push(caseRecord._id);
          }
          await Case.updateOne(
              {_id: caseRecord._id},
              {projectReference: project._id},
          );
          await handlePrefixSuffix(project, caseRecord);
          if (object.related_cases) {
            for (const relatedCaseNumber of object.related_cases) {
              const relatedCase = await Case.findOne({
                caseNbr: relatedCaseNumber,
              });
              if (relatedCase) {
                if (!caseRecord.related_cases.includes(relatedCase._id)) {
                  caseRecord.related_cases.push(relatedCase._id);
                }
              }
            }
            await caseRecord.save();
          }
        }
      }
    }
    await project.save();
    res.status(200).json({
      status: 200,
      message: 'Cases scrapped data inserted successfully.',
      project_id: project._id,
    });
  } catch (error) {
    console.log('insert scrapped data of cases error', error.stack);
    res.status(500).json({status: 500, data: error});
  }
};

const handlePrefixSuffix = async (project, caseRecord) => {
  try {
    const splitWords =
    caseRecord.caseNbr !== null ? caseRecord.caseNbr.split('-') : [];
    for (const word of splitWords) {
      let suffixWord = '';
      const prefix = await LaPrefix.findOne({case_prefix: word});
      if (prefix) {
        if (!project.prefixCategories.includes(prefix.description)) {
          project.prefixCategories.push(prefix.description);
        }
      }

      if (word === '5A') suffixWord = '5A';
      else if (/^[0-9]+A$/.test(word)) suffixWord = '(n)A';
      else if (/^ADD[0-9]+$/.test(word)) suffixWord = 'ADD(n)';
      else if (/^AMDT[0-9]+$/.test(word)) suffixWord = 'AMDT(n)';
      else if (/^CC[0-9]+$/.test(word)) suffixWord = 'CC(n)';
      else if (/^EXT[0-9]+$/.test(word)) suffixWord = 'EXT(n)';
      else if (/^M[0-9]+$/.test(word)) suffixWord = 'M(n)';
      else if (/^PA[0-9]+$/.test(word)) suffixWord = 'PA(n)';
      else if (/^P[0-9]+$/.test(word)) suffixWord = 'P(n)';
      else if (/^REC[0-9]+$/.test(word)) suffixWord = 'REC(n)';
      else if (/^SUP[0-9]+$/.test(word)) suffixWord = 'SUP(n)';
      else suffixWord = word;
      const suffix = await LaSuffix.findOne({case_suffix: suffixWord});
      if (suffix) {
        if (!project.suffixCategories.includes(suffix.description)) {
          project.suffixCategories.push(suffix.description);
        }
      }
    }
    await project.save();
    await handleBaseCase(project, splitWords);
  } catch (error) {
    console.log('handle prefix suffix', error.stack);
    res.status(500).json({status: 500, data: error});
  }
};

const handleBaseCase = async (project, splitWords) => {
  try {
    const baseCase = project.baseCases ? project.baseCases : [];
    if (
      splitWords[0] == 'PS' ||
      splitWords[0] == 'TT' ||
      splitWords[0] == 'VTT' ||
      splitWords.length == 2
    ) {
      const str = splitWords[0] + '-' + splitWords[1];
      if (!baseCase.includes(str)) baseCase.push(str);
    } else if (splitWords.length > 2) {
      const str = splitWords[0] + '-' + splitWords[1] + '-' + splitWords[2];
      if (!baseCase.includes(str)) baseCase.push(str);
    }
    project.baseCases = baseCase;
    await project.save();
  } catch (error) {
    console.log('handle base case', error.stack);
    res.status(500).json({status: 500, data: error});
  }
};

const searchCase = async (req, res) => {
  try {
    let projectId = null;
    const project = await Project.findOne({
      baseCases: {$in: req.body.base_cases},
    });
    if (project) projectId = project._id;
    else {
      const caseRecord = await Case.findOne({
        caseNbr: {$in: req.body.case_numbers},
      });
      if (caseRecord) projectId=caseRecord.projectReference;
    }
    res.status(200).json({status: 200, projectId});
  } catch (error) {
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};

const getCasesStartsWith = async (req, res) => {
  try {
    const limit = 20;
    let offset = 0;
    if (req.query.page_number && req.query.page_number == 1) offset = 0;
    else if (req.query.page_number && req.query.page_number > 1) {
      offset = (req.query.page_number - 1) * limit;
    }
    let caseNumbers = await Case.paginate(
        {caseNbr: {$regex: '^' + req.query.starting_character}},
        {
          offset: offset,
          limit: limit,
          select: 'caseNbr',
        },
    ).then((caseNumbers) => {
      return caseNumbers;
    });
    caseNumbers = caseNumbers.docs.map((document) => {
      return document;
    });
    res.status(200).json({status: 200, caseNumbers});
  } catch (error) {
    console.log('get_cases_starts_with error', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};

const getCaseNumberBycompletedFlg = async (req, res) => {
  try {
    let baseCasesData = [];
    const cases = await Case.find(
        {completedFlg: req.params.option},
        {_id: 1},
    ).populate({
      path: 'projectReference',
      select: ['baseCases'],
      match: {baseCases: {$exists: true, $ne: []}},
    });
    cases?.forEach((item) => {
      if (item.projectReference) {
        baseCasesData.push(item.projectReference.baseCases);
      }
    });
    baseCasesData = baseCasesData.flat(1);
    res.status(200).json({status: 200, baseCasesData});
  } catch (error) {
    console.log('get_cases_starts_with error', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};

module.exports = {
  index,
  store,
  show,
  update,
  destroy,
  caseSingleGet,
  insertScrapedData,
  searchCase,
  getCasesStartsWith,
  getCaseNumberBycompletedFlg,
};
