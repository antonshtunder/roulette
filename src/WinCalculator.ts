import Bets from './Bets';

export function calculateWinnings(bets: Bets, result: number, color: string): number {
    let win = bets.numberBets[result] * 36;
    if(color === 'black')
        win += bets.blackBet * 2;
    if(color === 'red')
        win += bets.redBet * 2;
    if(result % 3 === 1)
        win += bets.rowBets[0] * 3;
    if(result % 3 === 2)
        win += bets.rowBets[1] * 3;
    if(result % 3 === 0)
        win += bets.rowBets[2] * 3;
    if(result >= 1 && result <= 12)
        win += bets.thirdBets[0] * 3;
    if(result >= 13 && result <= 24)
        win += bets.thirdBets[1] * 3;
    if(result >= 25 && result <= 36)
        win += bets.thirdBets[2] * 3;
    if(result >= 1 && result <= 18)
        win += bets.halfBets[0] * 2;
    if(result >= 19 && result <= 36)
        win += bets.halfBets[1] * 2;
    if(result != 0 && result % 2 === 0)
        win += bets.evenBet * 2;
    if(result % 2 === 1)
        win += bets.oddBet * 2;
    return win;
}