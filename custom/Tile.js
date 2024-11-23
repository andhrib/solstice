import {
    Node,
    Primitive,
    Texture,
    Sampler,
    Material,
    Model,
    Transform
} from '../engine/core.js';

import { loadResources } from 'engine/loaders/resources.js';

const tileSize = 0.06;

export class Tile {
    constructor(tileNodeArr, resources, { x, y }) {
        this.tileNodeArr = tileNodeArr;
        this.node = tileNodeArr[x][y];
        this.resources = resources;
        this.x = x;
        this.y = y;
        const image = (x + y) % 2 === 0 ? resources.image1 : resources.image2;
        this.node.addComponent(new Model({
            primitives: [
                new Primitive({
                    mesh: resources.mesh,
                    material: new Material({
                        baseTexture: new Texture({
                            image: image,
                            sampler: new Sampler({
                                minFilter: 'nearest',
                                magFilter: 'nearest',
                                addressModeU: 'repeat',
                            }),
                        }),
                    }),
                }),
            ],
        }));

        this.node.addComponent(new Transform({
            translation: [x * tileSize * 2, 0, y * tileSize * 2],
            scale: [tileSize, tileSize, tileSize],
        }));
    }

    // update() {
  
    // }
}