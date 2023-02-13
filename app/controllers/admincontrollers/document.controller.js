const Document = require("../../models/Document");
const Project = require("../../models/Project");
const moment = require("moment");
const path = require("path");
const uuid = require("uuid").v4;
const s3 = require("../../helpers/s3");
const fs = require("fs");
const imgToText = require("../../helpers/imgtotext");
const pdfToText = require("../../helpers/pdftotext");
const docToText = require("office-text-extractor");
const puppeteerHelper = require("../../helpers/puppeteer");

module.exports.documents_get = async (req, res) => {
  let limit = 20;
  let offset = 0;
  if (req.query.page_number && req.query.page_number == 1) offset = 0;
  else if (req.query.page_number && req.query.page_number > 1)
    offset = (req.query.page_number - 1) * limit;
  let documents = await Document.paginate(
    {},
    {
      offset: offset,
      limit: limit,
      sort: {
        createdAt: -1, //Sort by date added DESC
      },
    }
  ).then((documents) => {
    return documents;
  });
  res.render("documents/documents", { documents, project: null });
};

module.exports.new_document_get = async (req, res) => {
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
  res.render("documents/new", { projects });
};

module.exports.documents_multiple_get = (req, res) => {
  res.render("documents/multiple");
};

module.exports.delete_document_get = async (req, res) => {
  await Document.findByIdAndDelete(req.params.id);
  req.flash("success_msg", "Document Deleted");
  res.redirect("/admin/documents");
};

module.exports.extract_text_post = async (req, res) => {
  try {
    // Process
    const fileExtension = req.files.file.name.split(".").pop();
    const fileName = `${uuid()}.${fileExtension}`;
    const filePath = path.resolve(__dirname, `../../temp/${fileName}`);
    await req.files.file.mv(filePath);

    let text;
    if (fileExtension.toLowerCase().trim() == "pdf") {
      text = await pdfToText(filePath);
    } else if (
      fileExtension.toLowerCase().trim() == "docx" ||
      fileExtension.toLowerCase().trim() == "xlsx" ||
      fileExtension.toLowerCase().trim() == "pptx"
    ) {
      text = await docToText(filePath);
    } else {
      text = await imgToText(filePath);
    }

    fs.unlinkSync(filePath);
    res.status(200).json({ status: 200, data: text });
  } catch (error) {
    console.log("extract_text_post error", error.stack);
    res.status(500).json({ status: 500, data: "Server Error" });
  }
};

module.exports.extract_url_post = async (req, res) => {
  try {
    // Process
    const url = req.body.url;
    await puppeteerHelper.launchBrowser();
    const page = await puppeteerHelper.launchPage();
    await page.goto(url, { timeout: 0, waitUntil: "networkidle2" });
    const text = await puppeteerHelper.getTxt("body", page);
    await puppeteerHelper.closeBrowser();

    res.status(200).json({ status: 200, data: text });
  } catch (error) {
    console.log("extract_url_post error", error.stack);
    res.status(500).json({ status: 500, data: "Server Error" });
  }
};

module.exports.documents_post = async (req, res) => {
  console.log(req.body);
  // Get Data from Request Body
  const type = req.body.type ? req.body.type.trim() : "";
  const name = req.body.name ? req.body.name.trim() : "";
  const description = req.body.description ? req.body.description.trim() : "";
  const city = req.body.city ? req.body.city.trim() : "";
  const state = req.body.state ? req.body.state.trim() : "";
  const tags = req.body.tags
    ? JSON.parse(req.body.tags.trim()).map((t) => t.value)
    : [];
  const date = req.body.date ? req.body.date.trim() : "";
  const content = req.body.content ? req.body.content.trim() : "";
  const version = req.body.version ? req.body.version.trim() : "";
  const url = req.body.url ? req.body.url.trim() : "";
  // const filters = req.body.filters ? req.body.filters : [];

  const subType = req.body.subType ? req.body.subType.trim() : "";
  const existingProjectId = req.body.existingProjectId
    ? req.body.existingProjectId.trim()
    : "";
  // const projectTitle = req.body.projectTitle ? req.body.projectTitle.trim() : '';
  // const projectDescription = req.body.projectDescription ? req.body.projectDescription.trim() : '';
  const pages = req.body.pages ? req.body.pages.trim() : "";
  const singlePage = req.body.singlePage ? req.body.singlePage.trim() : "";
  const fromPage = req.body.fromPage ? req.body.fromPage.trim() : "";
  const toPage = req.body.toPage ? req.body.toPage.trim() : "";

  let fileUrl = "";
  if (req.files) {
    // Save File on Server
    const fileName = `${uuid()}.${req.files.file.name.split(".").pop()}`;
    const filePath = path.resolve(__dirname, `../../temp/${fileName}`);
    await req.files.file.mv(filePath);

    fileUrl = await s3.uploadToS3(filePath, fileName);
    fs.unlinkSync(filePath);
  } else if (url !== "") {
  } else {
    req.flash("error_msg", "You Must select a file or a Url");
    return res.redirect("/admin/documents/new");
  }

  // let projectId;
  // if (projectTitle != '') {
  //   const newProject = new Project({
  //     title: projectTitle,
  //     description: projectDescription,
  //   });
  //   await newProject.save();
  //   projectId = newProject._id.toString();
  // } else if (existingProjectId != '') {
  //   projectId = existingProjectId;
  // } else {
  //   req.flash('error_msg', 'You Must select a Project');
  //   return res.redirect('/admin/documents/new');
  // }

  let selectedPages;
  if (pages == "all") {
    selectedPages = "all";
  } else if (pages == "single") {
    if (singlePage == "") {
      req.flash("error_msg", "Page was not selected");
      return res.redirect("/admin/documents/new");
    }
    selectedPages = singlePage;
  } else if (pages == "multiple") {
    if (fromPage == "" && toPage == "") {
      req.flash("error_msg", "Pages were not selected");
      return res.redirect("/admin/documents/new");
    }
    selectedPages = `${fromPage}-${toPage}`;
  }

  const newDocument = new Document({
    project: existingProjectId,
    type,
    subType,
    pages: selectedPages,
    name,
    description,
    content,
    city,
    state,
    tags,
    date: date !== "" ? moment(date, "YYYY-MM-DD") : null,
    version,
    file: fileUrl,
    url: url,
    // filters,
  });
  await newDocument.save();

  req.flash("success_msg", "Document Uploaded");
  res.redirect("/admin/documents");
};

module.exports.documents_multiple_post = async (req, res) => {
  // Get Data from Request Body
  if (!req.files) {
    req.flash("error_msg", "You Must select at least one file");
    return res.redirect("/admin/documents/multiple");
  } else {
    for (let i = 0; i < req.files.files.length; i++) {
      // Save File on Server
      const file = req.files.files[i];
      const fileExtension = file.name.split(".").pop();
      const fileName = `${uuid()}.${fileExtension}`;
      const filePath = path.resolve(__dirname, `../../temp/${fileName}`);
      await file.mv(filePath);

      let content;
      if (fileExtension.toLowerCase().trim() == "pdf") {
        content = await pdfToText(filePath);
      } else if (
        fileExtension.toLowerCase().trim() == "docx" ||
        fileExtension.toLowerCase().trim() == "xlsx" ||
        fileExtension.toLowerCase().trim() == "pptx"
      ) {
        content = await docToText(filePath);
      } else {
        content = await imgToText(filePath);
      }

      const fileUrl = await s3.uploadToS3(filePath, fileName);
      fs.unlinkSync(filePath);

      const newDocument = new Document({
        project: null,
        type: "",
        subType: "",
        pages: "all",
        name: "",
        description: "",
        content,
        city: "",
        state: "",
        tags: [],
        date: null,
        version: "",
        file: fileUrl,
        url: "",
      });

      await newDocument.save();
    }
  }

  req.flash("success_msg", "Documents Uploaded");
  res.redirect("/admin/documents");
};

module.exports.edit_document_post = async (req, res) => {
  // Get Data from Request Body
  const id = req.body.id ? req.body.id.trim() : "";
  const type = req.body.type ? req.body.type.trim() : "";
  const name = req.body.name ? req.body.name.trim() : "";
  const description = req.body.description ? req.body.description.trim() : "";
  const city = req.body.city ? req.body.city.trim() : "";
  const state = req.body.state ? req.body.state.trim() : "";
  const tags = req.body.tags
    ? JSON.parse(req.body.tags.trim()).map((t) => t.value)
    : [];
  const date = req.body.date ? req.body.date.trim() : "";
  const content = req.body.content ? req.body.content.trim() : "";
  const version = req.body.version ? req.body.version.trim() : "";
  const url = req.body.url ? req.body.url.trim() : "";
  // const filters = req.body.filters ? req.body.filters : [];

  const subType = req.body.subType ? req.body.subType.trim() : "";
  const existingProjectId = req.body.existingProjectId
    ? req.body.existingProjectId.trim()
    : "";
  // const projectTitle = req.body.projectTitle ? req.body.projectTitle.trim() : '';
  // const projectDescription = req.body.projectDescription ? req.body.projectDescription.trim() : '';
  const pages = req.body.pages ? req.body.pages.trim() : "";
  const singlePage = req.body.singlePage ? req.body.singlePage.trim() : "";
  const fromPage = req.body.fromPage ? req.body.fromPage.trim() : "";
  const toPage = req.body.toPage ? req.body.toPage.trim() : "";

  // Save File on Server
  if (req.files) {
    const fileName = `${uuid()}.${req.files.file.name.split(".").pop()}`;
    const filePath = path.resolve(__dirname, `../../temp/${fileName}`);
    await req.files.file.mv(filePath);
    const fileUrl = await s3.uploadToS3(filePath, fileName);
    fs.unlinkSync(filePath);
    await Document.findByIdAndUpdate(id, { file: fileUrl, url: "" });
  }

  // let projectId;
  // if (projectTitle != '') {
  //   const newProject = new Project({
  //     title: projectTitle,
  //     description: projectDescription,
  //   });
  //   await newProject.save();
  //   projectId = newProject._id.toString();
  // } else if (existingProjectId != '') {
  //   projectId = existingProjectId;
  // } else {
  //   req.flash('error_msg', 'You Must select a Project');
  //   return res.redirect(`/admin/documents/edit/${id}`);
  // }

  let selectedPages;
  if (pages == "all") {
    selectedPages = "all";
  } else if (pages == "single") {
    if (singlePage == "") {
      req.flash("error_msg", "Page was not selected");
      return res.redirect(`/admin/documents/edit/${id}`);
    }
    selectedPages = singlePage;
  } else if (pages == "multiple") {
    if (fromPage == "" && toPage == "") {
      req.flash("error_msg", "Pages were not selected");
      return res.redirect(`/admin/documents/edit/${id}`);
    }
    selectedPages = `${fromPage}-${toPage}`;
  }

  await Document.findByIdAndUpdate(id, {
    project: existingProjectId,
    type,
    subType,
    pages: selectedPages,
    name,
    description,
    content,
    city,
    state,
    tags,
    date: date !== "" ? moment(date, "YYYY-MM-DD") : null,
    version,
    url: url,
    // filters,
  });

  req.flash("success_msg", "Document Updated");
  res.redirect("/admin/documents");
};

module.exports.edit_document_get = async (req, res) => {
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
  const document = await Document.findById(req.params.id).populate("project");
  console.log(document);
  return res.render("documents/edit", { document, projects });
};
