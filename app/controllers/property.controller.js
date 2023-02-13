const Project = require('../models/Project');
const Property = require('../models/Property');

module.exports.insertScrapedData = async (req, res) => {
  try {
    const bulkOps = req.body.property_objects.map((object) => ({
      updateOne: {
        filter: {addressTxt: object.addressTxt},
        update: object,
        upsert: true,
      },
    }));

    const propIds = req.body.property_objects.map(function(object) {
      return object.addressTxt;
    });

    await Property.bulkWrite(bulkOps)
        .then(console.log.bind(console, 'BULK update OK:'))
        .catch(console.error.bind(console, 'BULK update error:'));

    const properties = await Property.find({addressTxt: {$in: propIds}});
    const project = await Project.findById(
        req.body.property_objects[0].project_id,
    );
    for (const property of properties) {
      if (project) {
        if (!property.projectReferences.includes(project._id)) {
          property.projectReferences.push(project._id);
        }
        await property.save();
        if (!project.propertyReferences.includes(property._id)) {
          project.propertyReferences.push(property._id);
        }
      }
    }
    await project.save();
    res.status(200).json({
      status: 200,
      message: 'Property scrapped data inserted successfully.',
    });
  } catch (error) {
    console.log('insert scrapped data of project error', error.stack);
    res.status(500).json({status: 500, data: error});
  }
};

module.exports.getSingleProperty = async (req, res) => {
  try {
    // Extract Data from Request
    const id = req.params.id ? req.params.id : '';

    // Process
    const data = await Property.findById(id).populate({
      path: 'projectReference',
      populate: {path: 'propertyReferences'},
    });

    res.status(200).json({status: 200, data});
  } catch (error) {
    console.log('Property details could not be fetched', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};

module.exports.updateSingleProperty = async (req, res) => {
  try {
    const id = req.params.id ? req.params.id : '';
    const property = await Property.findById(id).populate({
      path: 'projectReference',
      populate: {path: 'propertyReferences'},
    });
    const project = await Project.findById(req.body.property.project_id);
    if (project) {
      if (!property.projectReferences.includes(project._id)) {
        property.projectReferences.push(project._id);
      }
      await property.save();
      if (!project.propertyReferences.includes(property._id)) {
        project.propertyReferences.push(property._id);
      }
      await project.save();
    }
    if (property) {
      let dataToUpdate = null;
      if (req.body.property) {
        dataToUpdate = await Property.findOneAndUpdate(
            {_id: req.params.id},
            req.body.property,
            {new: true},
        );
      }
      res.status(200).json({
        status: 200,
        message: 'Property information updated.',
        dataToUpdate,
      });
    } else {
      res
          .status(400)
          .json({status: 400, message: 'Property not found against that id.'});
    }
  } catch (error) {
    console.log('property_update error', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};

module.exports.insertSingleProperty = async (req, res) => {
  try {
    const id = req.params.id;
    let project = await Project.findById(id);
    if (!project) {
      project = new Project({});
      project.save();
    }
    const property = new Property({
      propId: req.body.property.propId,
      status: req.body.property.status,
      addressTxt: req.body.property.addressTxt,
      apcAreaCd: req.body.property.apcAreaCd,
      arbNbr: req.body.property.arbNbr,
      assrPrclNbr: req.body.property.assrPrclNbr,
      blckNbr: req.body.property.blckNbr,
      boeDistMapNbr: req.body.property.boeDistMapNbr,
      boeVldAddrFlg: req.body.property.boeVldAddrFlg,
      censusTractNbr: req.body.property.censusTractNbr,
      cncCd: req.body.property.cncCd,
      cncDesc: req.body.property.cncDesc,
      cnclDistNbr: req.body.property.cnclDistNbr,
      environClrncDt: req.body.property.environClrncDt,
      environClrncNbr: req.body.property.environClrncNbr,
      hpoz: req.body.property.hpoz,
      lotAreaSqFtNbr: req.body.property.lotAreaSqFtNbr,
      lotDimTxt: req.body.property.lotDimTxt,
      lotNbr: req.body.property.lotNbr,
      multiLotFlg: req.body.property.multiLotFlg,
      multiPrclFlg: req.body.property.multiPrclFlg,
      oldStrnmTxt: req.body.property.oldStrnmTxt,
      parntPropId: req.body.property.parntPropId,
      pin: req.body.property.pin,
      planAreaNbr: req.body.property.planAreaNbr,
      planLandUseTxt: req.body.property.planLandUseTxt,
      planZoneTxt: req.body.property.planZoneTxt,
      projectReference: req.body.property.projectReference,
      propCmnNm: req.body.property.propCmnNm,
      propCurrUsgeTxt: req.body.property.propCurrUsgeTxt,
      propRetDt: req.body.property.propRetDt,
      propTypCd: req.body.property.propTypCd,
      strDirCd: req.body.property.strDirCd,
      strFracNbr: req.body.property.strFracNbr,
      strFracNbrRngEnd: req.body.property.strFracNbrRngEnd,
      strNbr: req.body.property.strNbr,
      strNbrRngEnd: req.body.property.strNbrRngEnd,
      strNm: req.body.property.strNm,
      strSfxCd: req.body.property.strSfxCd,
      strSfxDirCd: req.body.property.strSfxDirCd,
      strUnitTypCd: req.body.property.strUnitTypCd,
      totProjSqFtNbr: req.body.property.totProjSqFtNbr,
      tractNbr: req.body.property.tractNbr,
      unitNbr: req.body.property.unitNbr,
      unitNbrRngEnd: req.body.property.unitNbrRngEnd,
      zipCd: req.body.property.zipCd,
      zipCdSfx: req.body.property.zipCdSfx,
      zoneMapNbr: req.body.property.zoneMapNbr,
      zoneRegCd: req.body.property.zoneRegCd,
      primaryCnclDistNbr: req.body.property.primaryCnclDistNbr,
      primaryPin: req.body.property.primaryPin,
    });
    await property.save();
    property.projectReferences.push(project._id);
    await property.save();
    project.propertyReferences.push(property._id);
    await project.save();
    res.status(200).json({status: 200, property: property, project: project});
    console.log(project.propertyReferences);
  } catch (error) {
    console.log('Create single property API error', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};

module.exports.unlinkSingleProperty = async (req, res) => {
  try {
    const projectId = req.params.projectId ? req.params.projectId : '';
    const project = await Project.findById(projectId);
    if (project) {
      if (req.body.removeProperties) {
        for (const removeProperty of req.body.removeProperties) {
          const property = await Property.findById(removeProperty);
          if (property) {
            const propertyIndex =
              project.propertyReferences.indexOf(removeProperty);
            propertyIndex != -1 &&
              project.propertyReferences.splice(propertyIndex, 1);
            await project.save();
            const projectIndex = property.projectReferences.indexOf(projectId);
            projectIndex != -1 &&
              property.projectReferences.splice(projectIndex, 1);
            await property.save();
            res
                .status(200)
                .json({status: 200, message: 'Request was successful'});
          } else {
            res.status(400).json({
              status: 400,
              message: 'Property not found against this id.',
            });
          }
        }
      } else {
        res.status(400).json({status: 400, message: 'No data to process'});
      }
    } else {
      res
          .status(400)
          .json({status: 400, message: 'No project found with this id'});
    }
  } catch (error) {
    console.log('Unlink property API error', error.stack);
    res.status(500).json({status: 500, data: 'Server Error'});
  }
};
