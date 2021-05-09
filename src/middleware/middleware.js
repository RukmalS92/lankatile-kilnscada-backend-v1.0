const errorhandler = require('../modules/errorlog')
const database = require('../modules/database')
const config = require('../../config/config.json')

const timevalue_calibration = config.timevalue_calibration;
const invIDs = config.vfdid;

//middleware to convert SV values array -> JSON
const arrayToJson = (req,res,next) => {
    
}

//middleware to convert SV values JSON -> array
const jsonToArray = (req,res,next) => {
    
}

//middleware to save the SV values : Temperature to database
const saveTempSV =  async (req,res,next) => {
    try {
        await database.setSVTempData(req.body)
        next();
    } catch (error) {
        errorhandler.error(error)
        res.status(501).send({status : "fail"})
    }
}

//middleware to save SV values : Inverter to database
const saveInvSV = async (req,res,next) => {
    try {
        const values = Object.values(req.body)
        const lengthViolationElements = values.filter((value) => value >= 100)
        if(lengthViolationElements > 0){
            throw new Error("Exeeds Inverter control variable than 100")
        }
        await database.setSVInvData(req.body)
        next();
    } catch (error) {
        errorhandler.error(error)
        res.status(501).send({status : error.message})
    }
}

//update timevalue calibration value
const timevalueCalibration = (req,res,next) => {
    req.invid = invIDs[2];
    req.svfreq = req.body.timevalue * timevalue_calibration;
    req.body = {
        inv3 : req.svfreq,
        timevalue : req.body.timevalue
    }
    next();
}

//get inv ids for secondary inverters
const getSecondaryInvID = (req,res,next) => {
    req.keys = invIDs.slice(0,2)
    req.values = Object.values(req.body)
    next();
}

module.exports = {
    arrayToJson,
    jsonToArray,
    saveTempSV,
    saveInvSV,
    timevalueCalibration,
    getSecondaryInvID
}