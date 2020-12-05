const jwt = require('jsonwebtoken') //baca dokumentasinya


module.exports = {
    createJWToken (payload){
        return jwt.sign(payload, "puripuri", {expiresIn:'12h'})
    }
}