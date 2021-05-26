class Move {
    constructor(name, damage, timeout) {
        this.name = name;
        this.damage = damage;
        this.timeout = timeout;

        this.allowed = true;
    }

    getName() {
        return this.name;
    }

    getDamage() {
        return this.damage;
    }

    getTimeout() {
        return this.timeout;
    }

    setAllowed(allowed) {
        this.allowed = allowed;
    }

    isAllowed() {
        return this.allowed;
    }
}

module.exports = Move;