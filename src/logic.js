/* eslint-disable linebreak-style */

import * as d3 from 'd3';

export class logic {

    constructor() {

        this.dimensions = {gridSize: 9, gridWidth: 70, squareWidth: 55, marginWidth: 15, pawnRadius: 15}; // pawnRadius = squareWidth / 2 -15

        this.squares = Array.apply(null, {length: Math.pow(this.dimensions.gridSize, 2)}).map(Number.call, Number); // 0 - 80
        this.rects = Array.apply(null, {length: this.dimensions.gridSize * (this.dimensions.gridSize - 1)}).map(Number.call, Number); // 0 - 71
        this.pawns = {'p1': [0, 4], 'p2': [8, 4]}; // We must store this somewhere secure
        this.walls = {H: [0, 8], V: []};

        this.gameFieldDiv = d3.select('#gameFieldDiv');
        this.svg = this.gameFieldDiv.append('svg').attr('id', 'gameSVG');

        this.scaleX = d3.scaleLinear().domain([0, 8])
            .range([this.dimensions.squareWidth / 2, (this.dimensions.gridSize - 0.5) * this.dimensions.gridWidth - this.dimensions.marginWidth / 2]);
        this.scaleY = d3.scaleLinear().domain([0, 8])
            .range([this.dimensions.squareWidth / 2, (this.dimensions.gridSize - 0.5) * this.dimensions.gridWidth - this.dimensions.marginWidth / 2]);


        this.squareGroup = this.svg.append('g')
            .attr('transform', 'translate(10,10)');
        this.wallRectsGroup = this.svg.append('g')
            .attr('transform', 'translate(10,10)');
        this.miniSquareGroup = this.svg.append('g')
            .attr('transform', 'translate(10,10)');
        this.playersGroup = this.svg.append('g')
            .attr('transform', 'translate(10,10)');

        this.drawSquares();
        this.drawWallRect();
        this.drawPlayers();
        this.drawWalls();


    }

    /**
     * draw the squares in which pawns are located
     */
    drawSquares() {
        this.squareGroup.selectAll('.squares').data(this.squares)
            .enter()
            .append('rect')
            .classed('squares square', true)
            .attr('x', (d) => (d % this.dimensions.gridSize) * this.dimensions.gridWidth)
            .attr('y', (d) => Math.floor(d / this.dimensions.gridSize) * this.dimensions.gridWidth)
            .attr('width', this.dimensions.squareWidth)
            .attr('height', this.dimensions.squareWidth);
    }

    /**
     * draw the invisible wall rects in which real walls are located
     */
    drawWallRect() {

        // vertical

        this.hoverRect = this.wallRectsGroup
            .append('rect').attr('id', 'hoverRect');

        this.wallRectsGroup.selectAll('.wallRectV').data(this.rects)
            .enter()
            .append('rect')
            .classed('wallRectV', true)
            .attr('x', (d) => ((d % (this.dimensions.gridSize - 1)) + 1) * this.dimensions.gridWidth - this.dimensions.marginWidth)
            .attr('y', (d) => Math.floor(d / (this.dimensions.gridSize - 1)) * this.dimensions.gridWidth)
            .attr('width', this.dimensions.marginWidth)
            .attr('height', this.dimensions.squareWidth)
            .on('mouseover', (d) => this.displayPotentialWall(d, 'V'))
            .on('mouseout', () => d3.select('#hoverRect').style('fill-opacity', 0))
            .on('click', (d) => this.selectWall(d, 'V'));

        // horizontal

        this.wallRectsGroup.selectAll('.wallRectH').data(this.rects)
            .enter()
            .append('rect')
            .classed('wallRectH', true)
            .attr('y', (d) => ((d % (this.dimensions.gridSize - 1)) + 1) * this.dimensions.gridWidth - this.dimensions.marginWidth)
            .attr('x', (d) => Math.floor(d / (this.dimensions.gridSize - 1)) * this.dimensions.gridWidth)
            .attr('height', this.dimensions.marginWidth)
            .attr('width', this.dimensions.squareWidth)
            .on('mouseover', (d) => this.displayPotentialWall(d, 'H'))
            .on('mouseout', () => d3.select('#hoverRect').style('fill-opacity', 0))
            .on('click', (d) => this.selectWall(d, 'H'));

    }


    /**
     * draw players pawn
     */
    drawPlayers() {
        let p1 = this.playersGroup.selectAll('.player1').data([this.pawns['p1']]);
        p1.enter().append('circle')
            .classed('player player1', true)
            .attr('id', 'player1')
            .merge(p1)
            .attr('cx', (d) => this.scaleX(d[0]))
            .attr('cy', (d) => this.scaleY(d[1]))
            .attr('r', this.dimensions.pawnRadius);

        let p2 = this.playersGroup.selectAll('.player2').data([this.pawns['p2']]);
        p2.enter().append('circle')
            .classed('player player2', true)
            .attr('id', 'player2')
            .merge(p2)
            .attr('cx', (d) => this.scaleX(d[0]))
            .attr('cy', (d) => this.scaleY(d[1]))
            .attr('r', this.dimensions.pawnRadius);

    }

    /**
     * draw walls
     */
    drawWalls() {
        this.wallRectsGroup.selectAll('.wallRectV')
            .classed('wall', (d) => this.walls.V.indexOf(d) !== -1);
        this.wallRectsGroup.selectAll('.wallRectH')
            .classed('wall', (d) => this.walls.H.indexOf(d) !== -1);

        let miniSquaresH = this.walls.H.filter((d) => this.walls.H.indexOf(d + 8) !== -1); // note boundary

        let minisH = this.miniSquareGroup.selectAll('.miniSquareH').data(miniSquaresH);
        minisH.enter()
            .append('rect')
            .attr('x', (d) => Math.floor(d / (this.dimensions.gridSize - 1)) * this.dimensions.gridWidth + this.dimensions.squareWidth)
            .attr('y', (d) => ((d % (this.dimensions.gridSize - 1)) + 1) * this.dimensions.gridWidth - this.dimensions.marginWidth)
            .attr('width', this.dimensions.marginWidth)
            .attr('height', this.dimensions.marginWidth)
            .classed('miniSquare miniSquareH', true);
        minisH.exit().remove();

        let miniSquaresV = this.walls.V.filter((d) => this.walls.V.indexOf(d + 8) !== -1); // note boundary

        let minisV = this.miniSquareGroup.selectAll('.miniSquareV').data(miniSquaresV);
        minisV.enter()
            .append('rect')
            .attr('y', (d) => Math.floor(d / (this.dimensions.gridSize - 1)) * this.dimensions.gridWidth + this.dimensions.squareWidth)
            .attr('x', (d) => ((d % (this.dimensions.gridSize - 1)) + 1) * this.dimensions.gridWidth - this.dimensions.marginWidth)
            .attr('width', this.dimensions.marginWidth)
            .attr('height', this.dimensions.marginWidth)
            .classed('miniSquare miniSquareV', true);
        minisV.exit().remove();
    }


    /**
     * display potential wall locations
     * @param d data
     * @param orientation H or V
     */
    displayPotentialWall(d, orientation) {

        if (!this.isTheWallValid(d, orientation))
            return;

        if (orientation === 'H') {
            // The rects are draw from top to bottom, right to left
            let diff = 0;
            if (Math.floor(d / (this.dimensions.gridSize - 1)) > this.dimensions.gridSize - 2) // if last column
                diff = -1;

            d3.select('#hoverRect')
                .attr('y', () => ((d % (this.dimensions.gridSize - 1)) + 1) * this.dimensions.gridWidth - this.dimensions.marginWidth)
                .attr('x', () => (Math.floor(d / (this.dimensions.gridSize - 1)) + diff) * this.dimensions.gridWidth)
                .attr('height', this.dimensions.marginWidth)
                .attr('width', this.dimensions.squareWidth * 2 + this.dimensions.marginWidth)
                .style('fill-opacity', 0.5);
        }

        else if (orientation === 'V') {
            // The rects are draw from right to left, top to bottom
            let diff = 0;
            if (d >= (this.dimensions.gridSize - 1) * (this.dimensions.gridSize - 1)) // if last row
                diff = -1;

            d3.select('#hoverRect')
                .attr('x', () => ((d % (this.dimensions.gridSize - 1)) + 1) * this.dimensions.gridWidth - this.dimensions.marginWidth)
                .attr('y', () => (Math.floor(d / (this.dimensions.gridSize - 1)) + diff) * this.dimensions.gridWidth)
                .attr('width', this.dimensions.marginWidth)
                .attr('height', this.dimensions.squareWidth * 2 + this.dimensions.marginWidth)
                .style('fill-opacity', 0.5);
        }
    }

    /**
     *
     * @param myData
     * @param orientation
     * @returns {boolean}
     */
    isTheWallValid(myData, orientation) {

        let self = this;

        // check whether there is already a wall at this location
        let wallElement = this.wallRectsGroup.selectAll('.wallRect' + orientation).filter(function (dd) {
            return myData === dd && d3.select(this).classed('wall');
        });
        if (wallElement.size() > 0)
            return false;

        // check whether there is wall on the extension of the location
        if (orientation === 'H') {
            wallElement = this.wallRectsGroup.selectAll('.wallRectH').filter(function (dd) {
                return myData + self.dimensions.gridSize - 1 === dd && d3.select(this).classed('wall');
            });
        }
        else if (orientation === 'V') {
            wallElement = this.wallRectsGroup.selectAll('.wallRectV').filter(function (dd) {
                return myData + self.dimensions.gridSize - 1 === dd && d3.select(this).classed('wall');
            });
        }
        if (wallElement.size() > 0)
            return false;

        // check whether there is a wall w/ different orientation intersecting
        if (orientation === 'H') {
            let d = myData;
            if (Math.floor(d / (this.dimensions.gridSize - 1)) > this.dimensions.gridSize - 2) // if the last column
                d = d - 8;
            let row = d % (self.dimensions.gridSize - 1);
            let col = Math.floor(d / (self.dimensions.gridSize - 1));
            let newData = row * (self.dimensions.gridSize - 1) + col;
            wallElement = this.wallRectsGroup.selectAll('.wallRectV').filter(function (dd) {
                // if the following location of the examined location is also a wall
                let neighbor = self.wallRectsGroup.selectAll('.wallRectV').filter(function (ddd) {
                    return ddd === dd + 8 && d3.select(this).classed('wall');
                });
                return dd === newData && d3.select(this).classed('wall') && neighbor.size() > 0;
            });
        }
        else if (orientation === 'V') {
            let d = myData;
            if (d >= (this.dimensions.gridSize - 1) * (this.dimensions.gridSize - 1))  // if not the last row
                d = d - 8;
            let col = d % (self.dimensions.gridSize - 1);
            let row = Math.floor(d / (self.dimensions.gridSize - 1));
            let newData = col * (self.dimensions.gridSize - 1) + row;
            wallElement = this.wallRectsGroup.selectAll('.wallRectH').filter(function (dd) {
                // if the following location of the examined location is also a wall
                let neighbor = self.wallRectsGroup.selectAll('.wallRectH').filter(function (ddd) {
                    return ddd === dd + 8 && d3.select(this).classed('wall');
                });
                return newData === dd && d3.select(this).classed('wall') && neighbor.size() > 0;
            });

        }

        if (wallElement.size() > 0)
            return false;

        // TODO (no blocking)
        return true;
    }

    /**
     * choose selected wall
     * @param d data
     * @param orientation H or V
     */
    selectWall(d, orientation) {

        if (!this.isTheWallValid(d, orientation))
            return;

        if (orientation === 'H') {
            // The rects are draw from top to bottom, right to left
            if (Math.floor(d / (this.dimensions.gridSize - 1)) <= this.dimensions.gridSize - 2) // if not the last column
                this.walls.H.push(d, d + this.dimensions.gridSize - 1);
            else // if last column
                this.walls.H.push(d, d - this.dimensions.gridSize + 1);
        }

        else if (orientation === 'V') {
            // The rects are draw from right to left, top to bottom
            if (d < (this.dimensions.gridSize - 1) * (this.dimensions.gridSize - 1)) // if not the last row
                this.walls.V.push(d, d + this.dimensions.gridSize - 1);
            else // if last row
                this.walls.V.push(d, d - this.dimensions.gridSize + 1);
        }
        this.drawWalls();
    }


    sayHello(name) {
        console.log(`Hello to ${name}`);
    }
}
