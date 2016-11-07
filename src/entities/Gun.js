module.exports = Gun;


var Item = require('./Item.js');
var Bullet = require('./Bullets/Bullet.js');


function Gun(state, data, BulletClass) {
    Item.call(this, state, data);

    this.rate = data.rate || 100;
    this.auto = data.auto || false;
    this.spread = data.spread || 0;
    this.accuracy = data.accuracy || 0;
    this.speedMul = data.speedMul || 1;
    this.speedVar = data.speedVar || 0;

    this.clips = [];
    this.lastShot = 0;

    var clips = data.clips || 1;
    var clipSize = data.clipSize || 3;
    var bulletTexture = data.bulletTexture;

    for (var i=0; i<clips; i++) {
        var clip = new Phaser.Group(state.game);

        for (var j=0; j<clipSize; j++) {
            var bullet = new BulletClass(state, 0, 0, bulletTexture);
            clip.add(bullet);
        }

        this.clips.push(clip);
    }
}


Gun.prototype = Object.create(Item.prototype);


Gun.prototype.pickUp = function(_, playerBody) {
    this.lifespan = 0;
    playerBody.sprite.equip(this);
}


Gun.prototype.fire = function(newShot) {
    if (this.auto || newShot) {

        var now = this.game.time.now;
        if (now - this.lastShot < this.rate) return;

        var bullets = this.clips.map(function(clip) { return clip.getFirstDead(); });

        if (!bullets.every(function(bullet) { return bullet; })) return;

        this.lastShot = now;

        var x = this.worldPosition.x;
        var y = this.worldPosition.y;
        var theta = this.rotation;

        bullets.forEach(function(bullet, i) {
            var speedBonus = this.speedMul * (1 + (Math.random()*2 - 1)*this.speedVar);
            var bulletTheta = theta + (this.spread/this.clips.length *i - this.spread/2) + (Math.random()*2 - 1)*this.accuracy;
            bullet.fire(x, y, bulletTheta, speedBonus);
        }, this);
    }
}
