import RouletteGame from './RouletteGame';

export default class UserMenu {
    private usernameText: Phaser.GameObjects.Text;

    private readonly textStyle = {
        fontSize: '30px'
    };

    constructor(private game: RouletteGame, private x: number, private y: number) {
        this.usernameText = this.game.add.text(this.x, this.y, this.game.username, this.textStyle);
        this.game.add.text(this.x + 200, this.y, 'Add balance', this.textStyle).setInteractive()
            .on('pointerup', () => {
                this.game.addBalance(10000);
        });
    }

    public userLogged() {
        this.usernameText.setText(this.game.username);
        this.game.add.text(this.x + 500, this.y, 'Log out', this.textStyle).setInteractive()
            .on('pointerup', () => {
                console.log('logout');
                this.game.logout();
            });
    }
}