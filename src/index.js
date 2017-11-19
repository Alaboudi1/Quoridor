// Here should go all the javascript code, you could aslo import whatever you want for example:

import {serverCommunication} from "./serverCommunication";
import {drawBoard} from './drawBoard';
import {gameLogic} from './gameLogic';
import {drawGameInfo} from './drawGameInfo';

class index {
    constructor() {

        let serverCom = new serverCommunication();
        let logic = new gameLogic();
        let drawer = new drawBoard();
        let gameInfo = new drawGameInfo();

        serverCom.init();


    }
}

new index();