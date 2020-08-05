const express = require('express')
const sqlite3 = require('sqlite3')
const issuesRouter = express.Router({mergeParams: true})

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

issuesRouter.param('issueId', (req, res, next, issueId) => {
    const sql = 'SELECT * FROM Issue WHERE Issue.id = $issueId'
    const values = {$issueId: issueId}
    db.get(sql, values, (err,issue) => {
        if (err) {
            next(err) 
        } else if (issue) {
            //req.issue = issue
            next()
        } else {
            res.sendStatus(404)
        }
    })
})

issuesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Issue WHERE Issue.series_id = $seriesId', {$seriesId: req.params.seriesId}, (err, issues) => {
        if (err) {
            next(err)
        } else {
            res.status(200).json({issues})
        }
    })
})

issuesRouter.post('/', (req, res, next) => {       
    const issuesToCreate = req.body.issue
    const name = issuesToCreate.name
    const issueNumber = issuesToCreate.issueNumber
    const publicationDate = issuesToCreate.publicationDate
    const artistId = issuesToCreate.artistId
    const artistSql = 'SELECT * FROM Artist WHERE Artist.id = $artistId'
    const artistValues = {$artistId: artistId}
    db.get(artistSql, artistValues, (err, artist) => {
        if (err) {
            next(err)
        } else {
            if(!name || !issueNumber || !publicationDate || !artist) {
                return res.sendStatus(400)
            }

            const sql = 'INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)'
            const values = {$name: name, $issueNumber: issueNumber, $publicationDate: publicationDate, $artistId: artistId, $seriesId: req.params.seriesId}
                
            db.run(sql, values, function (err) {
                if(err) {
                    next(err)
                } else {
                    db.get(`SELECT * FROM Issue WHERE Issue.id = ${this.lastID}`, (err, issue) => {
                        res.status(201).json({issue});
                    })
                }
            })
        }
    })

    
})



issuesRouter.put('/:issueId', (req, res, next) => {
    const issuesToCreate = req.body.issue
    const name = issuesToCreate.name
    const issueNumber = issuesToCreate.issueNumber
    const publicationDate = issuesToCreate.publicationDate
    const artistId = issuesToCreate.artistId
    const artistSql = 'SELECT * FROM Artist WHERE Artist.id = $artistId'
    const artistValues = {$artistId: artistId}
    db.get(artistSql, artistValues, (err, artist) => {
        if (err) {
            next(err)
        } else {
            if(!name || !issueNumber || !publicationDate || !artist) {
                return res.sendStatus(400)
            }
            const sql = 'UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId WHERE Issue.id = $issueId'
            const values = {$name: name, $issueNumber: issueNumber, $publicationDate: publicationDate, $artistId: artistId, $issueId: req.params.issueId}
            db.run(sql, values, function (err) {
                if (err) {
                    next(err)
                } else {
                    db.get(`SELECT * FROM Issue WHERE Issue.id = ${req.params.issueId}`, (err, issue) => {
                        res.status(200).json({issue})
                    })
                }
            })
        }
    })

    
})

issuesRouter.delete('/:issueId', (req, res, next) => {
    db.run(`DELETE FROM Issue WHERE Issue.id = ${req.params.issueId}`, (err) => {
        if (err) {
            next(err)
        } else {
            res.sendStatus(204)
        }
    })
})

module.exports = issuesRouter