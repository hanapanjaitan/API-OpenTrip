const {db} = require('./../connections')
const {encrypt, transporter} = require('./../helpers')
const {createJWToken} = require('./../helpers/jwt')
const fs = require('fs')
const handlebars = require('handlebars')
// const { resolve } = require('path')

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

module.exports={
    register: (req, res)=>{
        const {username, email, password} = req.body
        let sql = `select * from users where username = ?`
        db.query(sql, [username],(err, users)=>{
            if(err) return res.status(500).send({message: 'server error'})
            if(users.length){
                return res.status(500).send({message: 'username sudah ada'})
            }else{
                let hashpassword = encrypt(password)
                var data  = {username, email, password:hashpassword}
                sql = `insert into users set ?`
                db.query(sql, data, (err, results)=>{
                    if(err) return res.status(500).send({message: 'server error'})

                    console.log('berhasil post data users')
                    sql = `select * from users where id = ?`
                    db.query(sql, [results.insertId], (err, userslogin)=>{
                        if(err) return res.status(500).send({message: 'server error'})

                        const token = createJWToken({id:userslogin[0].id, username: userslogin[0].username})
                        const link = `http://localhost:3000/verified?token=${token}`
                        const htmlRender = fs.readFileSync('./template/email.html', 'utf8')
                        const template = handlebars.compile(htmlRender) // return function
                        const htmlEmail = template({name: userslogin[0].username, link})
                        transporter.sendMail({
                            from : 'OpenTrip <hannah4669@gmail.com>',
                            to: email,
                            subject: 'beb confirm dong',
                            html:htmlEmail
                        }).then(()=>{
                            userslogin[0].token = token
                            return res.send(userslogin[0])
                        }).catch((err)=>{
                            return res.status(500).send({message: err.message})
                        })
                    })
                        
                    
                })
            }
        })
    },
    Login: (req,res)=>{
        const {username, password} = req.body
        let hashpassword = encrypt(password)
        let sql = `select * from users where username = ? and password = ?`
        db.query(sql, [username, hashpassword], (err, datausers)=>{
            if(err) return res.status(500).send({message: err.message})
            if(!datausers.length) return res.status(500).send({message: 'user tidak terdaftar'})
            sql = `select td.qty, p.namaproduct, p.banner, p.harga, p.id as idprod, t.id as idtrans
            from transactionsdetail td
            join transactions t on td.transactions_id = t.id
            join product p on td.product_id = p.id
            where status = 'onCart' and t.users_id=? and td.isdeleted=0;`

            db.query(sql,[datausers[0].id], (err,cart)=>{
                if(err) return res.status(500).send({message: err.message})
                const token = createJWToken({id:datausers[0].id, username:datausers[0].username})
                datausers[0].token = token
                // datausers[0].cart = cart
                return res.send({datauser: datausers[0], cart})
            })

        })
    },

    keepLogin: async (req, res) => { // kalau pake cara #2, async nya apus
        // cara#1
        const {id} = req.params
        let sql = `select * from users where id = ${db.escape(id)}`

        try{
            const results = await dbPromiseSelect(sql)
            sql = `select td.qty, p.namaproduct, p.banner, p.harga, p.id as idprod, t.id as idtrans
            from transactionsdetail td
            join transactions t on td.transactions_id = t.id
            join product p on td.product_id = p.id
            where status = 'onCart' and t.users_id=${db.escape(results[0].id)} and td.isdeleted=0;`
            const cart = await dbPromiseSelect(sql)
            const token = createJWToken({id:results[0].id, username:results[0].username})
            results[0].token = token
            return res.send({datauser: results[0], cart})

        }catch(error){
            return res.status(500).send({message: error.message})
        }
    
    // cara #2
    //     dbPromiseSelect(sql)
    //     .then((result)=>{
    //         res.send(result)
    //     }).catch((err)=>{
    //         return res.status(500).send({message: err.message})
    //     })
    }
}
