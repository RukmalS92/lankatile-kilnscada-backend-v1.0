const shared = require('../modules/shared')
const modbus = require('../modules/modbus')
const errorhandler = require('../modules/errorlog')
const database = require('../modules/database')
const data = require('../modules/shared')
const config = require('../../config/config.json')
const e = require('express')

/* For testing purpose enabling only required components */
let key = 0;
if(config.controllertest === "temp"){
    key = 1;
}
else if(config.controllertest === "inv"){
    key = 2;
}
else if(config.controllertest === "both"){
    key = 0;
}
else{
    key = -1;
}

//loading database connection
database.connectDB()
.then((successEvent) => errorhandler.info(successEvent))
.catch((error) => errorhandler.error(error))

const cyclicIntervalRealTime = 5000;
const cyclicIntervalDBUdpateTime = 30000;

//databse update
const dbUpdateFn = async (key) => {
    let temp_data = shared.temp_array;
    let inv_data = shared.inv_array;
    let finalinvdata = [];
    let finaltempdata = [];
    switch (key) {
        case 0:
            try {
                temp_data.forEach(element => {
                    finaltempdata.push(element[1]);
                });
                inv_data.forEach((element => {
                    finalinvdata.push(element[1]);
                }))
                await database.updateTemperatureData(finaltempdata)
                let timevalue = (await database.getTimeValue())[0].timevalue
                await database.updateVFDSpeedData(finalinvdata, timevalue)
            } catch (error) {
                throw new Error(error.message)
            }
            break;
        case 1:
            try {
                temp_data.forEach(element => {
                    finaltempdata.push(element[1]);
                });
                await database.updateTemperatureData(finaltempdata)
            } catch (error) {
                throw new Error(error.message)
            }
            break;
        case 2:
            try {
                inv_data.forEach((element => {
                    finalinvdata.push(element[1]);
                }))
                let timevalue = (await database.getTimeValue())[0].timevalue
                await database.updateVFDSpeedData(finalinvdata, timevalue)
            } catch (error) {
                throw new Error(error.message)
            }
            break;
    
        default:
            break;
    }
}

//realtime udpate on shared daata 
const realTimeUpdateFn = async (key) => {
    switch (key) {
        case 0:
            try {
                let rawTemp = await modbus.getTemperatureData()
                let rawIn = await modbus.getINVData()
                shared.temp_array = rawTemp;
                shared.inv_array = rawIn;
                // console.log(shared.temp_array)
            } catch (error) {
                throw new Error(error.message)
            }
            break;
    
        case 1:
            try {
                let rawTemp = await modbus.getTemperatureData()
                shared.temp_array = rawTemp;
            } catch (error) {
                throw new Error(error.message)
            }
        
            break;
    
        case 2:
            try {
                let rawIn = await modbus.getINVData()
                shared.inv_array = rawIn;
            } catch (error) {
                throw new Error(error.message)
            }
            break;
    
        default:
            break;
    }
}

setInterval(async () => {
    try {
        await realTimeUpdateFn(key)
    } catch (error) {
        errorhandler.error(error)
    }
}, cyclicIntervalRealTime)

setInterval(async () => {
    try {
        await dbUpdateFn(key)
    } catch (error) {
        errorhandler.error(error)
    }
}, cyclicIntervalDBUdpateTime)