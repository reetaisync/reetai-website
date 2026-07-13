const express = require('express');
const router = express.Router();

const db = require('../db');

router.get('/', (req,res)=>{
    const builder = req.query.builder;
    db.all(
        'SELECT * FROM invoices WHERE builder=?',
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
        po_id
    } = req.body;

    const invoiceNumber = `INV-${Date.now()}`;

    // STEP 1 - Find Purchase Order
    db.get(
        `
        SELECT *
        FROM purchase_orders
        WHERE builder=? AND id=?
        `,
        [builder,po_id],
        (err,po)=>{

            if(err){
                return res.status(500).json({
                    error: err.message
                });
            }

            // STEP 2 - PO must exist
            if(!po){
                return res.status(404).json({
                    error:'Purchase Order not found'
                });
            }

            // STEP 4 - Check if at least one GRN exists
            db.get(
                `
                SELECT id
                FROM goods_receipts
                WHERE builder=? AND po_id=?
                `,
                [builder,po_id],
                (err,grn)=>{

                    if(err){
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    if(!grn){
                        return res.status(400).json({
                            error:'Cannot create Invoice before Goods Receipt'
                        });
                    }

                    // STEP 5 - Check if Invoice already exists
                    db.get(
                        `
                        SELECT id
                        FROM invoices
                        WHERE builder=? AND po_id=?
                        `,
                        [builder, po_id],
                        (err, existingInvoice)=>{

                            if(err){
                                return res.status(500).json({
                                    error: err.message
                                });
                            }

                            if(existingInvoice){
                                return res.status(400).json({
                                    error:'Invoice already exists for this Purchase Order'
                                });
                            }

                            // STEP 6 - Create Invoice
                            db.run(
                                `
                                INSERT INTO invoices
                                (
                                    builder,
                                    po_id,
                                    invoice_number,
                                    amount,
                                    status
                                )
                                VALUES(?,?,?,?,?)
                                `,
                                [
                                    builder,
                                    po_id,
                                    invoiceNumber,
                                    po.amount,
                                    'Pending'
                                ],
                                function(err){

                                    if(err){
                                        return res.status(500).json({
                                            error: err.message
                                        });
                                    }

                                    res.json({
                                        id: this.lastID,
                                        invoice_number: invoiceNumber,
                                        status: 'Pending'
                                    });

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});

module.exports = router;