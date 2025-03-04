const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');

// Define your routes here
router.get('/example', controller.exampleFunction);
router.post('/example', controller.createExampleFunction);
// Add more routes as needed

module.exports = router;