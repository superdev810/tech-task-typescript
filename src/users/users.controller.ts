import express from 'express';
import User from './user.interface';
import request from 'request';
import * as fs from "fs";

class UsersController {
    public path = '/api/user';
    public router = express.Router();
    public avatarPath = './assets/avatar';
    private users: User[] = [];

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.get(`${this.path}/:userId`, this.getUser);
        this.router.get(`${this.path}/:userId/avatar`, this.getAvatar);
        this.router.delete(`${this.path}/:userId/avatar`, this.removeAvatar);
    }

    // Get user data
    getUser = (req: express.Request, res: express.Response) => {
        const userId = req.params.userId;

        // Check userId exist in query param
        if (!userId) {
            return res.send({
                status: false,
                error: 'User id is empty'
            });
        }

        // Get user data from rest api
        request(`https://reqres.in/api/users/${userId}`, { json: true }, (err, response, body) => {
            console.log('body: ', body);
            if (response.statusCode !== 200) {
                return res.send(err);
            }

            res.send(body);
        })
    }

    // Get user avatar
    getAvatar = (req: express.Request, res: express.Response) => {
        const userId = req.params.userId;

        // Check userId exist in query param
        if (!userId) {
            return res.send({
                status: false,
                error: 'User id is empty'
            });
        }

        fs.readFile(`${this.avatarPath}/${userId}`, 'utf-8', (err, data) => {
            if (err) {
                console.log(err)

                const imgRequest = request.defaults({encoding: null});
                // Get user data from rest api
                request(`https://reqres.in/api/users/${userId}`, { json: true }, (err, response, body) => {
                    console.log('body: ', body);
                    if (response.statusCode !== 200) {
                        return res.send(err);
                    }
                    imgRequest(body.data.avatar, {}, (avatarErr, avatarRes, avatarBody) => {
                        if (avatarRes.statusCode !== 200) {
                            return res.send(err);
                        }
                        const data = "data:" + avatarRes.headers["content-type"] + ";base64," + new Buffer(avatarBody).toString('base64');

                        console.log('Success convert to base64');

                        // Write base64 image data to file storage
                        fs.writeFile(`${this.avatarPath}/${userId}`, data, function(err) {
                            if(err) {
                                return console.log(err);
                            }

                            console.log(`The ${userId} file was saved!`);
                        });

                        res.send({data});
                    });

                })
            } else {
                console.log('Read avatar from file');
                res.send({data});
            }
        });
    }

    removeAvatar = (req: express.Request, res: express.Response) => {
        const userId = req.params.userId;

        // Check userId exist in query param
        if (!userId) {
            return res.send({
                status: false,
                error: 'User id is empty'
            });
        }

        fs.unlink(`${this.avatarPath}/${userId}`, function (err) {
            if (err) {
                console.log(err);
                return res.send({
                    status: false,
                    error: 'Avator not exist'
                })
            }
            console.log(`${userId} File deleted!`);
            res.send({
                status: true,
                data: 'ok'
            })
        });
    }
}

export default UsersController;
