const express = require('express');
const router = express.Router();

const db = require('../db');

router.get('/', (req,res)=>{

    const builder = req.query.builder;

    db.all(
        `SELECT *
         FROM vendors
         WHERE builder=?`,
        [builder],
        (err,rows)=>{
            if(err){
                return res.status(500).json(err);
            }
            res.json(rows);
        }
    );
});

router.post('/', (req,res)=>{

 const {
   builder, 
   name,
   phone,
   email,
   gst,
   address
 } = req.body;

 db.run(
 `
 INSERT INTO vendors
 (builder,name,phone,email,gst,address,status)
 VALUES(?,?,?,?,?,?,?)
 `,
 [
   builder,
   name,
   phone,
   email,
   gst,
   address,
   'Active'
 ],
 function(err){

   if(err){
    console.log(err);
    return res.status(500).json({
        error: err.message
    });
   }

   res.json({
      id:this.lastID
   });

 });

});
module.exports = router;