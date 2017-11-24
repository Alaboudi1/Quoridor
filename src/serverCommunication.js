/**
 *  class for communication with the server
 */

import PubSub from 'pubsub-js';

export class serverCommunication {

    constructor() {

        // initial state
        this.playerTurn = 'p1';
        this.pawns = {p1: {X: 0, Y: 4}, p2: {X: 8, Y: 4}};
        this.walls = {H: [], V: []};
        this.availableWalls = {"p1": 10, "p2": 10};

        this.subscribe();
    }

    /**
     * get the data from the server and publish it
     */
    init() {

        PubSub.publish('INIT_DATA', [this.playerTurn, this.pawns, this.walls, this.availableWalls]);

    }


    /**
     * subscribe to events
     */
    subscribe() {

        // [{X: x, Y:y}]
        PubSub.subscribe("SELECTED_PAWN_POS", (msg, data) => {
            // SEND TO SERVER
        });

        // [{X: x, Y:y}, 'H' or 'V']
        PubSub.subscribe("SELECTED_WALL", (msg, data) => {
            // SEND TO SERVER
        })
    }


}