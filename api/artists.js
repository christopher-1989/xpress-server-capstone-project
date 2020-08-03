const express = require('express');
const sqlite3 = require('sqlite3')
const artistsRouter = express.Router()

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')
artistsRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artists WHERE is_currently_employed = 1', 
    (err, artists) => {
        if (err) {
            next(err)
        } else {
            res.status(200).json({artists})
        }
    })
})


module.exports = artistsRouter; 