import 'phaser';
import RouletteGame from './RouletteGame';

export default class Roulette {
    private readonly spinDeceleration = 0.0005;
    private readonly spinSpeed = 0.15;
    private readonly radius = 140;
    private readonly nSectors = 37;
    private readonly ballDefaultOffset = -Math.PI / 2 + 0.1;
    private readonly sectorValues = [0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32];

    private roulette: Phaser.GameObjects.Sprite;
    private ball: Phaser.GameObjects.Sprite;
    private rouletteSpeed = 0;
    private ballSpeed = 0;
    private spinAudio: Phaser.Sound.BaseSound;
    private ballRotationOffset = this.ballDefaultOffset;
    private ballRotation = 0;
    private _isSpinning = false;
    private nextSector: number;
    get isSpinning(): boolean {
        return this._isSpinning;
    }

    constructor(private game: RouletteGame, private x: number, private y: number) {
        this.roulette = game.add.sprite(x, y, 'roulette');
        this.ball = game.add.sprite(x + this.radius * Math.cos(this.getBallRotation()),
            y + this.radius * Math.sin(this.getBallRotation()), 'ball');
        this.roulette.rotation = this.getNSectorRotation(0);
        this.spinAudio = game.sound.add('spin-audio');
    }

    private getNSectorRotation(sector: number) {
        let correction;
        if(sector <= this.nSectors / 2) {
            correction = sector * 2 * 0.001
        } else {
            correction = (this.nSectors - sector) * 2 * 0.001;
        }
        return Math.PI * 2 / this.nSectors * sector + correction;
    }
    private updates = 0;
    private fullRotation = 0;
    public async spin() {
        if(!this._isSpinning) {
            if(this.game.isLoggedIn) {
                const response = await this.game.rouletteServerClient.makeSpinRequest(this.game.bets);
                this.nextSector = Number(await response.text());
            } else {
                this.nextSector = Phaser.Math.Between(0, this.nSectors - 1);
            }
            this.spinAudio.play();
            this._isSpinning = true;
            this.rouletteSpeed = this.spinSpeed * 1.5 - Phaser.Math.FloatBetween(this.spinSpeed * 0.75, this.spinSpeed);
            let rouletteSpinUpdates = Math.ceil(this.rouletteSpeed / this.spinDeceleration);
            let rouletteRotation = this.roulette.rotation;
            let rouletteSpeed = this.rouletteSpeed;
            for(let i = 0; i < rouletteSpinUpdates - 1; i++) {
                rouletteRotation += rouletteSpeed;
                rouletteSpeed -= this.spinDeceleration;
            }
            rouletteRotation += rouletteSpeed;
            rouletteRotation = Phaser.Math.Angle.Normalize(rouletteRotation);
            let ballRotation = this.getNSectorRotation(this.nextSector) + Math.PI * 6 + this.ballRotation - rouletteRotation;

            this.ballSpeed = Math.sqrt(2 * this.spinDeceleration * ballRotation) + 0.00025;

            this.updates = 0;
            this.fullRotation = 0;
        }
    }
    update() {
        if(this._isSpinning) {
            this.updates++;
            this.fullRotation += this.rouletteSpeed;
            this.roulette.rotation += this.rouletteSpeed;
            this.ball.x = this.x + this.radius * Math.cos(this.getBallRotation());
            this.ball.y = this.y + this.radius * Math.sin(this.getBallRotation());
            this.rouletteSpeed -= this.spinDeceleration;
            this.ballSpeed -= this.spinDeceleration;
            this.ballRotation -= this.ballSpeed;
            if(this.rouletteSpeed <= 0) {
                this.rouletteSpeed = 0;
                if(this.ballSpeed <= 0) {
                    this._isSpinning = false;
                    this.ballRotation %= Math.PI * 2;
                    let color: string;
                    if(this.nextSector === 0)
                        color = 'green';
                    else if(this.nextSector % 2 === 0)
                        color = 'red';
                    else
                        color = 'black';
                    this.game.spinEnd(this.sectorValues[this.nextSector], color);
                }
            }
        }
    }

    private getBallRotation() {
        return this.ballRotation + this.ballRotationOffset;
    }
}