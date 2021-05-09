const express = require('express')
//loading the cyclic module instance : sametime it runs the module
const cyclic = require('./cyclic/cyclic')
const mainRoute = require('./routes/main')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(mainRoute)


app.listen(3000, () => console.log("Data Processor Server listening on port : 3000"));