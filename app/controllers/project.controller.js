const Entity = require('../models/Entity');
const Project = require('../models/Project');
const Property = require('../models/Property');
const Case = require('../models/Case');
const Document = require('../models/Document');
const Meeting = require('../models/Meeting');
const LaPrefix = require('../models/LAPreifix');
const LaSuffix = require('../models/LASuffix');
const mongoose = require('mongoose');
const xlsx = require('node-xlsx');
const testFolder = __dirname + '/consolidated_files/';
const fs = require('fs');
const {ERROR_CODES, SUCCESS_CODE} = require('../constants/index');

const index = async (req, res, _next) => {
  try {
    const limit = 20;
    let offset = 0;
    if (req.query.page_number && req.query.page_number == 1) offset = 0;
    else if (req.query.page_number && req.query.page_number > 1) {
      offset = (req.query.page_number - 1) * limit;
    }
    const projects = await Project.paginate(
        {},
        {
          offset: offset,
          limit: limit,
          populate: [
            {path: 'caseReferences'},
            {path: 'entityReferences'},
            {path: 'meetingReferences'},
            {path: 'propertyReferences'},
            {path: 'documentReferences'},
          ],
        },
    ).then((projects) => {
      return projects;
    });
    if (projects.length <= 0) {
      return res.status(ERROR_CODES.BAD_REQUEST).json({
        error: false,
        message: 'No projects has been added so far!',
      });
    }
    projects.docs = projects.docs.map((project) => {
      project.documentReferences = project.documentReferences.map(
          (document) => {
            document.dbFileId = process.env.BUCKET_URL
                .concat(document.dbFileId);
            return document;
          },
      );
      return project;
    });
    return res.status(SUCCESS_CODE).json({
      error: false,
      projects: projects,
    });
  } catch (error) {
    return res.status(ERROR_CODES.BAD_REQUEST).json({
      error: true,
      message: 'No projects has been added so far!',
    });
  }
};

const store = async (req, res, _next) => {
  try {
    const project = new Project(req.body);
    await project.save();

    if (req.body.propertyReferences) {
      await Property.updateMany(
          {_id: {$in: req.body.propertyReferences}},
          {
            $push: {
              projectReferences: project._id,
            },
          },
          {multi: true},
      );
    }

    if (req.body.caseReferences) {
      await Case.updateMany(
          {_id: {$in: req.body.caseReferences}},
          {
            $set: {
              projectReference: project._id,
            },
          },
          {multi: true},
      );
    }

    if (req.body.documentReferences) {
      await Document.updateMany(
          {_id: {$in: req.body.documentReferences}},
          {
            $set: {
              projectReference: project._id,
            },
          },
          {multi: true},
      );
    }

    if (req.body.entityReferences) {
      await Entity.updateMany(
          {_id: {$in: req.body.entityReferences}},
          {
            $push: {
              projectReferences: project._id,
            },
          },
          {multi: true},
      );
    }

    if (req.body.meetingReferences) {
      await Meeting.updateMany(
          {_id: {$in: req.body.meetingReferences}},
          {
            $push: {
              projectReferences: project._id,
            },
          },
          {multi: true},
      );
    }

    return res.status(SUCCESS_CODE).json({
      message: 'Project created Successfully !',
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
};

const update = async (req, res, _next) => {
  const project = await Project.findOne({
    _id: req.params.id,
  });
  if (!project) {
    return res.status(ERROR_CODES.BAD_REQUEST).json({
      error: false,
      message: 'Project not exists',
    });
  } else {
    try {
      let projectRecord;
      const response = await project.update(req.body);
      if (response) {
        projectRecord = await Project.findOne({
          _id: project._id,
        });

        if (req.body.propertyReferences) {
          await Property.updateMany(
              {_id: {$in: project.propertyReferences}},
              {
                $pull: {
                  projectReferences: projectRecord._id,
                },
              },
              {multi: true},
          );

          await Property.updateMany(
              {_id: {$in: req.body.propertyReferences}},
              {
                $push: {
                  projectReferences: projectRecord._id,
                },
              },
              {multi: true},
          );
        }

        if (req.body.caseReferences) {
          await Case.updateMany(
              {_id: {$in: project.caseReferences}},
              {
                $set: {
                  projectReference: null,
                },
              },
              {multi: true},
          );

          await Case.updateMany(
              {_id: {$in: req.body.caseReferences}},
              {
                $set: {
                  projectReference: projectRecord._id,
                },
              },
              {multi: true},
          );
        }

        if (req.body.documentReferences) {
          await Document.updateMany(
              {_id: {$in: project.documentReferences}},
              {
                $set: {
                  projectReference: null,
                },
              },
              {multi: true},
          );

          await Document.updateMany(
              {_id: {$in: req.body.documentReferences}},
              {
                $set: {
                  projectReference: project._id,
                },
              },
              {multi: true},
          );
        }

        if (req.body.entityReferences) {
          await Entity.updateMany(
              {_id: {$in: project.entityReferences}},
              {
                $pull: {
                  projectReferences: projectRecord._id,
                },
              },
              {multi: true},
          );

          await Entity.updateMany(
              {_id: {$in: req.body.entityReferences}},
              {
                $push: {
                  projectReferences: projectRecord._id,
                },
              },
              {multi: true},
          );
        }

        if (req.body.meetingReferences) {
          await Meeting.updateMany(
              {_id: {$in: project.meetingReferences}},
              {
                $pull: {
                  projectReferences: projectRecord._id,
                },
              },
          );

          await Meeting.updateMany(
              {_id: {$in: req.body.meetingReferences}},
              {
                $push: {
                  projectReferences: projectRecord._id,
                },
              },
              {multi: true},
          );
        }
      }
      return res.status(SUCCESS_CODE).json({
        project: projectRecord,
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

const show = async (req, res, _next) => {
  const project = await Project.findOne({
    _id: req.params.id,
  })
      .sort({updatedAt: -1})
      .populate('caseReferences')
      .populate('entityReferences')
      .populate('meetingReferences')
      .populate('propertyReferences')
      .populate('documentReferences');
  if (!project) {
    return res.status(ERROR_CODES.BAD_REQUEST).json({
      error: false,
      message: 'Project not exists',
    });
  } else {
    try {
      project.documentReferences = project.documentReferences.map(
          (document) => {
            document.dbFileId = process.env.BUCKET_URL
                .concat(document.dbFileId);
            return document;
          },
      );
      return res.status(SUCCESS_CODE).json({
        project: project,
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
    const project = await Project.findOne({
      _id: req.params.id,
    });

    await Property.updateMany(
        {_id: {$in: project.propertyReferences}},
        {
          $pull: {
            projectReferences: project._id,
          },
        },
    );

    await Case.updateMany(
        {_id: {$in: project.caseReferences}},
        {
          $set: {
            projectReference: null,
          },
        },
    );

    await Document.updateMany(
        {_id: {$in: project.documentReferences}},
        {
          $set: {
            projectReference: null,
          },
        },
    );

    await Entity.updateMany(
        {_id: {$in: project.entityReferences}},
        {
          $pull: {
            projectReferences: project._id,
          },
        },
    );

    await Meeting.updateMany(
        {_id: {$in: project.meetingReferences}},
        {
          $pull: {
            projectReferences: project._id,
          },
        },
    );

    await Project.findOneAndDelete({
      _id: id,
    });

    return res.status(SUCCESS_CODE).json({
      message: 'Record deleted successfully',
    });
  } catch (error) {
    return res.status(ERROR_CODES.BAD_REQUEST).json({
      error: false,
      message: 'Project not exists',
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const limit = 20;
    let offset = 0;
    if (req.query.page_number && req.query.page_number == 1) offset = 0;
    else if (req.query.page_number && req.query.page_number > 1) {
      offset = (req.query.page_number - 1) * limit;
    }
    const projects = await Project.paginate(
        {},
        {
          offset: offset,
          limit: limit,
          populate: [{path: 'documents'}, {path: 'primaryPropId'}],
        },
    ).then((projects) => {
      return projects;
    });
    res.status(200).json({status: 200, projects});
  } catch (error) {
    console.log('projects_get error', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};

const getSingleProject = async (req, res) => {
  try {
    const caseNbr = req.params.caseNbr ? req.params.caseNbr : '';
    const project = await Project.findOne({caseNbr: caseNbr})
        .populate({
          path: 'properties',
        })
        .populate({path: 'entities'})
        .populate({path: 'documents'});
    if (project) res.status(200).json({status: 200, data: [project]});
    else {
      res.status(400).json({
        status: 400,
        message: 'Project not found against that caseNbr.',
      });
    }
  } catch (error) {
    console.log('project_single_get error', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};

const insertScrapedData = async (req, res) => {
  try {
    const propertyBulkOps = req.body.property_objects.map((object) => ({
      updateOne: {
        filter: {propId: object.propId},
        update: object,
        upsert: true,
      },
    }));
    await Property.bulkWrite(propertyBulkOps)
        .then(console.log.bind(console, 'BULK update OK:'))
        .catch(console.error.bind(console, 'BULK update error:'));

    const projectBulkOps = req.body.project_objects.map((object) => ({
      updateOne: {
        filter: {caseNbr: object.caseNbr},
        update: object,
        upsert: true,
      },
    }));
    await Project.bulkWrite(projectBulkOps)
        .then(console.log.bind(console, 'BULK update OK:'))
        .catch(console.error.bind(console, 'BULK update error:'));

    // let result = {};
    // for (let object of req.body.project_objects) {
    //   let project = await Project.findOne({ caseNbr: object.caseNbr });
    //   if (project)
    //   result[`${object.caseNbr}-${object.caseId}`] = project._id;
    // }

    // let result = {};
    const result = await handleProjectRelations(req, res);
    console.log('completed');
    res.status(200).json({
      status: 200,
      message: 'Projects scrapped data inserted successfully.',
      result,
    });
  } catch (error) {
    console.log('insert scrapped data of project error', error.stack);
    res.status(500).json({status: 500, data: error});
  }
};

const handleProjectRelations = async (req, res) => {
  try {
    const result = {};
    for (const object of req.body.project_objects) {
      const project = await Project.findOne({caseNbr: object.caseNbr});
      if (project) {
        for (const propId of object.propIds) {
          const property = await Property.findOne({propId: propId});
          if (property) {
            const arr = property.projects ? property.projects : [];
            if (!arr.includes(project._id)) {
              arr.push(mongoose.Types.ObjectId(project._id));
            }
            property.projects = arr;
            await property.save();
            if (!project.properties.includes(property._id)) {
              project.properties.push(property);
            }
          }
        }
        const splitWords =
          project.caseNbr !== null ? project.caseNbr.split('-') : [];
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
        if (object.related_cases) {
          for (const relatedCase of object.related_cases) {
            let relatedProject = await Project.findOne({
              caseNbr: relatedCase,
            });
            if (!relatedProject) {
              relatedProject = new Project({
                caseNbr: relatedCase,
                is_scraped: false,
              });
              await relatedProject.save();
            }
            if (!project.related_projects.includes(relatedProject._id)) {
              project.related_projects.push(relatedProject);
            }
          }
        }
        await project.save();
        result[`${object.caseNbr}-${object.caseId}`] = project._id;
      }
    }
    return result;
  } catch (error) {
    console.log('handle_project_relations error', error.stack);
    res.status(500).json({status: 500, data: error});
  }
};

const getCaseNumbers = async (req, res) => {
  try {
    const limit = 20;
    let offset = 0;
    if (req.body.page_number && req.body.page_number == 1) offset = 0;
    else if (req.body.page_number && req.body.page_number > 1) {
      offset = (req.body.page_number - 1) * limit;
    }
    const projects = await Project.paginate(
        {},
        {
          offset: offset,
          limit: limit,
        },
    ).then((projects) => {
      return projects;
    });
    const result = [];
    for (const project of projects) {
      project.caseNbr !== null && result.push(project.caseNbr);
    }
    res.status(200).json({status: 200, case_numbers: result});
  } catch (error) {
    console.log('projects_get error', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};

const searchCaseNumber = async (req, res) => {
  try {
    if (req.body.caseNbr) {
      const project = await Project.findOne({caseNbr: req.body.caseNbr});
      let flag = false;
      if (project) flag = true;
      res
          .status(200)
          .json({status: 200, case_number: req.body.caseNbr, result: flag});
    } else {
      res
          .status(400)
          .json({status: 400, message: 'caseNbr is required', result: false});
    }
  } catch (error) {
    console.log('projects_get error', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};

const importActivePrefixSuffixCodes = async (req, res) => {
  try {
    const categories = xlsx
        .parse(__dirname + '/Active Prefix Suffix Codes.xlsx'); // parses a file
    const prefixRecords = [];
    const suffixRecords = [];
    for (const category of categories) {
      if (category.name === 'Active Prefix Suffix Codes') {
        for (const data of category.data.slice(2)) {
          if (data.length > 0) {
            if (data[0] === 'ACTIVE PREFIX CODES') continue;
            else if (data[0] === 'ACTIVE SUFFIX CODES') break;
            else {
              const prefixObject = {};
              prefixObject.active = data[0];
              prefixObject.case_prefix = data[1];
              prefixObject.description = data[2];
              prefixObject.notes = data[3];
              const updateObject = {
                updateOne: {
                  filter: {case_prefix: prefixObject.case_prefix},
                  update: prefixObject,
                  upsert: true,
                },
              };
              prefixRecords.push(updateObject);
            }
          }
        }
        for (const data of category.data.slice(24)) {
          if (data.length > 0) {
            if (data[0] === 'ACTIVE SUFFIX CODES') continue;
            else {
              const suffixObject = {};
              suffixObject.active = data[0];
              suffixObject.case_suffix = data[1];
              suffixObject.description = data[2];
              suffixObject.prefix_usage = data[3];
              suffixObject.notes = data[4];
              const updateObject = {
                updateOne: {
                  filter: {case_suffix: suffixObject.case_suffix},
                  update: suffixObject,
                  upsert: true,
                },
              };
              suffixRecords.push(updateObject);
            }
          }
        }
      }
      await LaPrefix.bulkWrite(prefixRecords)
          .then(console.log.bind(console, 'BULK update OK:'))
          .catch(console.error.bind(console, 'BULK update error:'));
      await LaSuffix.bulkWrite(suffixRecords)
          .then(console.log.bind(console, 'BULK update OK:'))
          .catch(console.error.bind(console, 'BULK update error:'));
    }
    res.status(200).json({message: 'preifx and suffix data imported'});
  } catch (e) {
    console.log(e);
    res.status(500).json({error: e.message});
  }
};

const importCloudFactoryExcelFilesInOneFile = async (req, res) => {
  try {
    const data = [];
    let flag = true;
    fs.readdir(testFolder, (err, files) => {
      files.forEach((file) => {
        const categories = xlsx.
            parse(__dirname + '/consolidated_files/' + file); // parses a file
        if (flag === true) {
          if (categories[categories.length - 1].data[0][0]) {
            data.push(categories[categories.length - 1].data[0]);
          }
          flag = false;
        }
        for (const row of categories[categories.length - 1].data.slice(1)) {
          if (row[0]) data.push(row);
        }
      });
      const buffer = xlsx.
          build([{name: 'final_sheet', data: data}]); // Returns a buffer
      const dir = __dirname + 'final_file.xlsx';
      fs.writeFileSync(dir, buffer, 'binary');
    });
    res.status(200).json({message: 'file created successfully'});
  } catch (e) {
    console.log(e);
    res.status(500).json({error: e.message});
  }
};

const updateProjectEntities = async (req, res) => {
  try {
    const projectId = req.params.id ? req.params.id : null;
    const project = await Project.findById(projectId);
    if (project) {
      if (req.body) await Project.updateOne({_id: project._id}, req.body);
      if (req.body.entityReferences) {
        for (const entityObject of req.body.entityReferences) {
          const entity = await Entity.findOne({
            name: entityObject.name,
            companyFirm: entityObject.companyFirm,
            primaryContact: entityObject.primaryContact,
          });
          if (entityObject['_id']) delete entityObject['_id'];
          if (entityObject['id']) delete entityObject['id'];
          if (entityObject['projects']) delete entityObject['projects'];
          if (entityObject['meetings']) delete entityObject['meetings'];
          if (entityObject['documents']) delete entityObject['documents'];
          if (entity) {
            await Entity.updateOne({_id: entity._id}, entityObject);
            if (!project.entityReferences.includes(entity._id)) {
              project.entityReferences.push(entity._id);
            }
            await project.save();
            if (!entity.projectReferences.includes(project._id)) {
              entity.projectReferences.push(project._id);
            }
            await entity.save();
          } else {
            const newEntity = new Entity(entityObject);
            await newEntity.save();
            if (!project.entityReferences.includes(newEntity._id)) {
              project.entityReferences.push(newEntity._id);
            }
            await project.save();
            if (!newEntity.projectReferences.includes(project._id)) {
              newEntity.projectReferences.push(project._id);
            }
            await newEntity.save();
          }
        }
      }
      if (req.body.remove_entities) {
        for (const removeEntity of req.body.remove_entities) {
          const entity = await Entity.findById(removeEntity);
          if (entity) {
            const entityIndex = project.entityReferences.indexOf(removeEntity);
            entityIndex != -1 &&
              project.entityReferences.splice(entityIndex, 1);
            await project.save();
            const projectIndex = entity.projectReferences.indexOf(projectId);
            projectIndex != -1 &&
              entity.projectReferences.splice(projectIndex, 1);
            // let documents = await Document
            // .find({projectReference:project_id});
            // for(let document of documents){
            //   let entity_index = document.entit.indexOf(remove_entity);
            //   entity_index != -1 && document
            // .entities.splice(entity_index, 1);
            //   await document.save();
            //   let document_index = entity
            // .documents.indexOf(document._id);
            //   document_index != -1
            // && entity.documents.splice(document_index, 1);
            // }
            await entity.save();
            EntityCategory.deleteMany({
              project_id: projectId,
              entity_id: entity._id,
            });
          }
        }
      }
      if (req.body.propertyReferences) {
        for (const propertyObject of req.body.propertyReferences) {
          const property = await Property.findOne({
            propId: propertyObject.propId,
          });
          if (propertyObject['_id']) delete propertyObject['_id'];
          if (propertyObject['id']) delete propertyObject['id'];
          if (propertyObject['projects']) delete propertyObject['projects'];
          if (property) {
            await Property.updateOne({_id: property._id}, propertyObject);
            if (!project.propertyReferences.includes(property._id)) {
              project.propertyReferences.push(property._id);
            }
            await project.save();
            if (!property.projectReferences.includes(project._id)) {
              property.projectReferences.push(project._id);
            }
            await property.save();
          } else {
            const newProperty = new Property(propertyObject);
            await newProperty.save();
            if (!project.propertyReferences.includes(newProperty._id)) {
              project.propertyReferences.push(newProperty._id);
            }
            await project.save();
            if (!newProperty.projectReferences.includes(project._id)) {
              newProperty.projectReferences.push(project._id);
            }
            await newProperty.save();
          }
        }
      }
      if (req.body.remove_properties) {
        for (const removeProperty of req.body.remove_properties) {
          const property = await Property.findById(removeProperty);
          if (property) {
            const propertyIndex =
              project.propertyReferences.indexOf(removeProperty);
            propertyIndex != -1 &&
              project.propertyReferences.splice(propertyIndex, 1);
            await project.save();
            const projectIndex = property.projectReferences.indexOf(project_id);
            projectIndex != -1 &&
              property.projectReferences.splice(projectIndex, 1);
            await property.save();
          }
        }
      }
      res.status(200).json({
        status: 200,
        message: 'Project entities updated successfully.',
      });
    } else {
      res
          .status(400)
          .json({status: 400, message: 'Project not found against that id.'});
    }
  } catch (error) {
    console.log('document_update error', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};

const getInsertedCaseNumbers = async (req, res) => {
  try {
    const projects = await Project.find({}, {caseNbr: 1});
    let dataToWrite = '';
    for (const project of projects) {
      dataToWrite = dataToWrite + project.caseNbr + '\n';
    }
    fs.writeFileSync('inserted_case_numbers.txt', dataToWrite);
    res.status(200).json({message: 'case numbers found.'});
  } catch (e) {
    console.log(e);
    res.status(500).json({error: e.message});
  }
};

const copyDocumentMetaInProjects = async (
    project,
    meta,
    documentId,
    status,
) => {
  try {
    // let projects = await Project.find({}, { _id : 1 });
    // for(let project of projects){
    //   if(project._id == "62a6f9abb06587c44a64759d"){
    // let document = await Document.findOne({projectRecordId:project._id});
    const updateProject = {};
    // if(document && document.meta){
    for (const [key, value] of Object.entries(meta)) {
      // console.log("key---->", key)
      if (key === 'authorizing_section') {
        await Promise.all(meta.authorizing_section.map((item) => {
          item['status'] = status;
          item['source'] = documentId;
          return item;
        }));
        updateProject.action_requested = meta.authorizing_section;
      } else {
        updateProject[key] = {};
        updateProject[key]['text'] = value.value;
        updateProject[key]['status'] = status;
        updateProject[key]['source'] = documentId;
      }
    }
    await Project.updateOne({_id: project._id}, updateProject);
    console.log('project', project._id);
    // }
    //   }
    // }
    // res.status(200).json({"message":"Documents meta copied in projects."});
  } catch (e) {
    console.log(e);
    res.status(500).json({error: e.message});
  }
};

const getCaseNumbersWithNullCompletionDate = async (req, res) => {
  try {
    const projects = await Project.find({completionDt: null}, {caseNbr: 1});
    const caseNumbers = [];
    for (const project of projects) caseNumbers.push(project.caseNbr);
    res.status(200).json({message: 'case numbers found.', caseNumbers});
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
  getCaseNumbersWithNullCompletionDate,
  copyDocumentMetaInProjects,
  getInsertedCaseNumbers,
  updateProjectEntities,
  importCloudFactoryExcelFilesInOneFile,
  importActivePrefixSuffixCodes,
  searchCaseNumber,
  getCaseNumbers,
  handleProjectRelations,
  insertScrapedData,
  getSingleProject,
  getProjects,
};
