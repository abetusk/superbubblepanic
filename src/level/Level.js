module.exports = Level


function Level() {
    return this
}


Level.prototype = {

    create: require('./create.js'),
    entities: require('../entities/entities.js'),
    init: require('./init.js'),
    parseDrop: require('./parseDrop.js'),


    addEntity: function(data) {
        data.properties = data.properties || {}
        var type = data.type
        var drop = this.parseDrop(data.properties.drop)
        // Tiled uses different coordinates than Phaser.
        data.x = data.x + data.width / 2
        data.y = data.y + data.height / 2
        console.log('Creating ' + type + '...')
        if (!this.entities.hasOwnProperty(type)) {
            throw "Failed to read Tiled map, no game object of type '" + type + ".'"
        }
        return new this.entities[type](this, data, drop)
    },


    changeTime: function(factor) {
        if (factor === 0 || isNaN(factor)) return
        this.bulletTime *= factor;
        this.enemies.recurse(function(enemy) {
            enemy.body.mass /= factor;
            enemy.body.velocity.x *= factor;
            enemy.body.velocity.y *= factor;
            enemy.body.data.gravityScale *= factor * factor;
        });
        if (this.sound.usingWebAudio) {
            this.sound._sounds.forEach(function(snd) {
                if (snd._snd) snd._snd.playbackRate *= factor
            });
        }
    },


    exit: function() {
        this.state.start('Menu')
    },


    explode: function(x, y, width) {
        this.explosionPool.getFirstDead(true).reset(x, y, width)
    },


    gameOver: function() {
        this.input.keyboard.addKey(Phaser.Keyboard.R).onDown.addOnce(function() {
            this.state.start(this.key, true, false, this.mapName)
        }, this)
        this.input.keyboard.addKey(Phaser.Keyboard.X).onDown.addOnce(this.exit, this)
        this.add.tween(this.gameOverScreen).to({alpha: 0.8}, 100).start()
        this.input.mousePointer.leftButton.onDown.addOnce(function() {
            this.state.start(this.key, true, false, this.mapName)
        }, this)
        this.gameOverScreen.exists = true
        this.time.slowMotion = 6
        this.world.add(this.p1)
    },


    playSound: function(key, randomize, useBulletTime, lock, repeat) {
        lock = lock || false
        repeat = repeat || false
        if (useBulletTime === undefined) useBulletTime = true

        var sound = null

        for (var i = 0; i < this.soundPool.length; i++) {
            if (!this.soundPool[i].isPlaying) {
                sound = this.soundPool[i]
                break
            }
        }

        if (!sound) {
            for (i = 0; i < this.soundPool.length; i++) {
                if (!this.soundPool[i].isLocked) {
                    sound = this.soundPool[i]
                    break
                }
            }
        }

        if (!sound) return null

        sound.key = key
        sound.isLocked = lock
        sound.play('', 0, 1, repeat, true)

        if (sound._sound && sound.usingWebAudio) {
            if (useBulletTime)
                sound._sound.playbackRate.value = this.bulletTime
            if (randomize)
                sound._sound.detune.value = Math.random() * -randomize
        }

        return sound
    },


    throwShell: function(x, y, dir) {
        var shell = this.shellPool.getFirstDead() || this.shellPool.getRandom()
        shell.reset(x, y)
        shell.body.angularVelocity = Math.random() * 8
        shell.body.velocity.x = (Math.random() * 40 + 20) * dir
        shell.body.velocity.y = -120
    },


    update: function() {
        for (var i=this.buffs.length-1; i>=0; i--) {
            var buff = this.buffs[i]
            if (buff.timeLeft !== -1)
                buff.timeLeft = Math.max(buff.timeLeft - this.time.elapsed, 0)
            if (buff.timeLeft !== 0) {
                if (typeof buff.update === 'function') buff.update()
            } else {
                if (typeof buff.stop === 'function') buff.stop()
                this.buffs.splice(i, 1)
            }
        }

        if (this.loseCondition()) this.gameOver()
    },


    shutdown: function() {
        this.input.mousePointer.leftButton.onDown.dispose()
        this.stage.removeChild(this.gameOverScreen)
        this.time.slowMotion = 1
    },

    loseCondition: function() {
        return !this.p1.alive
    },

    startFX: function() {
        var go = this.add.image(this.world.width/2, this.world.height/2,
            'sprites', 'go')
        go.anchor.setTo(0.5)
        var goTween = this.add.tween(go)
        goTween.to({width: go.width * 4, height: go.height * 4, alpha: 0},
            800, Phaser.Easing.Quartic.In)
        goTween.onComplete.addOnce(go.kill, go)
        goTween.start()

        this.camera.flash(0x180c08, 1000)
    }
}
