const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req,res)=>{
    const builder = req.query.builder;

    db.all(
        'SELECT * FROM purchase_orders WHERE builder=?',
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
        pr_id,
        vendor_id
    } = req.body;

    const poNumber = `PO-${Date.now()}`;

    db.get(
        `SELECT * FROM purchase_requests WHERE id=?`,
        [pr_id],
        (err,row)=>{
         
            if(err){
                return res.status(500).json({
                    error: err.message
                });
            }

            if (!row) {
                return res.status(404).json({
                    error: 'Purchase Request not found'
                });
            }

            if (row.builder !== builder) {
                return res.status(403).json({
                    error: 'Invalid Builder'
                });
            }

            if (row.status !== 'Approved') {
                return res.status(400).json({
                    error: 'Purchase Request must be Approved'
                });
            }


             // SECOND QUERY STARTS HERE
        db.get(
            `SELECT id
             FROM purchase_orders
             WHERE builder=? AND pr_id=?`,
            [builder,pr_id],
            (err,existingPO)=>{

                if(err){
                    return res.status(500).json({
                        error: err.message
                    });
                }

                if(existingPO){
                    return res.status(400).json({
                        error:'Purchase Order already exists for this Purchase Request'
                    });
                }


              // INSERT STARTS HERE
                db.run(
                `
                INSERT INTO purchase_orders
                (
                    builder,
                    pr_id,
                    vendor_id,
                    po_number,
                    amount,
                    status
                )
                VALUES(?,?,?,?,?,?)
                `,
                [
                    builder,
                    pr_id,
                    vendor_id,
                    poNumber,
                    row.amount,
                    'Open'
                ],
                function(err){

                    if(err){
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    res.json({
                        id:this.lastID,
                        po_number:poNumber,
                        status:'Open'
                    });

                });

            }
        );
    }
    );
    

});

module.exports = router;