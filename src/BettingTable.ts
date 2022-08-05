import Pointer = Phaser.Input.Pointer;
import RouletteGame from './RouletteGame';
import Bets from './Bets';
import {betSizes, chipNames} from './BettingChips';

export default class BettingTable {
    private table: Phaser.GameObjects.Sprite;
    private bettingZones: BettingZone[] = [];

    private _bets: Bets;
    get bets(): Bets {
        return this._bets;
    }
    private lastBets: Bets;

    constructor(private game: RouletteGame, private x: number, private y: number) {
        this.table = game.add.sprite(x, y, 'table').setInteractive();
        this.bettingZones.push(new BettingZone(game,0, {x: 25, y: 0, w: 45, h: 215},
            {x: 40 + this.table.getTopLeft().x, y: 107 + this.table.getTopLeft().y}));
        for(let i = 0; i < 12; i++) {
            this.bettingZones.push(new BettingZone(game,i * 3 + 3, {x: 76 + 55 * i, y: 0, w: 51, h: 70},
                {x: 76 + 55 * i + 25 + this.table.getTopLeft().x, y: 35 + this.table.getTopLeft().y}));
            this.bettingZones.push(new BettingZone(game,i * 3 + 2, {x: 76 + 55 * i, y: 73, w: 51, h: 70},
                {x: 76 + 55 * i + 25 + this.table.getTopLeft().x, y: 73 + 35 + this.table.getTopLeft().y}));
            this.bettingZones.push(new BettingZone(game,i * 3 + 1, {x: 76 + 55 * i, y: 147, w: 51, h: 70},
                {x: 76 + 55 * i + 25 + this.table.getTopLeft().x, y: 147 + 35 + this.table.getTopLeft().y}));
        }
        for(let i = 0; i < 3; i++) {
            this.bettingZones.push(new BettingZone(game,`2-to-1-${3 - i}`, {x: 737, y: i * 73, w: 51, h: 70},
                {x: 737 + 25 + this.table.getTopLeft().x, y: i * 73 + 35 + this.table.getTopLeft().y}));
        }
        for(let i = 0; i < 3; i++) {
            this.bettingZones.push(new BettingZone(game,`${i + 1}-12`, {x: 76 + 220 * i, y: 221, w: 216, h: 56},
                {x: 76 + 220 * i + 108 + this.table.getTopLeft().x, y: 221 + 28 + this.table.getTopLeft().y}));
        }
        this.bettingZones.push(new BettingZone(game,'1-to-18', {x: 76, y: 281, w: 107, h: 51},
            {x: 76 + 53 + this.table.getTopLeft().x, y: 281 + 25 + this.table.getTopLeft().y}));
        this.bettingZones.push(new BettingZone(game,'even', {x: 186, y: 281, w: 107, h: 51},
            {x: 186 + 53 + this.table.getTopLeft().x, y: 281 + 25 + this.table.getTopLeft().y}));
        this.bettingZones.push(new BettingZone(game,'red', {x: 296, y: 281, w: 107, h: 51},
            {x: 296 + 53 + this.table.getTopLeft().x, y: 281 + 25 + this.table.getTopLeft().y}));
        this.bettingZones.push(new BettingZone(game,'black', {x: 406, y: 281, w: 107, h: 51},
            {x: 406 + 53 + this.table.getTopLeft().x, y: 281 + 25 + this.table.getTopLeft().y}));
        this.bettingZones.push(new BettingZone(game,'odd', {x: 516, y: 281, w: 107, h: 51},
            {x: 516 + 53 + this.table.getTopLeft().x, y: 281 + 25 + this.table.getTopLeft().y}));
        this.bettingZones.push(new BettingZone(game,'19-to-36', {x: 626, y: 281, w: 107, h: 51},
            {x: 626 + 53 + this.table.getTopLeft().x, y: 281 + 25 + this.table.getTopLeft().y}));
        this.table.on('pointerup', (e: Pointer) => {
            const p = this.table.getLocalPoint(e.x, e.y);
            console.log(p);
            for(let i = 0; i < this.bettingZones.length; i++) {
                if(this.bettingZones[i].check(p.x, p.y)) {
                    console.log(this.bettingZones[i]);
                    const valueInCents = this.game.getActiveChip().valueInCents;
                    if(this.game.balanceInCents >= valueInCents) {
                        const where = this.bettingZones[i].value;
                        this.bets.makeBet(where, valueInCents);
                        this.bettingZones[i].drawChips(this.bets.getBet(where));
                        this.game.balanceInCents -= valueInCents;
                        this.game.setTotalBet(this.bets.totalBet);
                        console.log(this.bets);
                    }
                    break;
                }
            }
        });
        this.clearBets();
    }

    public clearBets(returnBets = false) {
        if(returnBets) {
            this.game.setTotalBet(0);
            this.game.balanceInCents += this.bets.totalBet;
        }
        this.lastBets = this._bets;
        this._bets = new Bets();
        for(let zone of this.bettingZones)
            zone.drawChips(0);
    }

    public rebet() {
        if(this.lastBets.totalBet <= this.game.balanceInCents) {
            this._bets = this.lastBets;
            this.updateChips();
            this.game.setTotalBet(this._bets.totalBet);
            this.game.balanceInCents -= this._bets.totalBet;
        }
    }

    private updateChips() {
        for(let zone of this.bettingZones) {
            zone.drawChips(this._bets.getBet(zone.value));
        }
    }

    public double() {
        if(this.bets.totalBet <= this.game.balanceInCents) {
            this.game.balanceInCents -= this.bets.totalBet;
            this.bets.double();
            this.updateChips();
            this.game.setTotalBet(this.bets.totalBet);
        }
    }
}

class BettingZone {

    private chips: Phaser.GameObjects.Sprite[] = [];
    private betSizeText: Phaser.GameObjects.Text;

    constructor(private game: RouletteGame, public readonly value: number | string, private bettingRect: { x: number, y: number, w: number, h: number },
                private readonly chipsPosition: { x: number, y: number }) {

    }

    public drawChips(betSize: number) {
        if(this.betSizeText)
            this.betSizeText.destroy();
        for(let chip of this.chips) {
            chip.destroy();
        }
        if(betSize > 0) {
            let offsetX = -14;
            if(betSize >= 10000)
                offsetX = -19;
            else if(betSize >= 1000)
                offsetX = -17;
            this.betSizeText = this.game.add.text(this.chipsPosition.x + offsetX, this.chipsPosition.y + 15, this.game.getCentsToDollarsText(betSize), {fontSize: '12px'});
        }
        this.chips = [];
        for(let i = betSizes.length - 1; i >= 0; i--) {
            while(betSize >= betSizes[i]) {
                betSize -= betSizes[i];
                this.chips.push(this.game.add.sprite(this.chipsPosition.x, this.chipsPosition.y - 3 * this.chips.length, chipNames[i]).setScale(0.12));
            }
        }

    }

    public check(x: number, y: number): boolean {
        return x >= this.bettingRect.x && x <= this.bettingRect.x + this.bettingRect.w &&
            y >= this.bettingRect.y && y <= this.bettingRect.y + this.bettingRect.h;
    }
}