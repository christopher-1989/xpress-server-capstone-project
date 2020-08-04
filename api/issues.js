const express = require('express')
const sqlite3 = require('sqlite3')
const issuesRouter = express.Router({mergeParams: true})

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')


module.exports = issuesRouter