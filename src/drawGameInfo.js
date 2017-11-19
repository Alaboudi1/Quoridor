/**
 *  class for drawing the information of the game
 */

// import * as d3 from 'd3';
import PubSub from 'pubsub-js';

export class drawGameInfo {

    constructor() {

        this.playerTurn = "p1";
        this.availableWalls = {"p1": 0, "p2": 0};

        this.subscribe();
    }

    /**
     * subscribe to events
     */
    subscribe() {
        // [playerTurn, pawns, walls, potentialPawn, availableWalls]
        PubSub.subscribe('MAIN_DATA', (msg, data) => {
            this.playerTurn = data[0];
            this.availableWalls = data[4];
            this.update();
        });

    }

    /**
     * update the info
     */
    update() {

        // TODO update the UI
    }

}