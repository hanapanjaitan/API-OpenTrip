const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const bearerToken = require('express-bearer-token')
const fs = require('fs')

const PORT = process.env.PORT || 4669


require('dotenv').config()
app.use(cors())
app.use(bearerToken())
app.use(bodyParser.json()) //buat bisa dapat value body
// app.use(express.json()) // bisa juga alternatif body parser
app.use(express.static('public'))
// http://localhost:5000/fibonacci.png


app.get('/', (req, res)=>{
    res.send('<h1> Welcome to API Open Trip</h1>')
})


const {AuthRoutes, ProductRoutes, TransactionRoutes} = require('./src/Routes')

app.use('/auth', AuthRoutes)
app.use('/product', ProductRoutes)
app.use('/trans', TransactionRoutes)

// var schedule = require('node-schedule')

// var j = schedule.scheduleJob("*/10 * * * * *", function(firedate){
//     console.log('The answer to life, the universe, and everything!'+firedate);
// });




app.listen(PORT, ()=>console.log('API aktif di Port: ', PORT))