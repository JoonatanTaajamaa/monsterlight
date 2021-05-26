class Monster {
    constructor(health, moves, imagePath) {
        this.startHealth = health;
        this.health = this.startHealth;
        this.moves = moves;
        this.imagePath = imagePath;
    }

    decreaseHealth(health) {
        if (health > 0) {
            this.health -= health;

            if (this.health < 0) {
                this.health = 0;
            }
        }
    }

    getHealth() {
        return this.health;
    }

    setHealth(health) {
        this.health = health;
    }

    getDamage() {
        return this.damage;
    }

    setDamage(damage) {
        this.damage = damage;
    }

    getStartHealth() {
        return this.startHealth;
    }

    getMoves() {
        return this.moves;
    }
}

module.exports = Monster;