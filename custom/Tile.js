import {
    Node,
    Primitive,
    Texture,
    Sampler,
    Material,
    Model,
    Transform
} from '../engine/core.js';

import { TileShine } from './TileShine.js';

export const tileSize = 0.12;

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
                    mesh: resources.mesh_tile,
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
            translation: [x * tileSize, 0, y * tileSize],
            scale: [tileSize, tileSize, tileSize],
        }));

        this.tileShineNode = new Node();
        this.tileShine = new TileShine(this.tileShineNode, resources);
        this.tileShineNode.addComponent(this.tileShine);
        this.node.addChild(this.tileShineNode);
    }

    changeTempStatus(status) {
        this.tileShine.changeTempStatus(status);
    }

    setPermaStatus(status) {
        this.tileShine.setPermaStatus(status);
    }

    // update() {
  
    // }
}