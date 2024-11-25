import {
    Node,
    Primitive,
    Texture,
    Sampler,
    Material,
    Model,
    Transform
} from '../engine/core.js';

import { gridCenter, gridSize, tileSize } from './gameParameters.js';

const generatorPattern = [
    [
        {x: 0, y: 0, type: "generator"},
        {x: 1, y: 0, type: "yellow"},
        {x: -1, y: 0, type: "yellow"},
    ],
    [
        {x: 0, y: 0, type: "generator"},
        {x: 0, y: 1, type: "yellow"},
        {x: 0, y: 2, type: "yellow"},
        {x: 0, y: -1, type: "yellow"},
        {x: 0, y: -2, type: "yellow"},
    ],
    [
        {x: 0, y: 0, type: "generator"},
        {x: 0, y: 1, type: "generator"},
        {x: 1, y: 0, type: "yellow"},
        {x: 2, y: 0, type: "yellow"},
        {x: -1, y: 0, type: "yellow"},
        {x: -2, y: 0, type: "yellow"},
        {x: 1, y: -1, type: "yellow"},
        {x: -1, y: -1, type: "yellow"},
        {x: 1, y: 1, type: "purple"},
        {x: 2, y : 1, type: "purple"},
        {x: -1, y: 1, type: "purple"},
        {x: -2, y: 1, type: "purple"},
        {x: 1, y: 2, type: "purple"},
        {x: -1, y: 2, type: "purple"},

    ],
];

const offsetToCamera = 1;
const baseTranslation = [offsetToCamera + gridCenter * tileSize, offsetToCamera, offsetToCamera + gridCenter * tileSize];

export class Generator {
    constructor(node, resources, tileArr, idx) {
        this.node = node;
        this.tileArr = tileArr;
        this.idx = idx;
        this.x = gridCenter;
        this.y = gridCenter;
        this.xNext = this.x;
        this.yNext = this.y;
        this.yMax = (idx == 2) ? gridSize - 1 : gridSize;
        this.needUpdate = true;

        this.transform = new Transform({
            translation: baseTranslation,
            scale: [tileSize, tileSize, tileSize],
        });

        this.material = node.getComponentOfType(Material);

        this.node.removeComponentsOfType(Transform);
        this.node.addComponent(this.transform);

        window.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    update(t, dt) {
        if (this.needUpdate) {
            this.needUpdate = false;
            
            for (const gp of generatorPattern[this.idx]) {
                const x = this.x + gp.x;
                const y = this.y + gp.y;
                if (x >= 0 && x < gridSize && y >= 0 && y < this.yMax) {
                    this.tileArr[x][y].setTempStatus("none");
                }
            }

            let color = "green";
            for (const gp of generatorPattern[this.idx]) {
                const xNext = this.xNext + gp.x;
                const yNext = this.yNext + gp.y;

                if (xNext >= 0 && xNext < gridSize && yNext >= 0 && yNext < this.yMax) {
                    if (gp.type == "generator") {
                        this.tileArr[xNext][yNext].setTempStatus("generator");
                        if ( this.tileArr[xNext][yNext].getPermaStatus() !== "yellow") {
                            color = "red";
                        }
                    }
                    else {
                        this.tileArr[xNext][yNext].setTempStatus(color);
                    }
                }
            }

            this.x = this.xNext;
            this.y = this.yNext;
        }
    }

    handleKeyDown(event) {
        switch (event.key) {
            case 'w':
                if (this.yNext > 0) {
                    this.yNext--;
                    this.transform.translation[2] -= tileSize;
                    this.needUpdate = true;
                }
                break;
            case 'a':
                if (this.xNext > 0) {
                    this.xNext--;
                    this.transform.translation[0] -= tileSize;
                    this.needUpdate = true;
                }
                break;
            case 's':
                if (this.yNext < this.yMax - 1) {
                    this.yNext++;
                    this.transform.translation[2] += tileSize;
                    this.needUpdate = true;
                }
                break;
            case 'd':
                if (this.xNext < gridSize - 1) {
                    this.xNext++;
                    this.transform.translation[0] += tileSize;
                    this.needUpdate = true;
                }
                break;
        }
    }

}