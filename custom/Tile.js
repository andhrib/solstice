import {
    Node,
    Primitive,
    Texture,
    Sampler,
    Material,
    Model,
    Transform
} from '../engine/core.js';

import { quat } from '../lib/glm.js';

import { tileSize, colors } from './gameParameters.js';

const offsetToCamera = 10;
const glowSize = 0.5;

export class Tile {
    constructor(node, resources, { x, y }) {
        this.node = node;
        const image = (x + y) % 2 == 0 ? ((x + y) % 4 == 0 ? resources.image1 : resources.image3) : ((x + y) % 4 == 1 ? resources.image2 : resources.image4);
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
        
        this.material = new Material({
            baseTexture: new Texture({
                image: resources.glow_base,
                sampler: new Sampler({
                    minFilter: 'nearest',
                    magFilter: 'nearest',
                    addressModeU: 'repeat',
                }),
                baseFactor: colors.yellow,
            }),
        }),

        this.tileShineNode = new Node(false);
        this.tileShineNode.addComponent(new Model({ 
            primitives: [
                new Primitive({
                    mesh: resources.mesh_tile,
                    material: this.material,
                }),
            ],
        }));
        this.tileShineNode.addComponent(new Transform({
            translation: [offsetToCamera, offsetToCamera, offsetToCamera],
            scale: [glowSize, glowSize, glowSize],
            rotation: quat.fromEuler(quat.create(), 0, 45, 0),
        }));

        this.node.addChild(this.tileShineNode);

        this.permaStatus = "none";
        this.tempStatus = "none";
    }

    setTempStatus(status) {
        switch (status) {
            case "generator":
                this.tempStatus = "generator";
                this.tileShineNode.enabled = false;
                break;
            case "none":
                switch (this.permaStatus) {
                    case "none":
                    case "generator":
                        this.tileShineNode.enabled = false;
                        break;
                    case "yellow":
                        this.material.baseFactor = colors.yellow;
                        this.tileShineNode.enabled = true;
                        break;
                    case "purple":
                        this.material.baseFactor = colors.purple;
                        this.tileShineNode.enabled = true;
                        break;
                    default:
                        console.log("Invalid status");
                        break;
                }
                this.tempStatus = "none";
                break;
            case "red":
                this.material.baseFactor = colors.red;
                this.tileShineNode.enabled = true;
                this.tempStatus = "red";
                break;
            case "green":
                this.material.baseFactor = colors.green;
                this.tileShineNode.enabled = true;
                this.tempStatus = "green";
                break;
            case "darkGreen":
                this.material.baseFactor = colors.darkGreen;
                this.tileShineNode.enabled = true;
                this.tempStatus = "darkGreen";
                break;
            case "darkRed":
                this.material.baseFactor = colors.darkRed;
                this.tileShineNode.enabled = true;
                this.tempStatus = "darkRed";
                break;
            default:
                console.log("Invalid status");
                break;
        }
    }

    setPermaStatus(status) {
        if (this.permaStatus == "generator") {
            return 0;
        }
        let pointChange = 0;
        switch (status) {
            case "generator":
                this.tileShineNode.enabled = false;
                this.permaStatus = "generator";
                pointChange = -1;
                break;
            case "yellow":
                if (this.permaStatus == "none") {
                    this.material.baseFactor = colors.yellow;
                    this.tileShineNode.enabled = true;
                    pointChange = 1;
                    this.permaStatus = "yellow";
                }
                break;
            case "purple":
                this.material.baseFactor = colors.purple;
                this.tileShineNode.enabled = true;
                pointChange = (this.permaStatus == "yellow") ? -1 : 0;
                this.permaStatus = "purple";
                break;
            default:
                console.log("Invalid status");
                break;
        }

        return pointChange;
    }

}