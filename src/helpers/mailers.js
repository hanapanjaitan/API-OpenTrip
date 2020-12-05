const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: 'hannah4669@gmail.com',
        pass: 'pbfpmnwqfjqpbgjw'
    },
    tls: {
        rejectUnauthorized: false
    }
})

module.exports = transporter