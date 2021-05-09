const mysql = require('mysql')
const config = require('../../config/config.json')

const con = mysql.createConnection(config.database);

//connect to database
const connectDB = () => {
    return new Promise((resolve, reject) => {
        con.connect((error) => {
            if(error){
                return reject(new Error("DB Connection Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve("DB Connection Success")
        });
    });
}

/* Update Data */

//update raw-temperature data table with temperature data
const updateTemperatureData = (tempdata) => {
    return new Promise((resolve, reject) => {
        const query = "insert into temp_rawdata(temp_t1, temp_t2, temp_t3, temp_t4, temp_t5, temp_t6, temp_t7, temp_t8, temp_t9, temp_t10) values(" + tempdata[0] + ", " + tempdata[1] + " , " + tempdata[2] + "," + tempdata[3] + ", " + tempdata[4] + ", " + tempdata[5] + ", " + tempdata[6] + ", " + tempdata[7] + ", " + tempdata[8] + ", " + tempdata[9] + ");"
        con.query(query, (error, results, fields) => {
            if(error){
                return reject(new Error("Temperature Raw Data update Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve("Success")
        })
    })
}

//update raw-motor vfd data table with vfd data
const updateVFDSpeedData = (invdata, timevalue) => {
    return new Promise((resolve, reject) => {
        const query = "insert into inv_rawdata(inv1, inv2, inv3, timevalue) values(" + invdata[0] + ", " + invdata[1] + " , " + invdata[2] + "," + timevalue + ");" 
        con.query(query, (error,results,fields) => {
            if(error){
                return reject(new Error("INVSpeed Raw Data update Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve("Success")
        })
    })
}

/* Retreive Data */
//bulk - initial retreival of temperature data
const getTempDataBulk = (start, end) => {
    return new Promise((resolve, reject) => {
        const query = "select date(logtime) as date, " +
		"time(logtime) as time, " +
        "temp_t1 as temp_t1, " +
        "temp_t2 as temp_t2, " +
        "temp_t3 as temp_t3, " +
        "temp_t4 as temp_t4, " +
        "temp_t5 as temp_t5, " +
        "temp_t6 as temp_t6, " +
        "temp_t7 as temp_t7, " +
        "temp_t8 as temp_t8, " +
        "temp_t9 as temp_t9, " +
        "temp_t10 as temp_t10 " +
        "from temp_rawdata " +
        "where logtime between '"+ start + "' and '"+ end + "'";
        con.query(query, (error, results, fields) => {
            if(error){
                return reject(new Error("Temperature History data BULK retrieve Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })
}

//get current max id for the temperature
const getCurrentMaxIDforTemp = () => {
    return new Promise((resolve, reject) => {
        const query = "select max(id) as maxid from temp_rawdata";
        con.query(query, (error, results, fields) => {
            if(error){
                return reject(new Error("Max Id retrieval error @ Temperature : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })
}

//single retreival of temperature data
const getTempDataSingle = (start, end, currentId) => {
    return new Promise((resolve, reject) => {
        const query = "select date(logtime) as date, " +
                            "time(logtime) as time, " +
                            "temp_t1 as temp_t1, " +
                            "temp_t2 as temp_t2, " +
                            "temp_t3 as temp_t3, " +
                            "temp_t4 as temp_t4, " +
                            "temp_t5 as temp_t5, " +
                            "temp_t6 as temp_t6, " +
                            "temp_t7 as temp_t7, " +
                            "temp_t8 as temp_t8, " +
                            "temp_t9 as temp_t9, " +
                            "temp_t10 as temp_t10 " +
                            "from temp_rawdata " +
                            "where (logtime between '" + start + "' and '" + end + "') and (id between " + currentId + " and (select max(id) from temp_rawdata)) ;";
        con.query(query, (error, results, fields) => {
            if(error){
                return reject(new Error("Temperature History data SINGLE retrieve Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })
}

//get inv data bulk
const getInvDataBulk = (start, end) => {
    return new Promise((resolve, reject) => {
        const query = "select date(logtime) as date, " +
		"time(logtime) as time, " +
        "inv1 as inv1, " +
        "inv2 as inv2, " +
        "inv3 as inv3, " +
        "timevalue as timevalue " +
        "from inv_rawdata " +
        "where logtime between '"+ start + "' and '" + end + "';";
        con.query(query, (error, results, fields) => {
            if(error) {
                return reject(new Error("Invertert Speed History data BULK retrieve Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })
}

//get maxid for inverter speed
const getCurrentMaxIDforInv = () => {
    return new Promise((resolve, reject) => {
        const query = "select max(id) as maxid from inv_rawdata";
        con.query(query, (error,results,fields) => {
            if(error){
                return reject(new Error("Max Id retrieval error @ Inverter : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })
}

//get inv data single
const getInvDataSingle = (start, end, currentId) => {
    return new Promise((resolve, reject) => {
        const query = "select date(logtime) as date, " +
                        "time(logtime) as time, " +
                        "inv1 as inv1, " +
                        "inv2 as inv2, " +
                        "inv3 as inv3, " +
                        "timevalue as timevalue " +
                        "from inv_rawdata " +
                        "where (logtime between '" + start + "' and '" + end + "') and (id between " + currentId + " and (select max(id) from inv_rawdata));";
        con.query(query, (error, results, fields) => {
            if(error) {
                return reject(new Error("Inverter Speed History data Single retrieve Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })
}

/*Saving Data*/
//valus : int array [['temp_t1, 1],...]
const setSVTempData = (values) => {
    return new Promise((resolve, reject) => {
        let query = ""
        let sub_query = ""
        const ids = Object.keys(values)
        const vals = Object.values(values)
        for (let index = 0; index < vals.length - 1; index++) {
            const value = vals[index];
            const id = ids[index];
            sub_query += id + "=" + value + ","
        }
        sub_query += (ids[vals.length - 1]) + "=" + (vals[vals.length - 1])
        query = "update temp_savedata set " + sub_query + " where id = 1;";
        con.query(query, (error,results,fields) => {
            if(error){
                return reject(new Error ("Saving Temperature Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })   
}

const getSVTempData = () => {
    return new Promise((resolve, reject) => {
        const query = "select temp_t1, temp_t2, temp_t3, temp_t4, temp_t5, temp_t6, temp_t7, temp_t8, temp_t9, temp_t10 from temp_savedata where id = 1;"
        con.query(query, (error, results, fields) => {
            if(error){
                return reject(new Error ("Getting set value Temperature Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })
}

const setSVInvData = (values) => {
    return new Promise((resolve, reject) => {
        let query = ""
        let sub_query = ""
        const ids = Object.keys(values)
        const vals = Object.values(values)
        for (let index = 0; index < vals.length - 1; index++) {
            const value = vals[index];
            const id = ids[index];
            sub_query += id + "=" + value + ","
        }
        sub_query += (ids[vals.length - 1]) + "=" + (vals[vals.length - 1])
        query = "update inv_savedata set " + sub_query + " where id = 1;";
        con.query(query, (error,results,fields) => {
            if(error){
                return reject(new Error ("Saving Inverter Data Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })   
}

const getSVInvData = () => {
    return new Promise((resolve, reject) => {
        const query = "select inv1, inv2, inv3, timevalue from inv_savedata where id = 1;"
        con.query(query, (error, results, fields) => {
            if(error){
                return reject(new Error ("Getting Set Value Inverter Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })
}

const getTimeValue = () => {
    return new Promise((resolve, reject) => {
        const query = "select timevalue from inv_savedata;"
        con.query(query, (error, results, fields) => {
            if(error){
                return reject(new Error("Getting Time Value Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })
}


module.exports = {
    connectDB,
    updateTemperatureData,
    updateVFDSpeedData,
    getTempDataBulk,
    getTempDataSingle,
    getCurrentMaxIDforTemp,
    getInvDataBulk,
    getInvDataSingle,
    getCurrentMaxIDforInv,
    setSVTempData,
    getSVTempData,
    setSVInvData,
    getSVInvData,
    getTimeValue
}


