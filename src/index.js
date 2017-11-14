module.exports = Game;


var GameData = require('./GameData.js')
var Boot = require('./boot.js');
var Load = require('./load.js');
var Level = require('./level/Level.js');
var ZeroGLevel = require('./level/ZeroGLevel.js');
var MonsterLevel = require('./level/MonsterLevel.js');
var Arcade = require('./arcade/arcade.js');
var Menu = require('./menu/menu.js');
var LevelSelect = require('./LevelSelect.js');


function Game() {
    require('./phaserPatch.js')();

    var game = new Phaser.Game(800, 600, undefined,
        undefined, undefined, false, false)

    game.data = new GameData(game)

    game.state.add('Boot', new Boot);
    game.state.add('Load', new Load);
    game.state.add('Level', new Level);
    game.state.add('ZeroGLevel', new ZeroGLevel);
    game.state.add('MonsterLevel', new MonsterLevel);
    game.state.add('Menu', new Menu);
    game.state.add('Arcade', new Arcade);
    game.state.add('LevelSelect', new LevelSelect);

    game.state.start('Boot');

    return game;
}

