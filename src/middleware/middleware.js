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
        // const values = Object.values(req.body)
        // const lengthViolationElements = values.filter((value) => value >= 100)
        // if(lengthViolationElements > 0){
        //     throw new Error("Exeeds Inverter control variable than 100")
        // }
        await database.setSVInvData(req.body)
        next();
    } catch (error) {
        errorhandler.error(error)
        res.status(501).send({status : error.message})
    }
}

//update timevalue calibration value
const getinv3ID = (req,res,next) => {
    req.invid = invIDs[2];
    req.value = req.body.inv3;
    next();
}

//get inv ids for secondary inverters
const cycleTimeFreqUdpateINV1INV2 = (req,res,next) => {
    req.keys = invIDs.slice(0,2)
    req.values = Object.values(req.body)
    const inv1freq = (timevalue_calibration / req.body.timevalue).toFixed(1);
    const inv2freq = (timevalue_calibration / req.body.timevalue).toFixed(1);
    req.body = {
        inv1 : inv1freq,
        inv2 : inv2freq,
        timevalue : req.body.timevalue
    }
    next();
}

module.exports = {
    arrayToJson,
    jsonToArray,
    saveTempSV,
    saveInvSV,
    getinv3ID,
    cycleTimeFreqUdpateINV1INV2
}