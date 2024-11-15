import { mat4, quat } from 'glm';

import * as WebGPU from 'engine/WebGPU.js';
import { ResizeSystem } from 'engine/systems/ResizeSystem.js';
import { UpdateSystem } from 'engine/systems/UpdateSystem.js';
import { UnlitRenderer } from 'engine/renderers/UnlitRenderer.js';

import {
    Camera,
    Material,
    Model,
    Node,
    Primitive,
    Sampler,
    Texture,
    Transform,
} from 'engine/core.js';

import { loadResources } from 'engine/loaders/resources.js';

const resources = await loadResources({
    'mesh': new URL('models/tile/tile.json', import.meta.url),
    'image1': new URL('models/tile/solstice_dusk.jpg', import.meta.url),
    'image2': new URL('models/tile/solstice_night.jpg', import.meta.url),
});

const canvas = document.querySelector('canvas');
const renderer = new UnlitRenderer(canvas);
await renderer.initialize();

const scene = new Node();

const camera = new Node();
let cameraPosition = [1, 1, 1];
let cameraRotation = quat.create();
quat.rotateY(cameraRotation, cameraRotation, Math.PI / 4);
quat.rotateX(cameraRotation, cameraRotation, -Math.PI / 4);
camera.addComponent(new Transform({
    translation: cameraPosition,
    rotation: cameraRotation,
}))
camera.addComponent(new Camera({
    orthographic: 1, 
}));
scene.addChild(camera);

const tile = new Node();
tile.addComponent(new Transform({
    scale: [0.05, 0.05, 0.05],
}));
tile.addComponent(new Model({
    primitives: [
        new Primitive({
            mesh: resources.mesh,
            material: new Material({
                baseTexture: new Texture({
                    image: resources.image1,
                    sampler: new Sampler({
                        minFilter: 'nearest',
                        magFilter: 'nearest',
                        addressModeU: 'repeat',
                        addressModeV: 'repeat',
                    }),
                }),
            }),
        }),
    ],
}));
scene.addChild(tile);

function update(t, dt) {
    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(t, dt);
        }
    });
}

function render() {
    renderer.render(scene, camera);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();