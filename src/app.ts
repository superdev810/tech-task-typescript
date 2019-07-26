import express from 'express';
import bodyParser from 'body-parser';
import cron from 'node-cron';
import UsersService from './services/users.service';

class App {
    public app: express.Application;
    public port: number;

    constructor(controllers: any[], port: number) {
        this.app = express();
        this.port = port;

        this.initializeMiddleware();
        this.initializeCron();
        this.initializeController(controllers);
    }

    private initializeMiddleware() {
        this.app.use(bodyParser.json());
    }

    private initializeController(controllers: any[]) {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        })
    }

    private initializeCron() {
        const userService = new UsersService();
        cron.schedule('* * * * *', () => {
            console.log('every 1 min cron job: ');
            userService.scrapeUsers();
        })
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`Server started at localhost:${this.port}`);
        })
    }
}

export default App;
