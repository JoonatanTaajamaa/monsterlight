const express = require('express');
const router = express.Router();

const gameController = require('../controller/gameController');

router.get('/', gameController.homePage);
router.post('/game', gameController.createGame);

module.exports = router;