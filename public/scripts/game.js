(() => {
    const socket = io();

    let canvas;
    let context;
    let moveButtonsDiv;
    let messageText;
    // let otsikko;

    let gameId;

    const images = new Map();
    let loaded = false;

    const loadImage = (imagePaths) => {
        let imageCount = 0;

        for (let imageName in imagePaths) {
            const image = new Image();

            image.src = imagePaths[imageName];

            image.onload = () => {
                imageCount++;

                images.set(imageName, image);

                if (imageCount >= Object.keys(imagePaths).length) {
                    loaded = true;
                }
            }
        }
    }

    const drawMonsters = () => {
        context.drawImage(images.get('monster'), 150, 250, 100, 100);
        context.drawImage(images.get('otherMonster'), 150, 0, 100, 100);
    }

    const drawHealth = (x, y, health, startHealth, color) => {
        context.save();

        context.fillStyle = '#6e6e6e';
        context.fillRect(x, y, 100, 30);

        context.fillStyle = color;
        context.fillRect(x, y, (health / startHealth) * 100, 30)

        context.restore();
    }

    const drawHealthText = (x, y, health, startHealth, color) => {
        context.fillStyle = color;
        context.font = '20px Arial';
        context.fillText(`HP: ${health}/${startHealth}`, x, y);
    }

    const drawUpdate = (game) => {
        context.clearRect(0, 0, canvas.width, canvas.height);

        drawMonsters();

        let ownHealthColor = '#a3375a';
        let enemyHealthColor = '#a19033';

        drawHealthText(150, 370, game.monster.health, game.monster.startHealth, ownHealthColor);
        drawHealth(150, 400, game.monster.health, game.monster.startHealth, ownHealthColor);

        drawHealthText(150, 120, game.otherMonster.health, game.otherMonster.startHealth, enemyHealthColor);
        drawHealth(150, 140, game.otherMonster.health, game.otherMonster.startHealth, enemyHealthColor);
    }

    const updateButtonStatuses = (moves) => {
        for (let i = 0; i < moves.length; i++) {
            if (!moves[i].allowed) {
                moveButtonsDiv.childNodes[i].disabled = true;
            } else {
                moveButtonsDiv.childNodes[i].disabled = false;
            }
        }
    }

    const generateMoveButtons = (moves) => {
        for (let i = 0; i < moves.length; i++) {
            let button = document.createElement('button');
            let nameP = document.createElement('p');
            let damageP = document.createElement('p');

            button.classList.add('basic-button');
            button.classList.add('margin-30px-left');

            nameP.textContent = `${moves[i].name}`;
            damageP.textContent = `Vahinko: ${moves[i].damage}`;

            button.addEventListener('click', () => {
                socket.emit('hit', { gameID: gameId, index: i });
            });

            button.appendChild(nameP);
            button.appendChild(damageP);
            moveButtonsDiv.appendChild(button);
        }
    }

    const endGame = (message, isWin) => {
        let backLink = document.createElement('a');
        let button = document.createElement('button');

        backLink.href = '/';
        button.textContent = 'Takaisin';

        button.classList.add('basic-button');

        document.querySelector('body').appendChild(document.createElement('br'));
        backLink.appendChild(button);
        document.querySelector('body').appendChild(backLink);

        context.clearRect(0, 0, canvas.width, canvas.height);

        if (isWin) {
            let x = 0;
            let y = canvas.height / 2;

            for (let i = 0; i < 5; i++) {
                context.drawImage(images.get('star'), x, y, 80, 80);

                x += 80;

                if (i < 2) {
                    y -= 80;
                } else {
                    y += 80;
                }
            }

            messageText.classList.add('win-message');
        } else {
            messageText.classList.add('loose-message');
            canvas.style.display = 'none';
        }

        messageText.textContent = message;
        // otsikko.textContent = '';
        moveButtonsDiv.style.display = 'none';
    }

    const handleSockets = () => {
        socket.emit('start', {
            monsterName: monsterName
        });

        socket.on('started', (details) => {
            messageText.textContent = '';
            // otsikko.textContent = 'VS';
            loadImage(details.imagePaths);
            gameId = details.gameId;
            generateMoveButtons(details.game.monster.moves);
            socket.emit('started', { gameId: gameId });
        });

        socket.on('update', (game) => {
            if (loaded) {
                updateButtonStatuses(game.monster.moves);
                drawUpdate(game);
            }
        });

        socket.on('wait', () => {
            messageText.textContent = 'Odotetaan toista pelaajaa...';
            // otsikko.textContent = '';
        });

        socket.on('win', () => {
            endGame('Voitit', true);
        });

        socket.on('lose', () => {
            endGame('Hävisit', false);
        });
    }

    const main = () => {
        canvas = document.getElementById('canvas');
        context = canvas.getContext('2d');
        moveButtonsDiv = document.getElementById('move-buttons-div');
        messageText = document.getElementById('message-text');
        // otsikko = document.getElementById('otsikko');

        handleSockets();
    }

    document.addEventListener('DOMContentLoaded', main);
})();