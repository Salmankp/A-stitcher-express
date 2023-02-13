const Joi = require('joi');

module.exports.validate_user_login = async (req, res, next) => {
    try{
        const schema = Joi.object().keys({
          email: Joi.string().required(),
          password: Joi.string().required(),
        });
        const result = schema.validate(req.body); 
        if(result.error == null)  //means valid
          next();
        else
          return res.status(400).json({
          success: false,
          msg: result.error.details.map(i => i.message).join(',')})
    } catch(e){
      console.log('error',e);
        res.status(500).json({error:e.message})
    }
};