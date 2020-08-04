const express = require('express');
const sqlite3 = require('sqlite3')
const artistsRouter = express.Router()

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

artistsRouter.param('artistId', (req, res, next, artistId) => {
    const sql = 'SELECT * FROM Artist WHERE id = $artistId' 
    const values = {$artistId: artistId}
    db.get(sql, values, (err, artist) => {
        if (err) {
            next(err)
        } else if (artist) {
            req.artist = artist
            next()
        } else {
            res.sendStatus(404) 
        }
    })
})

artistsRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE is_currently_employed = 1', 
    (err, artists) => {
        if (err) {
            next(err)
        } else {
            res.status(200).json({artists})
        }
    })
})

artistsRouter.get('/:artistId', (req, res, next) => {
    res.status(200).json({artist: req.artist})
})

const validateArtist = (req, res, next) => {
    const artistToCreate = req.body.artist
    const name = artistToCreate.name
    const dateOfBirth = artistToCreate.dateOfBirth
    const biography = artistToCreate.biography
    const isCurrentlyEmployed = artistToCreate.is_currently_employed === 0 ? 0 : 1
    if (!name || !dateOfBirth || !biography) {
        return res.sendStatus(400)
    } 
    next() 
}
artistsRouter.post('/', validateArtist, (req, res, next) => {       
    const artistToCreate = req.body.artist
    const name = artistToCreate.name
    const dateOfBirth = artistToCreate.dateOfBirth
    const biography = artistToCreate.biography
    const isCurrentlyEmployed = artistToCreate.is_currently_employed === 0 ? 0 : 1
    const sql = 'INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)'
    const values = {$name: name, $dateOfBirth: dateOfBirth, $biography: biography, $isCurrentlyEmployed: isCurrentlyEmployed}
        
    db.run(sql, values, function (err) {
        if(err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, (err, artist) => {
                res.status(201).json({artist});
            })
        }
    })
})

artistsRouter.put('/:artistId', validateArtist, (req, res, next) => {
    const artistToCreate = req.body.artist
    const name = artistToCreate.name
    const dateOfBirth = artistToCreate.dateOfBirth
    const biography = artistToCreate.biography
    const isCurrentlyEmployed = artistToCreate.is_currently_employed === 0 ? 0 : 1
    const sql = 'UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE id = $artistId'
    const values = {$name: name, $dateOfBirth: dateOfBirth, $biography: biography, $isCurrentlyEmployed: isCurrentlyEmployed, $artistId: req.params.artistId} 
    db.run(sql, values, (err) => {
        if (err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`, (err, artist) => {
                res.status(200).json({artist});
            })
    }})
})

artistsRouter.delete('/:artistId', (req, res, next) => {
    db.run('UPDATE Artist SET is_currently_employed = 0 WHERE id = $artistId', 
    {$artistId: req.params.artistId},
    (err) => {
        if (err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`, (err, artist) => {
                res.status(200).json({artist});
            }
        )}
    })
})

module.exports = artistsRouter; 