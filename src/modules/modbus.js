const config = require('../../config/config.json')
const errorhandler = require('../modules/errorlog')
const ModbusMaster = require('modbus-rtu').ModbusMaster;
const DATA_TYPES = require('modbus-rtu').DATA_TYPES;
const SerialPort = require('serialport')
const ieee754 = require('ieee754')

let master;

//get temperature controller ID from 
const tempController = config.tempcontrollerid;
//get vfd id from
const vfd = config.vfdid;
//get com port address
const com_ports = config.com_ports

//register numbers
let temp_pv_address = 2;
let temp_sv_address = 4;
let vfd_pv_address = 8502;
let vfd_sv_address = 8502;

//comport flag
let temp_comport_available_flag = false;
let inv_comport_available_flag = false; 

//comports
let serialPortTemp;
let serialPortVFD;

//Temperature Controller modbus connection
SerialPort.list()
.then((ports) => {
    if(ports.length === 0){
        temp_comport_available_flag = false;
        inv_comport_available_flag = false;
    }
    else if(ports.length > 0){
        ports.forEach(port => {
            if(port.path === com_ports.temeprature){
                temp_comport_available_flag = true;
                serialPortTemp = new SerialPort(com_ports.temeprature, {
                    baudRate: 9600,
                    parity: 'none'
                 });
                try {
                    masterTemp = new ModbusMaster(serialPortTemp, {responseTimeout : 50});
                    errorhandler.info("Modbus @Temperature Connection Complete ...")
                } catch (error) {
                    errorhandler.error(new Error("Error in Serial Port @Temperature Connection or modbus instance : ErrorType : " + error.name + " Original Error Message : " + error.message))
                }
            }
            if(port.path === com_ports.vfd){
                inv_comport_available_flag = true;
                serialPortVFD = new SerialPort(com_ports.vfd, {
                    baudRate: 9600,
                    parity: 'none'
                 });
                try {
                    masterVFD = new ModbusMaster(serialPortVFD, {responseTimeout : 50});
                    errorhandler.info("Modbus @Inverter Connection Complete ...")
                } catch (error) {
                    errorhandler.error(new Error("Error in Serial Port @Inverter Connection or modbus instance : ErrorType : " + error.name + " Original Error Message : " + error.message))
                }
            }
        })
    }
})
.catch(error => errorhandler.error(error))


//read temperature module data : type int
const getTempData = async () => {
    let finalData = [];
    let data;
    for (let index = 0; index < tempController.length; index++) {
        const id = tempController[index];
        try {
            if(temp_comport_available_flag === false){
                throw new Error("ComPortError")
            }
            data = await masterTemp.readHoldingRegisters(id, temp_pv_address, 1);
            finalData.push([id, data[0]]);
        } catch (error) {
            if(error.name === 'ModbusResponseTimeout'){
                finalData.push([id,-1]);
            }
            else if(error.message === "ComPortError"){
                console.log('tem no com')
                finalData.push([id,-2]);
            }
            else{
                finalData.push([id,0]);
            }
        }
    }
    return finalData;
}

//write temperature data : type int []
const updateTempData = async (data) => {
    let communication_failure_count = 0;
    for (let index = 0; index < tempController.length; index++) {
        const id = tempController[index];
        const value = data[index];
        console.log(id, value)
        try {
            await masterTemp.writeMultipleRegisters(id, temp_sv_address, [value])
        } catch (error) {
            communication_failure_count += 1;
        }
    } 
    if(communication_failure_count > 0){
        throw new Error("Faliure to write one or more devices count is == " + communication_failure_count)
    }
}

//read VFD data (frequency) : type float
const getINVData = async() => {
    let finalData = [];
    let data;
   try {
        for (let index = 0; index < vfd.length; index++) {
            const id = vfd[index];
            try {
                if(inv_comport_available_flag === false){
                    throw new Error("ComPortError")
                }
                data = await masterVFD.readHoldingRegisters(id, vfd_pv_address ,1);
                let speedValue = parseFloat(data[0] / 10);
                // console.log(speedValue, data)
                finalData.push([id, speedValue]);
            } catch (error) {
                if(error.name === 'ModbusResponseTimeout'){
                    finalData.push([id,-1.0]);
                }
                else if(error.message === "ComPortError"){
                    finalData.push([id,-2]);
                }
                else{
                    finalData.push([id,0.0]);
                }
            }
        }
   } catch (error) {
        throw new Error("Error in getting modbus data @Speed : ErrorType " + error.name + "Original Message : " + error.message)
   }
   return finalData;
}

//write vfd data : type float
const updateINVData = async (id, value) =>{
    try {
        let writeValue = parseInt(value * 10)
        console.log("write value : " + writeValue)
        try {
            await masterVFD.writeMultipleRegisters(id, vfd_sv_address, [writeValue])
        } catch (error) {
            throw new Error("Error in writing VFD data : ErrorType " + error.name + "Original Message : " + error.message)
        }
    } catch (error) {
        throw new Error("Error buffer : ErrorType " + error.name + "Original Message : " + error.message)
    }
}

module.exports = {
    getTemperatureData : getTempData,
    updateTempData,
    getINVData,
    updateINVData
}

