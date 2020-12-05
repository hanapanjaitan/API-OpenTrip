const {db} = require('./../connections')
const {uploader} = require('./../helpers/uploader')
const fs = require('fs')

module.exports = {
    addProduct: (req, res) => {
        try {
            const path = '/product' //nama folder nya nanti
            const upload = uploader(path, 'PROD').fields([{name: 'image'}])
            // 'TES' nanti nama depan file nya, boleh diganti
            upload(req, res, (err)=>{
                if (err){
                    return res.status(500).json({message: 'Upload picture failed', error: err.message})
                }
                console.log('berhasil upload')
                const {image} = req.files
                console.log(image)
                const imagePath = image ? path + '/' + image[0].filename : null
                console.log(imagePath)
                console.log(req.body.data)
                const data = JSON.parse(req.body.data)
                let datainsert = {
                    namaproduct: data.namaproduct,
                    capacity: data.capacity,
                    harga: data.harga,
                    banner: imagePath,
                    deskripsi: data.deskripsi,
                    tanggalmulai: data.tanggalmulai,
                    tanggalberakhir: data.tanggalberakhir
                }
                // data.banner = imagePath
                console.log(datainsert)
                db.query(`insert into product set ?`, datainsert, (err)=>{
                    if(err){
                        if(imagePath){
                            fs.unlinkSync('./public' + imagePath)
                        }
                        return res.status(500).send(err)
                    }
                    let sql = `select * from product`
                    db.query(sql, (err, dataproduct)=>{
                        if (err) return res.status(500).send(err)
                        return res.status(200).send(dataproduct)
                    })
                })
            })
        }catch (error){
            return res.status(500).send(error)
        }
    },
    getProduct: (req, res)=>{
        let sql = `select * from product`
        db.query(sql, (err, dataproduct)=>{
            if (err) return res.status(500).send(err)
            return res.status(200).send(dataproduct)
        })
    },
    addProductFoto: (req, res) => {
        try {
            const path = '/product/foto' //nama folder nya nanti
            const upload = uploader(path, 'FOTOPROD').fields([{name: 'image'}])
            // 'TES' nanti nama depan file nya, boleh diganti
            upload(req, res, (err)=>{
                if (err){
                    return res.status(500).json({message: 'Upload picture failed', error: err.message})
                }
                console.log('berhasil upload')
                const {image} = req.files
                console.log(image)
                const datamany = []
                const data = JSON.parse(req.body.data)
                console.log(data, 'data')
                let imagePath
                image.forEach(val=>{
                    imagePath = path + '/' + val.filename
                    datamany.push([imagePath, data.product_id])
                })

                // const imagePath = image ? path + '/' + image[0].filename : null
                console.log(datamany)
                db.query(`insert into productfoto (gambar, product_id) VALUES ?`, [datamany], (err)=>{
                    if(err){
                        image.forEach(val=>{
                            if(image.length){
                                imagePath = path + '/' + val.filename
                                fs.unlinkSync('./public' + imagePath)
                            }
                        })
                        return res.status(500).send(err)
                    }
                    return res.status(200).send('success')
                })
            })
        }catch (error){
            return res.status(500).send(error)
        }
    },
    getProductDetails: (req, res) => {
        const {id} = req.params
        let sql = `select * from product where id=${db.escape(id)}`
        db.query(sql, (err, dataprod)=>{
            if(err) return res.status(500).send(err.message)
            sql = `select * from productfoto where product_id=${db.escape(id)}`
            db.query(sql, (err, datafoto)=>{
                if(err) return res.status(500).send(err.message)
                return res.status(200).send({dataprod:dataprod[0], datafoto})
            })
        })
    }
}
