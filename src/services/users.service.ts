import request from 'request';
import * as fs from "fs";
import User from '../users/user.interface';

class UsersService {
    public page = 1;
    public totalPages = 1;
    public users: User[] = [];

    public usersPath = './assets/users.json';

    constructor() {
        fs.readFile(this.usersPath, 'utf-8', (err, data) => {
            if (err) {
                console.log(err);
                return;
            }

            this.users = JSON.parse(data);
        });
    }

    public scrapeUsers() {
        console.log('scraping users: ');

        if (this.page > this.totalPages) return;

        request(`https://reqres.in/api/users?page=${this.page}`, { json: true }, (err, response, body) => {
            console.log('body: ', body);
            if (response.statusCode !== 200) {
                return;
            }

            // Save users into file storage
            this.insertUsers(body.data);

            if (body.page && body.total_pages) {
                this.page = body.page;
                this.totalPages = body.total_pages;
            }

            this.page++;
        })
    }

    // Insert users into file storage
    insertUsers = (users: User[]) => {
        this.users = this.users.concat(users);

        // Write user data to file storage
        fs.writeFile(this.usersPath, JSON.stringify(this.users), function(err) {
            if(err) {
                return console.log(err);
            }

            console.log(`The file was saved!`);
        });
    }
}

export default UsersService;
