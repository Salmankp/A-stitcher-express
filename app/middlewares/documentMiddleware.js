const fs = require('fs');


module.exports.log_document_version = async (req, res, next) => {
    try{
        let oldSend = res.send;
        res.send = async function (data) {
            let a = JSON.parse(data);
            if(res.statusCode === 200){
                let data_to_write = fs.readFileSync(req.document_id + '.txt');
                const user = req.user ? JSON.stringify(req.user) : null;
                data_to_write = data_to_write + "\n user:  " + JSON.stringify(user);
                if(req.body.document) data_to_write = data_to_write + "\n document before qa:  " + JSON.stringify(req.old_document) ;
                if(req.body.project) data_to_write = data_to_write + "\n project before qa:  " + JSON.stringify(req.old_project) ;
                if(req.body.property) data_to_write = data_to_write + "\n property before qa:  " + JSON.stringify(req.old_property) ;
                data_to_write = data_to_write + "\n endOfVersion";
                fs.writeFileSync(req.document_id + '.txt', data_to_write);
            }
            oldSend.apply(res, arguments);
        }
        next();
    } catch(e){
        console.log(e)
        res.status(500).json({error:e.message})
    }
};
