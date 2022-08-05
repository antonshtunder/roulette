export default class Bets {
    public numberBets: number[] = [];
    public rowBets = [0, 0, 0];
    public thirdBets = [0, 0, 0];
    public halfBets = [0, 0];
    public evenBet = 0;
    public oddBet = 0;
    public redBet = 0;
    public blackBet = 0;
    public totalBet = 0;

    constructor() {
        for(let i = 0; i <= 36; i++) {
            this.numberBets[i] = 0;
        }
    }
    
    public getBet(where: number | string) {
        if(typeof where === 'number') {
            return this.numberBets[where];
        } else {
            if(where.search('2-to-1-') >= 0) {
                const row = Number(where.substring(where.length - 1));
                return this.rowBets[row - 1];
            } else if(where.search('-12') >= 0) {
                const thirdN = Number(where.substring(0, 1));
                return this.thirdBets[thirdN - 1];
            } else {
                switch(where) {
                    case '1-to-18':
                        return this.halfBets[0];
                    case '19-to-36':
                        return this.halfBets[1];
                    case 'red':
                        return this.redBet;
                    case 'black':
                        return this.blackBet;
                    case 'even':
                        return this.evenBet;
                    case 'odd':
                        return this.oddBet;
                }
            }
        }
    }

    public double() {
        for(let i = 0; i <= 36; i++) {
            this.numberBets[i] *= 2;
        }
        for(let i = 0; i < 3; i++) {
            this.rowBets[i] *= 2;
            this.thirdBets[i] *= 2;
        }
        for(let i = 0; i < 2; i++)
            this.halfBets[i] *= 2;
        this.blackBet *= 2;
        this.redBet *= 2;
        this.oddBet *= 2;
        this.evenBet *= 2;
        this.totalBet *= 2;
    }
    
    public makeBet(where: number | string, valueInCents: number) {
        this.totalBet += valueInCents;
        if(typeof where === 'number') {
            this.numberBets[where] += valueInCents;
        } else {
            if(where.search('2-to-1-') >= 0) {
                const row = Number(where.substring(where.length - 1));
                this.rowBets[row - 1] += valueInCents;
            } else if(where.search('-12') >= 0) {
                const thirdN = Number(where.substring(0, 1));
                this.thirdBets[thirdN - 1] += valueInCents;
            } else {
                switch(where) {
                    case '1-to-18':
                        this.halfBets[0] += valueInCents;
                        break;
                    case '19-to-36':
                        this.halfBets[1] += valueInCents;
                        break;
                    case 'red':
                        this.redBet += valueInCents;
                        break;
                    case 'black':
                        this.blackBet += valueInCents;
                        break;
                    case 'even':
                        this.evenBet += valueInCents;
                        break;
                    case 'odd':
                        this.oddBet += valueInCents;
                        break;
                }
            }
        }
    }
}