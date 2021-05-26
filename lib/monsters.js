const monsters = {
    grodrarth: {
        imagePath: '/public/images/grodrarth.png',
        health: 100,
        moves: [
            {
                name: 'lyönti',
                damage: 15,
                timeout: 7
            },
            {
                name: 'sivallus',
                damage: 20,
                timeout: 8
            },
            {
                name: 'leikkaa',
                damage: 66,
                timeout: 19
            }
        ]
    },
    molrad: {
        imagePath: '/public/images/molrad.png',
        health: 120,
        moves: [
            {
                name: 'lyönti',
                damage: 60,
                timeout: 18
            },
            {
                name: 'sivallus',
                damage: 50,
                timeout: 12
            }
        ]
    },
    ukons: {
        imagePath: '/public/images/Ukons.png',
        health: 160,
        moves: [
            {
                name: 'lyönti',
                damage: 40,
                timeout: 14
            },
            {
                name: 'leikkaus',
                damage: 60,
                timeout: 22
            }
        ]
    }
};

module.exports = monsters;