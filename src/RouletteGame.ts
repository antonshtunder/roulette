import 'phaser';
import Roulette from './Roulette';
import BettingTable from './BettingTable';
import BettingChips, {Chip} from './BettingChips';
import Controls from './Controls';
import {calculateWinnings} from './WinCalculator';
import RouletteServerClient from './RouletteServerClient';
import Bets from './Bets';
import UserMenu from './UserMenu';

export default class RouletteGame extends Phaser.Scene {
    private roulette: Roulette;
    private table: BettingTable;
    private chips: BettingChips;
    private controls: Controls;
    private totalBetText: Phaser.GameObjects.Text;
    private balanceText: Phaser.GameObjects.Text;
    private winText: Phaser.GameObjects.Text;
    private resultGraphics: Phaser.GameObjects.Graphics;
    private showResultTimestamp = 0;
    private lastResult: number;
    private lastColor: string;
    private resultText: Phaser.GameObjects.Text;
    private readonly resultMaxSize = 100;
    private readonly resultTime = 2500;
    private _balanceInCents: number;
    private _rouletteServerClient: RouletteServerClient;
    private _loggedIn = false;
    private _username = 'guest';
    private userMenu: UserMenu;

    get rouletteServerClient(): RouletteServerClient {
        return this._rouletteServerClient;
    }

    get balanceInCents(): number {
        return this._balanceInCents;
    }

    set balanceInCents(value: number) {
        this._balanceInCents = value;
        this.balanceText.setText(`${this.getCentsToDollarsText(value)}`);
    }

    get isShowResult(): boolean {
        return Date.now() - this.showResultTimestamp <= this.resultTime;
    }

    get bets(): Bets {
        return this.table.bets;
    }

    get isLoggedIn(): boolean {
        return this._loggedIn;
    }

    get username(): string {
        return this._username;
    }

    preload () {
        this._rouletteServerClient = new RouletteServerClient('http://localhost:8080');
        this.input.mouse.enabled = false;
        document.getElementById('play-offline-button').onclick = () => this.gameStart();
        document.getElementById('registration-form-button').onclick = () => {
            document.getElementById('login').classList.remove('active');
            document.getElementById('registration').classList.add('active');
            document.getElementById('login-form-button').classList.remove('active');
            document.getElementById('registration-form-button').classList.add('active');
        };
        document.getElementById('login-form-button').onclick = () => {
            document.getElementById('login').classList.add('active');
            document.getElementById('registration').classList.remove('active');
            document.getElementById('login-form-button').classList.add('active');
            document.getElementById('registration-form-button').classList.remove('active');
        };
        document.getElementById('login-button').onclick = async () => {
            e.preventDefault();
            let result = await this._rouletteServerClient.makeLoginRequest(
                (<HTMLInputElement>document.getElementById('username-login')).value,
                (<HTMLInputElement>document.getElementById('password-login')).value);
            let resultObject = JSON.parse(await result.text());
            if(resultObject.result === 'ok') {
                this.login(resultObject.username);
                this.balanceInCents = resultObject.balance;
                this.gameStart();
            }
        }
        document.getElementById('registration-button').onclick = async (e) => {
            e.preventDefault();
            let password = (<HTMLInputElement>document.getElementById('password-registration')).value;
            let confirmPassword = (<HTMLInputElement>document.getElementById('confirm-password-registration')).value;
            if(password === confirmPassword) {
                let username = (<HTMLInputElement>document.getElementById('username-registration')).value;
                let result = await this._rouletteServerClient.makeRegistrationRequest(username, password);
                let response = await result.text();
                if(response == 'ok') {
                    this.login(username);
                    this.balanceInCents = 0;
                    this.gameStart();
                }
            } else {
                window.alert('Password and password confirmation are different');
            }
        }

        this.load.image('background', 'assets/background.png');
        this.load.image('roulette', 'assets/roulette.png');
        this.load.image('ball', 'assets/ball.png');
        this.load.image('table', 'assets/table.png');
        this.load.image('chip-0-1', 'assets/chips/0-1.png');
        this.load.image('chip-0-5', 'assets/chips/0-5.png');
        this.load.image('chip-2', 'assets/chips/2.png');
        this.load.image('chip-5', 'assets/chips/5.png');
        this.load.image('chip-25', 'assets/chips/25.png');
        this.load.image('chip-100', 'assets/chips/100.png');
        this.load.image('spin-button', 'assets/buttons/spin.png');
        this.load.image('rebet-button', 'assets/buttons/rebet.png');
        this.load.image('double-button', 'assets/buttons/double.png');
        this.load.image('clear-button', 'assets/buttons/clear.png');
        this.load.audio('spin-audio', 'assets/spin.mp3');
    }

    private login(username: string) {
        this._loggedIn = true;
        this._username = username;
        this.userMenu.userLogged();
    }

    private gameStart() {
        this.input.mouse.enabled = true;
        document.querySelector('canvas').classList.add('active');
        document.getElementById('user-form').style.display = 'none';
        document.getElementById('form-backlight').style.display = 'none';
    }

    create () {
        this.add.image(960, 540, 'background');
        this.roulette = new Roulette(this, 550, 500);
        this.table = new BettingTable(this, 1220, 530);
        this.chips = new BettingChips(this, 850, 1000);
        this.controls = new Controls(this, 1580, 1000);
        this.balanceText = this.add.text(125, 1010,
            `0`, {fontStyle: 'bold', fontSize: '28px'}).setOrigin(0.5, 0.5);
        this.balanceInCents = 20000;
        this.totalBetText = this.add.text(340, 1010,
            `0`, {fontStyle: 'bold', fontSize: '28px'}).setOrigin(0.5, 0.5);
        this.winText = this.add.text(534, 1010,
            `0`, {fontStyle: 'bold', fontSize: '28px'}).setOrigin(0.5, 0.5);
        this.resultGraphics = this.add.graphics();
        this.resultText = this.add.text(1010, 490, '10', {fontSize: '40px', fontStyle: 'bold'}).setOrigin(0.5, 0.5);
        this.userMenu = new UserMenu(this, 50, 50);


        this._rouletteServerClient.loggedUserRequest().then(async res => {
            let loggedUserResult = JSON.parse(await res.text());
            if(loggedUserResult.result === 'ok') {
                this._loggedIn = true;
                this._username = loggedUserResult.username;
                this.userMenu.userLogged();
                this.balanceInCents = loggedUserResult.balance;
                this.gameStart();
            }
        });
    }

    update () {
        this.roulette.update();
        this.resultGraphics.clear();
        this.resultText.setVisible(false);
        if(this.isShowResult) {
            this.resultText.setVisible(true);
            let size = this.resultMaxSize;
            if(this.lastColor === 'red') {
                this.resultGraphics.fillStyle(0xff0000);
                this.resultGraphics.lineStyle(2, 0x000000);
            } else if(this.lastColor === 'black') {
                this.resultGraphics.fillStyle(0x000000);
                this.resultGraphics.lineStyle(2, 0xff0000);
            } else {
                this.resultGraphics.fillStyle(0x00ff00);
                this.resultGraphics.lineStyle(2, 0x000000);
            }
            this.resultGraphics.fillRect(960, 440, size, size);
            this.resultGraphics.strokeRect(960, 440, size, size);
        }
    }

    public async addBalance(value: number) {
        if(this._loggedIn) {
            const response = await this.rouletteServerClient.makeAddBalanceRequest(this.username, value);
            const responseText = await response.text();
            if(responseText === 'ok') {
                this.balanceInCents += value;
            }
        } else {
            this.balanceInCents += value;
        }
    }

    public getActiveChip(): Chip {
        return this.chips.activeChip;
    }

    public async spin() {
        this.roulette.spin();
    }

    public double() {
        this.table.double();
    }

    public setTotalBet(totalBet: number) {
        this.totalBetText.setText(`${this.getCentsToDollarsText(totalBet)}`);
    }

    public spinEnd(result: number, color: string) {
        const winnings = calculateWinnings(this.table.bets, result, color);
        this.winText.setText(this.getCentsToDollarsText(winnings));
        this.setTotalBet(0);
        this.balanceInCents += winnings;
        this.table.clearBets();
        this.showResultTimestamp = Date.now();
        this.lastResult = result;
        this.lastColor = color;
        this.resultText.setText(`${result}`);
    }

    public rebet() {
        this.table.rebet();
    }

    public getCentsToDollarsText(cents: number): string {
        const cents2 = cents % 100;
        return `${Math.floor(cents / 100)}.${(cents2 >= 10) ? '' : '0'}${cents2}`;
    }

    public clearBets() {
        this.table.clearBets(true);
    }

    public async logout() {
        this.rouletteServerClient.makeLogoutRequest().then(() => location.reload());
    }
}