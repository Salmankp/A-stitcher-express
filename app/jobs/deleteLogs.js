const Log = require('../models/Log');

const deleteLogs = async(req,res)=> {
    try{
        let currentDate =new Date();
        let currentDateMinusSevenDays = moment(currentDate.getDate()-6).format('YYYY-MM-DD');
        await Log.remove({ createdAt: {
            $lt: currentDateMinusSevenDays
          }});
        console.log("done");
    } catch(e){
        console.log(e);
        res.status(500).json({error:e.message})
    }
}



  module.exports = {
    deleteLogs
  }
   
