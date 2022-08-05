import RouletteGame from './RouletteGame';

export class Chip {
    private readonly scale = 0.17;
    public chip: Phaser.GameObjects.Sprite;
    set active(value: boolean) {
        this._active = value;
        this.drawActive();
    }

    constructor(private game: RouletteGame, private x: number, private y: number, private graphics: Phaser.GameObjects.Graphics,
                private image: string, public readonly valueInCents: number, private _active = false) {
        this.chip = this.game.add.sprite(this.x, this.y, image).setInteractive().setScale(this.scale);
        this.drawActive();
    }

    private drawActive() {
        if(this._active) {
            this.graphics.fillStyle(0xffd736);
            this.graphics.fillCircle(this.x, this.y, this.chip.displayWidth / 2 + 3);
        }
    }
}

export const betSizes = [10, 50, 200, 500, 2500, 10000];
export const chipNames = ['chip-0-1', 'chip-0-5', 'chip-2', 'chip-5', 'chip-25', 'chip-100'];

export default class BettingChips {
    private chips: Chip[] = [];
    private graphics: Phaser.GameObjects.Graphics;
    private _activeChip: Chip;
    get activeChip(): Chip {
        return this._activeChip;
    }

    constructor(private game: RouletteGame, private x: number, private y: number) {
        this.graphics = this.game.add.graphics();
        this._activeChip = new Chip(this.game, this.x, this.y, this.graphics, 'chip-0-1', 10, true);
        this.chips.push(this._activeChip);
        this.chips.push(new Chip(this.game, this.x + 50, this.y, this.graphics, 'chip-0-5', 50));
        this.chips.push(new Chip(this.game, this.x + 100, this.y, this.graphics, 'chip-2', 200));
        this.chips.push(new Chip(this.game, this.x + 150, this.y, this.graphics, 'chip-5', 500));
        this.chips.push(new Chip(this.game, this.x + 200, this.y, this.graphics, 'chip-25', 2500));
        this.chips.push(new Chip(this.game, this.x + 250, this.y, this.graphics, 'chip-100', 10000));
        for(let chip of this.chips) {
            chip.chip.on('pointerup', () => {
                this.graphics.clear();
                for(let chip of this.chips) {
                    chip.active = false;
                }
                chip.active = true;
                this._activeChip = chip;
            });
        }
    }
}