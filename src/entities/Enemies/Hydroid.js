module.exports = Hydroid;


var MIN_WIDTH = 8;


function Hydroid(state, data, drop, EnemyClass) {
    var w = data.width;
    Phaser.Group.call(this, state.game);
    state.enemies.add(this);
    if (w < this.minWidth) { return; }
    var i = 0;
    while (w >= this.minWidth) {
        w /= 2;
        i++;
    }
    i = Math.pow(2, i);
    for (; i>0; i--) this.add(new EnemyClass(state, data));
    this.callAll('kill');
    this.forEach(function(enemy) {
        enemy.events.onKilled.add(this.onChildDeath, this);
    }, this);
    this.spawn(data.x, data.y, data.width, data.properties.velx,
            data.properties.vely, drop);
}


Hydroid.prototype = Object.create(Phaser.Group.prototype);

Hydroid.prototype.minWidth = MIN_WIDTH;


Hydroid.prototype.spawn = function(x, y, width, velx, vely, drop) {
    var enemy = this.getFirstDead();
    if (!enemy || width < this.minWidth) { return null; }
    return enemy.spawn(x, y, width, velx, vely, drop);
}


Hydroid.prototype.onChildDeath = function(enemy) {
    var width = enemy.width / 2;
    var x = enemy.x;
    var y = enemy.y;
    var velx = Math.abs(enemy.body.velocity.x);
    var vely = -Math.abs(enemy.body.velocity.y);

    var drop = enemy.drop;
    enemy.drop = null;
    var dropL = null, dropR = null;
    if (Array.isArray(drop)) {
        dropL = drop[1] || null;
        dropR = drop[2] || null;
        drop = drop[0] || null;
    }
    if (drop && typeof drop.reset === 'function') {
        drop.reset(x, y);
    }

    this.spawn(x - width/2, y, width, -velx, vely, dropL)
    this.spawn(x + width/2, y, width, velx, vely, dropR)
}
