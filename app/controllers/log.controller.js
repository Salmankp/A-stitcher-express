const Log = require('../models/Log');
const moment = require('moment');

module.exports.createLog = async (req, res) => {
  try {
    var log = new Log({ LogMessage: req.body.LogMessage, error: req.body.error, LogObject: req.body.LogObject, Origin:req.body.Origin  });
    log.save();
    res.status(400).json({ status: 200, log   });
  } catch (error) {
    console.log('document_update error', error.stack);
    res.status(500).json({ status: 500, data: 'Server Error' });
  }
};

module.exports.getAllLogs = async (req, res) => {
  try {
    const logs = await Log.find();
    res.status(200).json({ status: 200, logs });
  } catch (error) {
    console.log('logs_get error', error.stack);
    res.status(500).json({ status: 500, data: 'Server Error' });
  }
};

module.exports.getRecentLogs = async (req, res) => {
  try {
    const recentLogTime = moment().subtract(req.params.hours, 'hours').format("YYYY-MM-DD HH:mm:ss");
    const logs = await Log.find({createdAt: {$gte: recentLogTime}});
    res.status(200).json({ status: 200, logs });
  } catch (error) {
    console.log('logs_get error', error.stack);
    res.status(500).json({ status: 500, data: 'Server Error' });
  }
};
