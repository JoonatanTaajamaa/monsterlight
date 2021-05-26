const uuid = require('uuid');

const Monster = require('../lib/gameHandeling/monster');
const Move = require('../lib/gameHandeling/move');

const monsters = require('../lib/monsters');

const games = new Map();
const pendingUsers = [];

const listenSockets = (io, socket) => {
    const sessionSocketID = socket.id;

    socket.on('start', (details) => {
        try {
            if (pendingUsers.length > 0) {
                const gameId = uuid.v4();

                const otherUser = pendingUsers[pendingUsers.length - 1];
                pendingUsers.pop();

                const userMonsterMoves = [];
                const otherUserMonsterMoves = [];

                monsters[details.monsterName]
                    .moves
                    .forEach(move => {
                        const moveObject = new Move(move.name, move.damage, move.timeout);

                        userMonsterMoves.push(moveObject);
                    });

                monsters[otherUser.monsterName]
                    .moves
                    .forEach(move => {
                        const moveObject = new Move(move.name, move.damage, move.timeout);

                        otherUserMonsterMoves.push(moveObject);
                    });

                const userMonster = new Monster(monsters[details.monsterName].health,
                    userMonsterMoves,
                    monsters[details.monsterName].imagePath);

                const otherUserMonster = new Monster(monsters[otherUser.monsterName].health,
                    otherUserMonsterMoves,
                    monsters[otherUser.monsterName].imagePath);

                games.set(gameId, {
                    [otherUser.socketID]: {
                        monster: otherUserMonster,
                        otherMonster: userMonster,
                        lastHit: Date.now()
                    },
                    [sessionSocketID]: {
                        monster: userMonster,
                        otherMonster: otherUserMonster,
                        lastHit: Date.now()
                    }
                });

                const newGame = games.get(gameId);

                const userImages = {
                    monster: monsters[details.monsterName].imagePath,
                    otherMonster: monsters[otherUser.monsterName].imagePath,
                    star: '/public/images/star.png'
                };

                const otherUserImages = {
                    monster: monsters[otherUser.monsterName].imagePath,
                    otherMonster: monsters[details.monsterName].imagePath,
                    star: '/public/images/star.png'
                };

                socket.emit('started', {
                    game: newGame[sessionSocketID],
                    gameId: gameId,
                    imagePaths: userImages
                });

                io.to(otherUser.socketID).emit('started', {
                    game: newGame[otherUser.socketID],
                    gameId: gameId,
                    imagePaths: otherUserImages
                });
            } else {
                if (monsters[details.monsterName]) {
                    const userDetails = {
                        socketID: sessionSocketID,
                        monsterName: details.monsterName
                    };
    
                    pendingUsers.push(userDetails);
                    socket.emit('wait');
                }
            }
        } catch (error) {
            console.log('Error:', error);
        }
    });

    socket.on('hit', (details) => {
        try {
            const { gameID, index } = details;

            if (games.has(gameID) && games.get(gameID)[sessionSocketID]) {
                let isHittingAllowed = games.get(gameID)[sessionSocketID]
                    .monster
                    .getMoves()[index]
                    .isAllowed();

                if (isHittingAllowed) {
                    const gameSocketIDs = Object.keys(games.get(gameID));

                    const userGameDetails = games.get(gameID)[sessionSocketID];
                    const damage = userGameDetails
                        .monster
                        .getMoves()[index]
                        .getDamage();

                    games
                        .get(gameID)[sessionSocketID]
                        .monster
                        .getMoves()[index]
                        .setAllowed(false);

                    games.get(gameID)[sessionSocketID].lastHit = Date.now();

                    let otherSocketId;

                    for (let id of gameSocketIDs) {
                        if (sessionSocketID != id) {
                            otherSocketId = id;
                        }
                    }

                    games.get(gameID)[otherSocketId]
                        .monster
                        .decreaseHealth(damage);

                    const moveTimeout = userGameDetails
                        .monster
                        .getMoves()[index]
                        .getTimeout();

                    setTimeout(() => {
                        if (games.has(gameID)) {
                            games.get(gameID)[sessionSocketID]
                                .monster
                                .getMoves()[index]
                                .setAllowed(true);
                        }
                    }, moveTimeout * 1000);
                }
            }
        } catch (error) {
            console.log('Error:', error);
        }
    });

    socket.on('disconnect', () => {
        let isDeleteActionDone = false;

        games.forEach((game, gameID, map) => {
            if (game[sessionSocketID]) {
                const socetIDs = Object.keys(game);

                for (let userSocketId of socetIDs) {
                    if (userSocketId != sessionSocketID) {
                        io.to(userSocketId).emit('win');
                        break;
                    }
                }

                games.delete(gameID);
                isDeleteActionDone = true;
            }
        });

        if (!isDeleteActionDone) {
            for (let i = 0; i < pendingUsers.length; i++) {
                if (pendingUsers[i].socketID === sessionSocketID) {
                    pendingUsers.splice(i, 1);
                }
            }
        }
    });
}

const update = (io) => {
    setInterval(() => {
        games.forEach((game, gameID, map) => {
            for (let userSocketID in game) {
                if (game[userSocketID].monster.getHealth() <= 0) {
                    const deletedGame = game;
                    games.delete(gameID);

                    let socketIDs = Object.keys(game);
                    if (deletedGame[socketIDs[0]].monster.getHealth() <= 0 &&
                        deletedGame[socketIDs[1]].monster.getHealth() <= 0) {

                        const userALastHitTime = deletedGame[socketIDs[0]].lastHit;
                        const userBLastHitTime = deletedGame[socketIDs[1]].lastHit;

                        if (userALastHitTime > userBLastHitTime) {
                            io.to(socketIDs[0]).emit('lose');
                            io.to(socketIDs[1]).emit('win');
                        } else {
                            io.to(socketIDs[1]).emit('lose');
                            io.to(socketIDs[0]).emit('win');
                        }
                    } else {
                        io.to(userSocketID).emit('lose');

                        for (let otherSocketId in deletedGame) {
                            if (otherSocketId != userSocketID) {
                                io.to(otherSocketId).emit('win');
                                break;
                            }
                        }
                    }

                    games.delete(gameID);
                    break;
                }

                io.to(userSocketID).emit('update', game[userSocketID]);
            }
        });
    }, 40);
}

module.exports = {
    listenSockets,
    update
};