const mysql = require('mysql')
const db = mysql.createConnection({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_DATABASE,
    port: 3306
})

// const db = mysql.createConnection({
//     host     : 'db4free.net',
//     user     : 'hannah4669',
//     password : 'l0vejesus',
//     database : 'databasehannahuy',
//     port: 3306
// })
db.connect((err)=>{
    if(err){
        console.log(err)
    }
    console.log('success')
})

module.exports = db