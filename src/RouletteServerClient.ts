import Bets from './Bets';

export default class RouletteServerClient {
    constructor(private baseURL: string) {
    }

    public async makeSpinRequest(bets: Bets) {
        return await fetch(`${this.baseURL}/spin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(bets)
        });
    }

    public async makeLoginRequest(username: string, password: string) {
        return await fetch(`${this.baseURL}/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({username, password})
        });
    }

    public async makeRegistrationRequest(username: string, password: string) {
        return await fetch(`${this.baseURL}/user/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({username, password})
        });
    }

    public async loggedUserRequest() {
        return await fetch(`${this.baseURL}/user/loggedUser`, {
            method: 'GET',
            credentials: 'include'
        });
    }

    public makeLogoutRequest() {
        return fetch(`${this.baseURL}/user/logout`, {
            method: 'GET',
            credentials: 'include'
        });
    }

    async makeAddBalanceRequest(username: string, value: number) {
        return await fetch(`${this.baseURL}/user/addBalance/${value}`, {
            method: 'GET',
            credentials: 'include'
        });
    }
}