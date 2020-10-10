const app = require('express').Router();
const issues = require('./issues');

app.use('/issues', issues);
module.exports = app;
