import 'phaser';
import RouletteGame from './RouletteGame';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    scale: {
        mode: Phaser.Scale.FIT,
        // ...
    },
    scene: [RouletteGame]
};

let game = new Phaser.Game(config);
