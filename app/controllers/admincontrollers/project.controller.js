const Project = require("../../models/Project");
const Document = require("../../models/Document");

module.exports.projects_get = async (req, res) => {
  let limit = 20;
  let offset = 0;
  if (req.query.page_number && req.query.page_number == 1) offset = 0;
  else if (req.query.page_number && req.query.page_number > 1)
    offset = (req.query.page_number - 1) * limit;
  let projects = await Project.paginate(
    {},
    {
      offset: offset,
      limit: limit,
      sort: {
        title: 1, //Sort by Title ASC
      },
    }
  ).then((projects) => {
    return projects;
  });
  for (let i = 0; i < projects.length; i++) {
    projects[i].documents = await Document.countDocuments({
      project: projects[i]._id,
    });
  }
  res.render("projects/projects.ejs", { projects });
};

module.exports.delete_project_get = async (req, res) => {
  await Document.deleteMany({ project: req.params.id });
  await Project.findByIdAndDelete(req.params.id);

  req.flash("success_msg", "Project and it's Documents Deleted");
  res.redirect("/admin/projects");
};

module.exports.new_project_get = async (req, res) => {
  res.render("projects/new");
};

module.exports.projects_post = async (req, res) => {
  console.log(req.body);
  const title = req.body.title ? req.body.title.trim() : "";
  const description = req.body.description ? req.body.description.trim() : "";
  const latitude = req.body.latitude ? req.body.latitude.trim() : "";
  const longitude = req.body.longitude ? req.body.longitude.trim() : "";
  const location = req.body.location ? req.body.location.trim() : "";
  const lotSize = req.body.lotSize ? req.body.lotSize : undefined;
  const buildingType = req.body.buildingType
    ? req.body.buildingType
    : undefined;
  const numberOfParkingSpaces = req.body.numberOfParkingSpaces
    ? req.body.numberOfParkingSpaces
    : undefined;
  const numberOfUnits = req.body.numberOfUnits
    ? req.body.numberOfUnits
    : undefined;
  const zoning = req.body.zoning ? req.body.zoning : undefined;
  const far = req.body.far ? req.body.far : undefined;
  const setback = req.body.setback ? req.body.setback : undefined;
  const varianceType = req.body.varianceType
    ? req.body.varianceType
    : undefined;
  const cityPlanner = req.body.cityPlanner ? req.body.cityPlanner : undefined;

  const newProject = new Project({
    title,
    description,
    latitude,
    longitude,
    location,
    filters: {
      buildingType,
      lotSize,
      numberOfParkingSpaces,
      numberOfUnits,
      zoning,
      far,
      setback,
      varianceType,
      cityPlanner,
    },
  });
  await newProject.save();

  req.flash("success_msg", "New Project Created");
  res.redirect("/admin/projects");
};

module.exports.edit_project_get = async (req, res) => {
  const project = await Project.findById(req.params.id);

  res.render("projects/edit", { project });
};

module.exports.edit_project_post = async (req, res) => {
  console.log(req.body);
  const id = req.body.id ? req.body.id.trim() : "";
  const title = req.body.title ? req.body.title.trim() : "";
  const description = req.body.description ? req.body.description.trim() : "";
  const latitude = req.body.latitude ? req.body.latitude.trim() : "";
  const longitude = req.body.longitude ? req.body.longitude.trim() : "";
  const location = req.body.location ? req.body.location.trim() : "";
  const lotSize = req.body.lotSize ? req.body.lotSize : undefined;
  const buildingType = req.body.buildingType
    ? req.body.buildingType
    : undefined;
  const numberOfParkingSpaces = req.body.numberOfParkingSpaces
    ? req.body.numberOfParkingSpaces
    : undefined;
  const numberOfUnits = req.body.numberOfUnits
    ? req.body.numberOfUnits
    : undefined;
  const zoning = req.body.zoning ? req.body.zoning : undefined;
  const far = req.body.far ? req.body.far : undefined;
  const setback = req.body.setback ? req.body.setback : undefined;
  const varianceType = req.body.varianceType
    ? req.body.varianceType
    : undefined;
  const cityPlanner = req.body.cityPlanner ? req.body.cityPlanner : undefined;

  await Project.findByIdAndUpdate(id, {
    title,
    description,
    latitude,
    longitude,
    location,
    filters: {
      buildingType,
      lotSize,
      numberOfParkingSpaces,
      numberOfUnits,
      zoning,
      far,
      setback,
      varianceType,
      cityPlanner,
    },
  });

  req.flash("success_msg", "Project Updated");
  res.redirect("/admin/projects");
};

module.exports.project_documents_get = async (req, res) => {
  const documents = await Document.find({ project: req.params.id });
  const project = await Project.findById(req.params.id);
  res.render("documents/documents", { documents, project });
};
