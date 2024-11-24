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

const offsetToCamera = 10;
const glowSize = 0.5;

export class TileShine {
    constructor(node, resources) {
        this.node = node;
        this.resources = resources;
        this.permaStatus = "none";
        this.tempStatus = "none";
        this.node.enabled = false;
        this.glow = {
            "yellow": resources.glow_yellow,
            "purple": resources.glow_purple,
            "red": resources.glow_red,
            "green": resources.glow_green,
        }
        this.material = new Material({
            baseTexture: new Texture({
                image: resources.glow_yellow,
                sampler: new Sampler({
                    minFilter: 'nearest',
                    magFilter: 'nearest',
                    addressModeU: 'repeat',
                }),
            }),
        })
        this.node.addComponent(new Model({ 
            primitives: [
                new Primitive({
                    mesh: resources.mesh_tile,
                    material: this.material,
                }),
            ],
        }));
        this.node.addComponent(new Transform({
            translation: [offsetToCamera, offsetToCamera, offsetToCamera],
            scale: [glowSize, glowSize, glowSize],
            rotation: quat.fromEuler(quat.create(), 0, 45, 0),
        }));
    }

    changeTempStatus(status) {
        switch (status) {
            case "none":
                switch (this.permaStatus) {
                    case "none":
                    case "built":
                        this.node.enabled = false;
                        break;
                    case "yellow":
                        this.material = this.glow.yellow;
                        break;
                    case "purple":
                        this.material = this.glow.purple;
                        break;
                    default:
                        console.log("Invalid status");
                        break;
                }
                this.tempStatus = "none";
                break;
            case "red":
                this.node.enabled = true;
                this.material = this.glow.red;
                this.tempStatus = "red";
                break;
            case "green":
                this.node.enabled = true;
                this.material = this.glow.green;
                this.tempStatus = "green";
                break;
            default:
                console.log("Invalid status");
                break;
        }
    }

    setPermaStatus(status) {
        switch (status) {
            case "built":
                this.node.enabled = false;
                this.permaStatus = "built";
                break;
            case "yellow":
                this.node.enabled = true;
                this.material = this.glow.yellow;
                this.permaStatus = "yellow";
                break;
            case "purple":
                this.node.enabled = true;
                this.material = this.glow.purple;
                this.permaStatus = "purple";
                break;
            default:
                console.log("Invalid status");
                break;
        }
    }
}