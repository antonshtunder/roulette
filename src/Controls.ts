import RouletteGame from './RouletteGame';

export default class Controls {
    private readonly buttonScale = 0.25;

    constructor(private game: RouletteGame, private x: number, private y: number) {
        this.game.add.sprite(this.x, this.y, 'spin-button').setInteractive().setScale(this.buttonScale)
            .on('pointerup', () => {
                this.game.spin();
            });
        this.game.add.sprite(this.x + 75, this.y, 'rebet-button').setInteractive().setScale(this.buttonScale)
            .on('pointerup', () => {
                this.game.rebet();
            });
        this.game.add.sprite(this.x + 150, this.y, 'double-button').setInteractive().setScale(this.buttonScale)
            .on('pointerup', () => {
                this.game.double();
            });
        this.game.add.sprite(this.x + 225, this.y, 'clear-button').setInteractive().setScale(this.buttonScale)
            .on('pointerup', () => {
                this.game.clearBets();
            });
    }
}