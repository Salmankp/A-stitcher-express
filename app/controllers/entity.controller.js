const Project = require('../models/Project');
const Document = require('../models/Document');
const Entity = require('../models/Entity');
const EntityCategory = require('../models/EntityCategory');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

module.exports.entities_get = async (req, res) => {
  try {
    const limit = 20;
    let offset = 0;
    if (req.query.page_number && req.query.page_number == 1) offset = 0;
    else if (req.query.page_number && req.query.page_number > 1) {
      offset = (req.query.page_number - 1) * limit;
    }
    const search = {};
    if (req.query.starting_character && req.query.starting_character != null) {
      search.name = {$regex: '^' + req.query.starting_character};
    }
    if (req.query.search_filter && req.query.search_filter != null) {
      search['$text'] = {$search: req.query.search_filter};
    }
    const entities = await Entity.paginate(search, {
      sort: {name: 1},
      collation: {locale: 'en', caseLevel: true},
      offset: offset,
      limit: limit,
    });
    res.status(200).json({status: 200, entities});
  } catch (error) {
    console.log('entities_get error', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};

module.exports.get_entity_based_on_document_id = async (req, res) => {
  try {
    const document = Document.findById(req.body.document_id)
        .populate({
          path: 'project',
          populate: {path: 'property'},
        })
        .populate({path: 'entities'});
    res.status(200).json({status: 200, data: [document]});
  } catch (error) {
    console.log('project_single_get error', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};

module.exports.get_entity_based_on_project_id = async (req, res) => {
  try {
    const document = Project.findById(req.body.project_id)
        .populate({
          path: 'property',
        })
        .populate({path: 'entities'})
        .populate({path: 'documents'});
    res.status(200).json({status: 200, data: [document]});
  } catch (error) {
    console.log('project_single_get error', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};

module.exports.getAllCategories = async (req, res) => {
  try {
    const limit = 20;
    let offset = 0;
    if (req.query.page_number && req.query.page_number == 1) offset = 0;
    else if (req.query.page_number && req.query.page_number > 1) {
      offset = (req.query.page_number - 1) * limit;
    }
    const categories = await EntityCategory.paginate(
        {},
        {
          offset: offset,
          limit: limit,
        },
    ).then((categories) => {
      return categories;
    });
    res.status(200).json({status: 200, categories});
  } catch (error) {
    console.log('entity categories error', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};

module.exports.insertScrapedData = async (req, res) => {
  try {
    const entityRequestObjects = req.body.entities.map(function(object) {
      if (object.name && object.name !== '') {
        const splitStr = object.name.toLowerCase().split(' ');
        for (let i = 0; i < splitStr.length; i++) {
          splitStr[i] =
            splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        object.name = splitStr.join(' ');
      }
      if (object.companyFirm && object.companyFirm !== '') {
        const splitStrComp = object.companyFirm.toLowerCase().split(' ');
        for (let i = 0; i < splitStrComp.length; i++) {
          splitStrComp[i] =
            splitStrComp[i].charAt(0).toUpperCase() +
            splitStrComp[i].substring(1);
        }
        object.companyFirm = splitStrComp.join(' ');
      }
      if (object.primaryContact && object.primaryContact !== '') {
        const cleaned = ('' + object.primaryContact).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
          object.primaryContact =
            '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
      }
      return object;
    });

    const bulkOps = entityRequestObjects.map((object) => ({
      updateOne: {
        filter: {name: object.name, companyFirm: object.companyFirm},
        update: object,
        upsert: true,
      },
    }));

    await Entity.bulkWrite(bulkOps)
        .then(console.log.bind(console, 'BULK update OK:'))
        .catch(console.error.bind(console, 'BULK update error:'));
    const project = await Project.findById(entityRequestObjects[0].project_id);
    for (const object of entityRequestObjects) {
      const entity = await Entity.findOne({
        name: object.name,
        companyFirm: object.companyFirm,
      });
      if (entity) {
        if (project) {
          if (!project.entityReferences.includes(entity._id)) {
            project.entityReferences.push(entity._id);
          }
          if (!entity.projectReferences.includes(project._id)) {
            entity.projectReferences.push(project._id);
          }
          let entityCategory = await EntityCategory.findOne({
            project_id: project._id,
            entity_id: entity._id,
            category: object.category,
          });
          if (!entityCategory) {
            entityCategory = new EntityCategory({
              project_id: project._id,
              entity_id: entity._id,
              category: object.category,
            });
            await entityCategory.save();
          }
          if (!entity.entityCategoriesReferences.includes(entityCategory._id)) {
            entity.entityCategoriesReferences.push(entityCategory._id);
          }
          await entity.save();
        }
      }
    }
    await project?.save();
    res.status(200).json({
      status: 200,
      message: 'Entities scrapped data inserted successfully.',
    });
  } catch (error) {
    console.log('insert scrapped data of document error', error.stack);
    res.status(500).json({status: 500, data: error});
  }
};

module.exports.exportEntitiesToExcelFile = async (req, res) => {
  try {
    const entities = await Entity.find();
    const csvWriter = createCsvWriter({
      path: 'Entities.csv',
      header: [
        {id: '_id', title: 'Id'},
        {id: 'name', title: 'Name'},
        {id: 'email', title: 'Email'},
        {id: 'companyFirm', title: 'Company Firm'},
        {id: 'primaryContact', title: 'Primary Contact'},
        {id: 'address', title: 'Address'},
        {id: 'city', title: 'City'},
        {id: 'state', title: 'State'},
        {id: 'category', title: 'Category'},
        {id: 'projects', title: 'Projects'},
        {id: 'documents', title: 'Documents'},
      ],
    });
    const data = [];
    for (const entity of entities) {
      if (entity.name != null && entity.name != '') {
        const object = {
          _id: entity._id,
          name: entity.name,
          email: entity.email,
          companyFirm: entity.companyFirm,
          primaryContact: entity.primaryContact,
          address: entity.address,
          city: entity.city,
          state: entity.state,
          projects: entity.projects.join(','),
          documents: entity.documents.join(','),
        };
        if (typeof entity.category == 'object') {
          object.category = Object.values(entity.category).join(',');
        } else object.category = entity.category;
        data.push(object);
      }
    }
    await csvWriter
        .writeRecords(data)
        .then(() => console.log('The CSV file was written successfully'));
    res
        .status(200)
        .json({status: 200, message: 'Entities exported successfully.'});
  } catch (error) {
    console.log('exportEntitiesToExcelFile error', error.stack);
    res.status(500).json({status: 500, data: error});
  }
};

module.exports.getAffectedCaseNumbers = async (req, res) => {
  try {
    const entities = await Entity.find({category: {$type: 'string'}});
    const projectIds = [];
    for (const entity of entities) {
      Array.prototype.push.apply(projectIds, entity.projects);
    }
    const projects = await Project.find(
        {_id: {$in: projectIds}},
        {caseNbr: 1},
    );
    let dataToWrite = '';
    for (const project of projects) {
      dataToWrite = dataToWrite + project.caseNbr + '\n';
    }
    fs.writeFileSync('affected_case_numbers.txt', dataToWrite);
    res.status(200).json({status: 200, length: projects.length});
  } catch (error) {
    console.log('exportEntitiesToExcelFile error', error.stack);
    res.status(500).json({status: 500, data: error});
  }
};

module.exports.entity_update_all = async (req, res) => {
  try {
    const entities = await Entity.find(
        {},
        {name: 1, companyFirm: 1, primaryContact: 1},
    );
    for (const entity of entities) {
      let name = entity.name;
      let companyFirm = entity.companyFirm;
      let primaryContact = entity.primaryContact;
      if (entity.name && entity.name !== '') {
        const splitStr = entity.name.toLowerCase().split(' ');
        for (let i = 0; i < splitStr.length; i++) {
          splitStr[i] =
            splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        name = splitStr.join(' ');
      }
      if (entity.companyFirm && entity.companyFirm !== '') {
        const splitStrComp = entity.companyFirm.toLowerCase().split(' ');
        for (let i = 0; i < splitStrComp.length; i++) {
          splitStrComp[i] =
            splitStrComp[i].charAt(0).toUpperCase() +
            splitStrComp[i].substring(1);
        }
        companyFirm = splitStrComp.join(' ');
      }
      if (entity.primaryContact && entity.primaryContact !== '') {
        const cleaned = ('' + entity.primaryContact).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
          primaryContact = '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
      }
      const duplicateEntities = await Entity.find({
        name: name,
        companyFirm: companyFirm,
      });
      if (duplicateEntities.length > 1) {
        await entity.remove();
        continue;
      }
      await Entity.updateOne(
          {_id: entity._id},
          {
            name: name,
            companyFirm: companyFirm,
            primaryContact: primaryContact,
          },
      );
      // break;
    }
    res.status(200).json({status: 200, message: 'Entities updated.'});
  } catch (error) {
    console.log('entity_update_all error', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};

module.exports.insertSingleEntity = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    const requestData = req.body.entity;
    if (project) {
      requestData.projectReferences = project._id;
      const entity = new Entity(requestData);
      await entity.save();
      if (!project.entityReferences.includes(entity._id)) {
        project.entityReferences.push(entity._id);
      }
      project.save();
      res.status(200).json({status: 200, entity: entity, project: project});
    } else {
      res
          .status(400)
          .json({status: 400, data: 'Project not found against that id'});
    }
  } catch (error) {
    console.log('create single entity error', error.stack);
    res.status(500).json({status: 500, data: error});
  }
};

module.exports.getSingleEntity = async (req, res) => {
  try {
    const id = req.params.id ? req.params.id : '';
    const entity = await Entity.findById(id);
    if (entity) {
      res.status(200).json({status: 200, entity});
    } else {
      res
          .status(200)
          .json({status: 200, data: 'Entity not found against id'});
    }
  } catch (error) {
    console.log('entity_get error', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};

module.exports.updateEntity = async (req, res) => {
  try {
    const entity = await Entity.findById(req.params.id);
    if (entity) {
      await entity.updateOne(req.body.entity);
      res.status(200).json({status: 200, entity: entity});
    } else {
      res
          .status(400)
          .json({status: 400, data: 'Entity not found against that id'});
    }
  } catch (error) {
    console.log('update entity error', error.stack);
    res.status(500).json({status: 500, data: error});
  }
};

module.exports.unlinkEntity = async (req, res) => {
  try {
    const entityId = req.params.entityId ? req.params.entityId : '';
    const entity = await Entity.findById(entityId);
    if (entity) {
      const project = await Project.findById(req.params.projectId);
      if (project) {
        const entityIndex = project.entityReferences.indexOf(entity._id);
        entityIndex != -1 && project.entityReferences.splice(entityIndex, 1);
        await project.save();
        const projectIndex = entity.projectReferences.indexOf(project._id);
        projectIndex != -1 && entity.projectReferences.splice(projectIndex, 1);
        await entity.save();
        EntityCategory.deleteMany({
          project_id: project._id,
          entity_id: entity._id,
        });
        res.status(200).json({
          status: 200,
          message: 'Entity in removed from project sucessfully.',
        });
      } else {
        res
            .status(400)
            .json({status: 400, message: 'Project not found against this id.'});
      }
    } else {
      res
          .status(400)
          .json({status: 400, message: 'Entity not found against this id'});
    }
  } catch (error) {
    console.log('Unlink property API error', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};
