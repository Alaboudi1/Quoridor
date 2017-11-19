/**
 *  class for communication with the server
 */

import PubSub from 'pubsub-js';

export class serverCommunication {

    constructor() {

        this.playerTurn = 'p2';
        this.pawns = {p1: {X: 0, Y: 4}, p2: {X: 8, Y: 4}};
        this.walls = {H: [{X: 0, Y: 1}, {X: 1, Y: 1}, {X: 8, Y: 3}, {X: 7, Y: 3}], V: [{X: 4, Y: 4}, {X: 4, Y: 5}]};
        this.availableWalls = {"p1": 10, "p2": 10};

        this.subscribe();
    }

    /**
     * get the data from the server and publish it
     */
    init() {

        // GET THE DATA FROM THE SERVER

        PubSub.publish('SERVER_DATA', [this.playerTurn, this.pawns, this.walls, this.availableWalls]);

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