const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req,res)=>{
const builder = req.query.builder;
 db.all(
   `
    SELECT *
    FROM purchase_requests
    WHERE builder=?
    `,
   [builder],
   (err,rows)=>{

      if(err){

        console.log('====================');
        console.log('PURCHASE REQUEST ERROR');
        console.log(err);
        console.log('====================');

        return res.status(500).json(err);
      }

      res.json(rows);

   }
 );

});

router.get('/available', (req,res)=>{

    const builder = req.query.builder;

    db.all(
        `
        SELECT *
        FROM purchase_requests pr
        WHERE pr.builder=?
        AND pr.status='Approved'
        AND NOT EXISTS
        (
            SELECT 1
            FROM purchase_orders po
            WHERE po.pr_id = pr.id
            AND po.builder = pr.builder
        )
        `,
        [builder],
        (err,rows)=>{

            if(err){
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);

        }
    );

});

router.post('/', (req,res)=>{

 const {
   builder, 
   project_id,
   material,
   amount
 } = req.body;

 if (!material || material.trim() === '') {
      return res.status(400).json({
          error: 'Material is required'
      });
  }

  if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
          error: 'Amount must be greater than 0'
      });
  }

 db.run(
 `INSERT INTO purchase_requests
 (builder,project_id,material,amount,status)
 VALUES(?,?,?,?,?)`,
 [
   builder, 
   project_id,
   material,
   amount,
   'Pending'
 ],
 function(err){

    if(err){

    console.log('PR ERROR');
    console.log(err);

    return res.status(500).json(err);
    }

   res.json({
      id:this.lastID
   });

 });

});

router.put('/:id/approve', (req,res)=>{

 db.run(
   `UPDATE purchase_requests
    SET status='Approved'
    WHERE id=?`,
   [req.params.id],
   function(err){

      if(err){
         return res.status(500).json(err);
      }

      res.json({
        success:true
      });

   }
 );

});

router.put('/:id/reject', (req,res)=>{

 db.run(
   `UPDATE purchase_requests
    SET status='Rejected'
    WHERE id=?`,
   [req.params.id],
   function(err){

      if(err){
         return res.status(500).json(err);
      }

      res.json({
        success:true
      });

   }
 );

});
module.exports = router;