const router = require('express').Router()
const bodyparser = require('body-parser')
const modbusDev = require('../modules/modbus')
const errorhandler = require('../modules/errorlog')
const shared = require('../modules/shared')
const database = require('../modules/database')
const moment = require('moment')
const data = require('../modules/shared')
const middleware = require('../middleware/middleware')
const chalk = require('chalk')

let currentTempMaxId = 0;
let currentInvMaxId = 0;

//handle json body
router.use(bodyparser.json());

//api -> ep retrieve temperature sv
router.get('/tempretrieve', async(req, res) => {
    console.log(chalk.green("Temperature SV Value  Read..."))
    try {
        let values = await database.getSVTempData()
        res.send(values[0])
    } catch (error) {
        errorhandler.error(error)  
        res.status(501).send(error)
    }
})

//api -> ep retrieve inverter SV
router.get('/invretrieve', async(req,res) => {
    console.log(chalk.green("Invertr SV Value Read..."))
    try {
        let values = await database.getSVInvData()
        res.send(values[0])
    } catch (error) {
        errorhandler.error(error)  
        res.status(501).send(error)
    }
})

//api ep -> update temperature controllers
router.get('/temp', async (req,res) => {
    console.log(chalk.blue("Temperature RealTime Read.."))
    try {
        let data = shared.temp_array
        res.send({data})
    } catch (error) {
        errorhandler.error(error)   
        res.status(501).send({Error : error});
    }
});

//api ep -> write temperature data
router.use('/tempwr', middleware.saveTempSV)
router.post('/tempwr', async (req,res) => {
    console.log(chalk.yellow("Temperature Values Write.."))
    try {
        let temperatureValues = Object.values(req.body)
        await modbusDev.updateTempData(temperatureValues)
        res.send({status : "success"})
    } catch (error) {
        res.send({status : "fail"})
        errorhandler.error(error)
    }
})

//api ep -> update vfd data 
router.get('/inv', async (req,res) => {
    console.log(chalk.blue("Inverter RealTime Read.."))
    try {
        let data = shared.inv_array;
        let timevalue = await database.getTimeValue()
        let obj = {
            data,
            timevalue : timevalue[0].timevalue
        }
        res.send(obj)
    } catch (error) {
        errorhandler.error(error)   
        res.status(501).send({Error : error});
    }
});

//api -> ep inv1 , inv2 both set to cycletime(timevalue) settings
router.use('/cycleinvwr', middleware.cycleTimeFreqUdpateINV1INV2)
router.use('/cycleinvwr', middleware.saveInvSV)
router.post('/cycleinvwr', async(req,res) => {
    console.log(chalk.bgYellow("Inverter1 Inverter2 Values Write.."))
    let updateSuccessFlag = true;
    const keys = req.keys;
    console.log(req.body)
    const values = Object.values(req.body); //this hold inv values as well as at last timevalue 
    for (let index = 0; index < (keys.length - 1); index++) { //keys.length - 1 = to omit timevalue
        const key = keys[index];
        const value = values[index];
        try {
            await modbusDev.updateINVData(key, value);
        } catch (error) {
            errorhandler.error(error); 
            updateSuccessFlag = false;
        }
    }
    let response = (updateSuccessFlag === false) ? "fail" : "success";
    res.send({status : response});
})

//api -> ep write timevalue data
router.use('/inv3wr', middleware.saveInvSV)
router.use('/inv3wr', middleware.getinv3ID)
router.post('/inv3wr', async (req,res) => {
    console.log(chalk.bgYellowBright("Inverter3 Values Write.."))
    let updateSuccessFlag = true;
    let invid = req.invid;
    let inv3freq = req.value;
    console.log(invid, inv3freq)
    try {
        await modbusDev.updateINVData(invid,inv3freq)
    } catch (error) {
        errorhandler.error(error); 
        updateSuccessFlag = false;
    }
    let response = (updateSuccessFlag === false) ? "fail" : "success";
    res.send({status : response})
})

//api ep -> history
router.get('/temphistory', async (req,res) => {
    console.log(chalk.bgRed('Temperature History Get...'))
    const history_init_flag = parseInt(req.query.init);
    const device = req.query.device;    
    const currentDate = moment().format();
    const recordStartDate = moment().subtract(1, 'month').format();
    const recordStopDate = moment().add(1, 'day').format();

    if(history_init_flag === 0){
        currentTempMaxId = 0;
    }

    try {
        let historyDataSingle = (device === "trcx") ? await database.getTempDataSingle(recordStartDate, recordStopDate, currentTempMaxId) : {}
        currentTempMaxId = (await database.getCurrentMaxIDforTemp())[0].maxid;
        // console.log(historyDataSingle)
        res.send(historyDataSingle);
    } catch (error) {
        errorhandler.error(error);
        res.status(501).send({Error : error});
    }
});

//inverter history 
router.get('/invhistory', async (req,res) => {
    console.log(chalk.bgRedBright('Temperature History Get...'))
    const history_init_flag = parseInt(req.query.init);
    const device = req.query.device;    
    const currentDate = moment().format();
    const recordStartDate = moment().subtract(1, 'month').format();
    const recordStopDate = moment().add(1, 'day').format();

    if(history_init_flag === 0){
        currentInvMaxId = 0;
    }

    try {
        let historyDataSingle = (device === "inv") ? await database.getInvDataSingle(recordStartDate, recordStopDate, currentInvMaxId) : {};
        currentInvMaxId = (await database.getCurrentMaxIDforInv())[0].maxid;
        res.send(historyDataSingle);
    } catch (error) {
        errorhandler.error(error);
        res.status(501).send({Error : error});
    }
})


module.exports = router