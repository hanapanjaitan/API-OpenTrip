const Router = require('express').Router()
const {ProductControllers} = require('./../controllers')
// const {auth} = require('./../helpers/Auth')

Router.post('/addProduct', ProductControllers.addProduct)
Router.get('/getProduct', ProductControllers.getProduct)
Router.post('/addProductFoto', ProductControllers.addProductFoto)
Router.get('/getProduct/:id', ProductControllers.getProductDetails)

module.exports = Router