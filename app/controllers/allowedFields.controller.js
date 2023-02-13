const FieldsAllowedValue = require("../models/FieldsAllowedValue");
const _ = require("underscore");

const getAllowedFieldValues = async (req, res) => {
    try {
        let data = await FieldsAllowedValue.find(
            {fieldName: req.params.fieldName},
            {allowedValue: 1}
        );
        data = data.map((x) => x.allowedValue);
        res.status(200).json(data);
    } catch (e) {
        console.log(e);
        res.status(500).json({error: e.message});
    }
};

const addAllowedFieldValues = async (req, res) => {
    try {
        let valuesBulkOps = [];
        if (req.body === undefined || req.body.length === 0) {
            return res.status(400).json({message: 'Bad payload'});
        }

        for(let i = 0; i < req.body.length; i++){
            const item = req.body[i];
            if (item?.fieldName === undefined || item?.fieldName === null ||
                item?.allowedValue === null || item?.allowedValue === undefined
            ) {
                return res.status(400).json({message: 'Bad payload'});
            }
        }

        const updateOps = valuesBulkOps = req.body.map((object) => ({
            updateOne: {
                filter: {
                    allowedValue: object.allowedValue,
                    fieldName: object.fieldName,
                },
                update: object,
                upsert: true,
            },
        }));
        if (updateOps.length > 0) {
            await FieldsAllowedValue.bulkWrite(valuesBulkOps)
                .then(console.log.bind(console, "BULK update OK:"))
                .catch(console.error.bind(console, "BULK update error:"));
        }
        res.status(200).json({});
    } catch (e) {
        console.log(e);
        res.status(500).json({error: e.message});
    }
};

module.exports = {
    getAllowedFieldValues,
    addAllowedFieldValues,
};
