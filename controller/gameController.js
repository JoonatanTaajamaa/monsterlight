const monsters = require('../lib/monsters');

/**
 * HTTP type is POST
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
const createGame = (req, res, next) => {
    const monsterName = req.body.monster;

    res.render('game', { monsterName: monsterName });
}

/**
 * HTTP type is GET
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
const homePage = (req, res, next) => {
    res.render('index', { monsters: monsters });
}

module.exports = {
    createGame,
    homePage
}