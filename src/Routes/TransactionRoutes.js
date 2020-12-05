const Router = require('express').Router()
const {TransactionControllers} = require('./../controllers')
const {auth} = require('./../helpers/Auth')
const {checkuser} = require('../helpers/checkingUser')

Router.post('/addToCart', auth, TransactionControllers.addToCart) // perlu token
Router.get('/getCart', TransactionControllers.getCart)
Router.post('/bayarcc', TransactionControllers.onbayarCC)
Router.post('/bayarbukti', auth, checkuser, TransactionControllers.uploadPembayaran)

// manage payment start
Router.get('/getWaitingApprove', TransactionControllers.getAdminConfApprove)
Router.put('/approve/:id', TransactionControllers.adminApprove)
Router.put('/reject/:id', TransactionControllers.adminReject)
// manage payment end

module.exports = Router