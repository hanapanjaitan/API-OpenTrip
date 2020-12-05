const {db} = require('./../connections')
const {uploader} = require('./../helpers/uploader')
const{transporter} = require('../helpers')
const fs = require('fs')
const handlebars = require('handlebars')


const dbPromiseSelect = (sql) => {
    return new Promise((resolve, reject)=>{
        db.query(sql, (err, results)=>{
            if(err){
                reject (err)
            }else{
                resolve(results)
            }
        })
    })
}

module.exports = {
    addToCart: (req, res)=>{
        const {userid, productid, qty} =req.body
        let sql = `select * from transactions where status = 'oncart' and users_id=${db.escape(userid)}`
        db.query(sql, (err, results)=>{
            if (err) res.status(500).send(err.message)

            if(results.length){
                console.log('ttttt')
                sql = `select * from transactionsdetail where product_id=${db.escape(productid)} and
                transactions_id=${db.escape(results[0].id)} and isdeleted = 0`
                db.query(sql, (err, results1)=>{
                    if (err) {
                        return res.status(500).send(err)
                    }
                    console.log('sdsd')
                    if(results1.length){ //kalau results1.length true maka updet qty
                        let dataupdate = {
                            qty: parseInt(results1[0].qty) + parseInt(qty)
                        }
                        console.log(results1[0])
                        console.log(qty)
                        sql = `update transactionsdetail set ? where product_id=${db.escape(results1[0].product_id)} and transactions_id=${db.escape(results1[0].transactions_id)}`
                        console.log(sql)
                        db.query(sql, dataupdate, (err)=>{
                            if (err) {
                                return res.status(500).send(err)
                            }
                            
                            sql = `select td.qty, p.namaproduct, p.banner, p.harga, p.id as idprod, t.id as idtrans from transactionsdetail td
                            join transactions t on td.transactions_id = t.id
                            join product p on td.product_id = p.id
                            where status = 'oncart' and t.users_id=? and td.isdeleted=0;`
                            db.query(sql, [userid], (err, datacart)=>{
                                if (err) return res.status(500).send(err)
                                console.log('masuk final')
                                // console.log(datacart)
                                return res.send(datacart)
                            })
                        })
                    }else{ // kalau product di cart belom ada
                        let datainsert = {
                            product_id: productid,
                            transactions_id: results[0].id,
                            qty: qty
                        }
                        sql= `insert into transactionsdetail set ?`
                        db.query(sql, datainsert, (err)=>{
                            if (err) return res.status(500).send(err)
                            sql = `select td.qty, p.namaproduct, p.banner, p.harga, p.id as idprod, t.id as idtrans from transactionsdetail td
                            join transactions t on td.transactions_id = t.id
                            join product p on td.product_id = p.id
                            where status = 'onCart' and t.users_id=? and td.isdeleted=0;`
                            db.query(sql, [userid], (err, datacart)=>{
                                if (err) return res.status(500).send(err)

                                return res.send(datacart)
                            })
                        })
                    }
                })
            }else{
                // kalau cart bener2 kosong
                console.log('asa')
                let data = {
                    tanggal: new Date(),
                    status: 'oncart',
                    users_id: userid
                }
                db.beginTransaction((err)=>{
                    if (err) {
                        return res.status(500).send(err)
                    }
                    console.log('sdsd')
                    sql = `insert into transactions set ?`
                    db.query(sql, data, (err, results1)=>{
                        if (err) {
                            console.log(err)
                            return db.rollback(()=>{
                                res.status(500).send(err)
                            })
                        }
                        console.log('tgtg')
                        data = {
                            product_id: productid,
                            transactions_id: results1.insertId,
                            qty
                        }
                        sql = `insert into transactionsdetail set ?`
                        db.query(sql, data, (err)=>{
                            if (err) {
                                return db.rollback(()=>{
                                    res.status(500).send(err)
                                })
                            }
                            db.commit((err)=>{
                                if (err) {
                                    return db.rollback(()=>{
                                        res.status(500).send(err)
                                    })
                                }
                                sql = `select td.qty, p.namaproduct, p.banner, p.harga, p.id as idprod, t.id as idtrans from transactionsdetail td
                                join transactions t on td.transactions_id = t.id
                                join product p on td.product_id = p.id
                                where status = 'onCart' and t.users_id=? and td.isdeleted=0;`
                                db.query(sql, [userid], (err, datacart)=>{
                                    if (err) return res.status(500).send(err)

                                    return res.send(datacart)
                                })
                            })
                        })

                    })
                })
            }
            
        })
    },
    getCart: (req, res)=>{
        const {userid} = req.query
        sql = `select td.qty, p.namaproduct, p.banner, p.harga, p.id as idprod, t.id as idtrans from transactionsdetail td
        join transactions t on td.transactions_id = t.id
        join product p on td.product_id = p.id
        where status = 'onCart' and t.users_id=? and td.isdeleted=0;`
        db.query(sql, [userid], (err, datacart)=>{
            if(err){
                console.log(err)
                return res.status(500).send(err)
            }
            return res.send(datacart)
        })
    },

    onbayarCC: (req, res)=>{
        const {idtrans, nomercc, datacart} = req.body
        let sql = `update transactions set ? where id = ${db.escape(idtrans)}`
        let dataupdate = {
            tanggal: new Date(),
            status: 'completed',
            metode: 'cc',
            buktipembayaran: nomercc
        }
        db.query(sql, dataupdate, (err, result)=>{
            if(err){
                console.log(err)
                return res.status(500).send(err)
            }

            let arr = []
            datacart.forEach(val =>{
                arr.push(dbPromiseSelect(`update transactionsdetail set hargabeli = ${val.harga} where transactions_id=${val.idtrans} and product_id=${val.idprod};`))
            })
            Promise.all(arr).then(()=>{
                return res.send('berhasil')
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send(err)
            })

            return res.send('berhasil') // nggak perlu get cart lagi karena cart kalo berhasil otomatis kosong 
        })
    },
    uploadPembayaran:(req, res)=>{
        const path = '/buktipembayaran'
        const upload = uploader (path, 'BUKTI').fields([{name: 'bukti'}])
        upload(req, res, (err)=>{
            if (err){
                return res.status(500).json({message: 'Upload picture failed', error: err.message})
            }
            // console.log('berhasil upload')
            const {bukti} = req.files
            console.log(bukti)
            const imagePath = bukti ? path + '/' + bukti[0].filename : null
            console.log(imagePath)
            console.log(req.body.data)
            const data = JSON.parse(req.body.data)
            let sql = `update transactions set ? where id = ${db.escape(data.idtrans)}`
            let dataupdate = {
                tanggal: new Date(),
                status: 'OnwaitingApprove',
                metode: 'bukti',
                buktipembayaran: imagePath
            }
            db.query(sql, dataupdate, (err)=>{
                if(err){
                    if(imagePath){
                        fs.unlinkSync('./public' + imagePath)
                    }
                    return res.status(500).send(err)
                }
                return res.send('berhasil')
            })
        })
    },
    getAdminConfApprove: (req, res)=>{
        let sql = `select * from transactions where status='onwaitingApprove';`
        db.query(sql, (err, waitingApprove)=>{
            if(err){
                console.log(err)
                return res.status(500).send(err)
            }
            return res.send(waitingApprove)
        })
    },
    adminApprove: (req, res)=>{
        const {id} = req.params
        let sql = `update transactions set ? where id=${db.escape(id)};`
        let dataupdate = {
            status: 'completed'
        }
        db.query(sql, dataupdate, (err)=>{
            if(err){
                console.log(err)
                return res.status(500).send(err)
            }
            sql = `select * from transactions where id=${db.escape(id)}`
            db.query(sql, (err, datatrans)=>{
                if(err){
                    console.log(err)
                    return res.status(500).send(err)
                }
               
                sql = `select * from users where id = ${db.escape(datatrans[0].users_id)}`
                db.query(sql, (err, datausers)=>{
                    if(err){
                        console.log(err)
                        return res.status(500).send(err)
                    }
                })
                const htmlRender = fs.readFileSync('./template/notif.html', 'utf8')
                const template = handlebars.compile(htmlRender) // return function
                const htmlEmail = template({message: 'Your stupid and ugly payment has been approved'})
                transporter.sendMail({
                    from : 'OpenTrip <hannah4669@gmail.com>',
                    to: datausers[0].email,
                    subject: 'Payment',
                    html:htmlEmail
                }, (err)=>{
                    if(err){
                        console.log(err)
                        return res.status(500).send(err)
                    }
                    this.getAdminConfApprove(req, res)
                })
            })
            
            // let sql = `select * from transactions where status='onwaitingApprove';`
            // db.query(sql, (err, waitingApprove)=>{
            //     if(err){
            //         console.log(err)
            //         return res.status(500).send(err)
            //     }
            //     return res.send(waitingApprove)
            // })
        })
    },
    adminReject: (req, res)=>{
        const {id} = req.params
        let sql = `update transactions set ? where id=${db.escape(id)};`
        let dataupdate = {
            status: 'rejected'
        }
        db.query(sql, dataupdate, (err)=>{
            if(err){
                console.log(err)
                return res.status(500).send(err)
            }
            this.getAdminConfApprove(req, res)
        })
    }
}