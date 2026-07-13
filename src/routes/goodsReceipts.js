const express = require('express');
const router = express.Router();

const db = require('../db');

router.get('/', (req,res)=>{
const builder = req.query.builder;
    db.all(
         'SELECT * FROM goods_receipts WHERE builder=?',
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
        po_id,
        quantity_received,
        remarks
    } = req.body;

    // STEP 1 - Find Purchase Order
    db.get(
        `
        SELECT *
        FROM purchase_orders
        WHERE id=?
        `,
        [po_id],
        (err,row)=>{

            if(err){
                return res.status(500).json({
                    error: err.message
                });
            }

            // STEP 2 - PO must exist
            if(!row){
                return res.status(404).json({
                    error:'Purchase Order not found'
                });
            }

            // STEP 3 - Same builder
            if(row.builder !== builder){
                return res.status(403).json({
                    error:'Invalid Builder'
                });
            }

            // STEP 4 - PO must be Open
            if(row.status !== 'Open'){
                return res.status(400).json({
                    error:'Purchase Order is not Open'
                });
            }

            // STEP 5 - Create GRN
            db.run(
                `
                INSERT INTO goods_receipts
                (
                    builder,
                    po_id,
                    quantity_received,
                    remarks,
                    status
                )
                VALUES(?,?,?,?,?)
                `,
                [
                    builder,
                    po_id,
                    quantity_received,
                    remarks,
                    'Received'
                ],
                function(err){

                    if(err){
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    res.json({
                        id:this.lastID,
                        status:'Received'
                    });

                }
            );

        }
    );

});

module.exports = router;