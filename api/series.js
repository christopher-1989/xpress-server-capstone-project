const express = require('express')
const sqlite3 = require('sqlite3')
const seriesRouter = express.Router()
const issuesRouter = require('./issues.js')


const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    const sql = 'SELECT * FROM Series WHERE id = $seriesId'
    const values = {$seriesId: seriesId}
    db.get(sql, values, (err, series) => {
        if (err) {
            next(err)
        } else if (series) {
            req.series = series
            next()
        } else {
            res.sendStatus(404)
        }
    })
})

seriesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Series', (err, series) => {
        if (err) {
            next(err)
        } else {
            res.status(200).json({series})
        }
    })
})

seriesRouter.get('/:seriesId', (req, res, next) => {
    res.status(200).json({series: req.series})
})

const validateSeries = (req, res, next) => {
    if (!req.body.series.name || !req.body.series.description) {
        return res.sendStatus(400)
    }
    next()
}

seriesRouter.post('/', validateSeries, (req, res, next) => {       
    const seriesToCreate = req.body.series
    const name = seriesToCreate.name
    const description = seriesToCreate.description
    const sql = 'INSERT INTO Series (name, description) VALUES ($name, $description)'
    const values = {$name: name, $description: description}
        
    db.run(sql, values, function (err) {
        if(err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, (err, series) => {
                res.status(201).json({series});
            })
        }
    })
})

seriesRouter.put('/:seriesId', validateSeries, (req, res, next) => {
    const seriesToCreate = req.body.series
    const name = seriesToCreate.name
    const description = seriesToCreate.description
    const sql = 'UPDATE Series SET name = $name, description = $description'
    const values = {$name: name, $description: description}
    db.run(sql, values, (err) => {
        if (err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Series WHERE Series.id = ${req.params.seriesId}`, (err, series) => {
                res.status(200).json({series})
            })
        }
    })
})

seriesRouter.use('/:seriesId/issues', issuesRouter)

seriesRouter.delete('/:seriesId', (req, res, next) => {    
    const issueSql = 'SELECT * FROM Issue where Issue.series_id = $seriesId'
    const issuesValues = {$seriesId: req.params.seriesId}
    db.get(issueSql, issuesValues, (err, issues) => {
        if (err) {
            next(err)
        } else if (issues) {
            res.sendStatus(400)
        } else {
            db.run(`DELETE FROM Series WHERE Series.id = ${req.params.seriesId}`, (err) => {
                if (err) {
                    next(err)
                } else {
                    res.sendStatus(204)
                }
            })
        }
    })      
})

module.exports = seriesRouter