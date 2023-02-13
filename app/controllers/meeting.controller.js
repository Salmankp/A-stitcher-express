const Project = require("../models/Project");
const Meeting = require("../models/Meeting");
const Document = require("../models/Document");
const { ERROR_CODES, SUCCESS_CODE } = require("../constants/index");

const getAllMeetings = async (req, res, _next) => {
  try {
    let limit = 20;
    let offset = 0;
    if (req.query.page_number && req.query.page_number == 1) offset = 0;
    else if (req.query.page_number && req.query.page_number > 1)
      offset = (req.query.page_number - 1) * limit;
    let meetings = await Meeting.paginate(
      {},
      {
        offset: offset,
        limit: limit,
        populate: [
          { path: "supplementalDocs" },
          { path: "fileLocation" },
          { path: "projectReferences" },
        ],
      }
    ).then((meetings) => {
      return meetings;
    });
    if (meetings.length <= 0) {
      return res.status(ERROR_CODES.BAD_REQUEST).json({
        error: false,
        message: "No meetings has been added so far!",
      });
    }
    return res.status(SUCCESS_CODE).json({
      error: false,
      meetings: meetings,
    });
  } catch (error) {
    return res.status(ERROR_CODES.BAD_REQUEST).json({
      error: true,
      message: "No meetings has been added so far!",
    });
  }
};

const store = async (req, res, _next) => {
  try {
    let meetingRecord = new Meeting(req.body);
    await meetingRecord.save();
    if (req.body.projectReferences.length > 0) {
      await Project.updateMany(
        { _id: { $in: req.body.projectReferences } },
        {
          $push: {
            meetingReferences: meetingRecord._id,
          },
        },
        { multi: true }
      );
    }
    if (req.body.supplementalDocs.length > 0) {
      await Document.updateMany(
        { _id: { $in: req.body.supplementalDocs } },
        {
          $set: {
            meetingIdReference: meetingRecord._id,
          },
        },
        { multi: true }
      );
    }
    return res.status(SUCCESS_CODE).json({
      message: "Meeting created Successfully !",
      meetingRecord,
    });
  } catch (error) {
    return res.status(ERROR_CODES.BAD_REQUEST).json({
      error: true,
      message: error,
    });
  }
};

const update = async (req, res, _next) => {
  let meetingRecord = await Meeting.findOne({
    _id: req.params.id,
  });
  if (!meetingRecord) {
    return res.status(ERROR_CODES.BAD_REQUEST).json({
      error: false,
      message: "Meeting not exists",
    });
  } else {
    try {
      let meetingResponse;
      let response = await meetingRecord.update(req.body);
      if (response) {
        meetingResponse = await Meeting.findOne({
          _id: meetingRecord._id,
        });

        if (req.body.projectReferences) {
          await Project.updateMany(
            { _id: { $in: meetingRecord.projectReferences } },
            {
              $pull: {
                meetingReferences: meetingRecord._id,
              },
            },
            { multi: true }
          );

          await Project.updateMany(
            { _id: { $in: req.body.projectReferences } },
            {
              $push: {
                meetingReferences: meetingRecord._id,
              },
            },
            { multi: true }
          );
        }

        if (req.body.supplementalDocs) {
          await Document.updateMany(
            { _id: { $in: meetingRecord.supplementalDocs } },
            {
              $set: {
                meetingIdReference: null,
              },
            },
            { multi: true }
          );

          await Document.updateMany(
            { _id: { $in: req.body.supplementalDocs } },
            {
              $set: {
                meetingIdReference: meetingRecord._id,
              },
            },
            { multi: true }
          );
        }
      }
      return res.status(SUCCESS_CODE).json({
        case: meetingResponse,
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
  let meetingRecord = await Meeting.findOne({
    _id: req.params.id,
  })
    .sort({ updatedAt: -1 })
    .populate("supplementalDocs")
    .populate("fileLocation")
    .populate("projectReferences");
  if (!meetingRecord) {
    return res.status(ERROR_CODES.BAD_REQUEST).json({
      error: false,
      message: "Meeting not exists",
    });
  } else {
    try {
      return res.status(SUCCESS_CODE).json({
        meeting: meetingRecord,
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

    let meetingRecord = await Meeting.findOne({
      _id: id,
    });

    await Project.updateMany(
      { _id: { $in: meetingRecord.projectReferences } },
      {
        $pull: {
          meetingReferences: meetingRecord._id,
        },
      },
      { multi: true }
    );

    await Document.updateMany(
      { _id: { $in: meetingRecord.supplementalDocs } },
      {
        $set: {
          meetingIdReference: null,
        },
      },
      { multi: true }
    );

    await Meeting.findOneAndDelete({
      _id: id,
    });

    return res.status(SUCCESS_CODE).json({
      message: "Record deleted successfully",
    });
  } catch (error) {
    return res.status(ERROR_CODES.BAD_REQUEST).json({
      error: false,
      message: "Meeting not exists",
    });
  }
};

const insertScrapedData = async (req, res) => {
  try {
    const meetingBulkOps = req.body.meeting_objects.map((object) => ({
      updateOne: {
        filter: { itemId: object.itemId, meetingId: object.meetingId },
        update: object,
        upsert: true,
      },
    }));
    await Meeting.bulkWrite(meetingBulkOps)
      .then(console.log.bind(console, "BULK update OK:"))
      .catch(console.error.bind(console, "BULK update error:"));

    for (let object of req.body.meeting_objects) {
      let meeting = await Meeting.findOne({
        itemId: object.itemId,
        meetingId: object.meetingId,
      });
      if (meeting) {
        for (let projectId of meeting.projectReferences) {
          const project = await Project.findOne({ _id: projectId });
          if (project) {
            if (!project.meetingReferences.includes(meeting._id))
              project.meetingReferences.push(meeting._id);
            await project.save();
          }
        }
        for (let documentId of meeting.supplementalDocs) {
          const document = await Document.findOne({ _id: documentId });
          if (document) {
            await document.updateOne({ meetingId: meeting._id });
          }
        }
      }
    }
    res
      .status(200)
      .json({
        status: 200,
        message: "Meetings scrapped data inserted successfully.",
      });
  } catch (error) {
    console.log("insert scrapped data of meeting error", error.stack);
    res.status(500).json({ status: 500, data: error });
  }
};

const getMeetingItems = async (req, res) => {
  try {
    const meetingId = req.params.meetingId
      ? parseInt(req.params.meetingId)
      : "";
    const meetings = await Meeting.find({ meetingId: meetingId });
    res.status(200).json({ status: 200, meetings });
  } catch (error) {
    console.log("meeting_item error", error.stack);
    res.status(500).json({ status: 500, data: "Server Error" });
  }
};

const getMeetingField = async (req, res) => {
  try {
    const getField = req.params.field ? req.params.field : "";
    const fieldData = await Meeting.find({}, `${getField} lastChangedDate `);
    res.status(200).json({ status: 200, fieldData });
  } catch (error) {
    console.log("meeting_field error", error.stack);
    res.status(500).json({ status: 500, data: "Server Error" });
  }
};

module.exports = {
  store,
  show,
  update,
  destroy,
  getAllMeetings,
  insertScrapedData,
  getMeetingItems,
  getMeetingField,
};
