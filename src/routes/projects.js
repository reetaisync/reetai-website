const express = require('express');
const router = express.Router();

const db = require('../db');

router.get('/', (req,res)=>{
    const builder = req.query.builder;
    
    db.all(
        'SELECT * FROM projects WHERE builder=?',
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

    const {builder,name,budget} = req.body;

    db.get(
        `SELECT id
         FROM projects
         WHERE builder=? AND name=?`,
        [builder,name],
        (err,row)=>{

            if(err){
                return res.status(500).json(err);
            }

            if(row){
                return res.status(400).json({
                    error:'Project already exists'
                });
            }

            db.run(
                `INSERT INTO projects
                (builder,name,budget,status)
                VALUES(?,?,?,?)`,
                [builder,name,budget,'Active'],
                function(err){

                    if(err){
                        return res.status(500).json(err);
                    }

                    res.json({
                        id:this.lastID
                    });

                }
            );

        }
    );

});

router.delete('/:id',(req,res)=>{

    const id = req.params.id;

    db.run(
        'DELETE FROM projects WHERE id=?',
        [id],
        function(err){

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                success:true,
                deleted:this.changes
            });

        }
    );

});

module.exports = router;