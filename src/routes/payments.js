const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req,res)=>{

    const builder = req.query.builder;
    db.all(
        'SELECT * FROM payments WHERE builder=?',
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
        invoice_id
    } = req.body;

    const paymentRef = `PAY-${Date.now()}`;

    // STEP 1 - Find Invoice
    db.get(
        `
        SELECT *
        FROM invoices
        WHERE builder=? AND id=?
        `,
        [builder, invoice_id],
        (err,invoice)=>{

            if(err){
                return res.status(500).json({
                    error: err.message
                });
            }

            // STEP 2 - Invoice must exist
            if(!invoice){
                return res.status(404).json({
                    error:'Invoice not found'
                });
            }

            // STEP 3 - Invoice must be Pending
            if(invoice.status !== 'Pending'){
                return res.status(400).json({
                    error:'Invoice is already paid'
                });
            }

            // STEP 4 - Check duplicate payment
            db.get(
                `
                SELECT id
                FROM payments
                WHERE builder=? AND invoice_id=?
                `,
                [builder, invoice_id],
                (err,existingPayment)=>{

                    if(err){
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    if(existingPayment){
                        return res.status(400).json({
                            error:'Payment already exists for this Invoice'
                        });
                    }

                    // STEP 5 - Create Payment
                    db.run(
                        `
                        INSERT INTO payments
                        (
                            builder,
                            invoice_id,
                            payment_reference,
                            amount,
                            payment_date,
                            status
                        )
                        VALUES(?,?,?,?,?,?)
                        `,
                        [
                            builder,
                            invoice_id,
                            paymentRef,
                            invoice.amount,
                            new Date().toISOString(),
                            'Paid'
                        ],
                        function(err){

                            if(err){
                                return res.status(500).json({
                                    error: err.message
                                });
                            }

                            // STEP 6 - Mark Invoice as Paid
                            db.run(
                                `
                                UPDATE invoices
                                SET status='Paid'
                                WHERE id=?
                                `,
                                [invoice_id],
                                function(err){
                                    if(err){
                                        console.log(err);
                                    }
                                }
                            );

                            // STEP 7 - Close Purchase Order
                            db.run(
                                `
                                UPDATE purchase_orders
                                SET status='Closed'
                                WHERE id=?
                                `,
                                [invoice.po_id],
                                function(err){
                                    if(err){
                                        console.log(err);
                                    }
                                }
                            );

                            res.json({
                                id:this.lastID,
                                payment_reference:paymentRef,
                                status:'Paid'
                            });

                        }
                    );

                }
            );

        }
    );

});

module.exports = router;