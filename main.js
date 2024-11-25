import { vec3, mat4, quat } from 'glm';

import * as WebGPU from 'engine/WebGPU.js';
import { ResizeSystem } from 'engine/systems/ResizeSystem.js';
import { UpdateSystem } from 'engine/systems/UpdateSystem.js';
import { UnlitRenderer } from 'engine/renderers/UnlitRenderer.js';
import { Tile } from './custom/Tile.js';
import { GeneratorManager} from './custom/GeneratorManager.js';
import { tileSize, gridCenter, gridSize } from './custom/gameParameters.js';

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
import { GLTFLoader } from 'engine/loaders/GLTFLoader.js';

const resources = await loadResources({
    'mesh_tile': new URL('models/tile/tile.json', import.meta.url),
    'mesh_cube': new URL('models/cube/cube.json', import.meta.url),
    'image1': new URL('models/tile/Ground_Night_Diffuse1.jpg', import.meta.url),
    'image2': new URL('models/tile/Ground_Night_Diffuse2.jpg', import.meta.url),
    'glow_yellow': new URL('models/tile/glow_yellow.jpg', import.meta.url),
    'glow_red': new URL('models/tile/glow_red.jpg', import.meta.url),
    'glow_green': new URL('models/tile/glow_green.jpg', import.meta.url),
    'glow_purple': new URL('models/tile/glow_purple.jpg', import.meta.url),
});

const canvas = document.querySelector('canvas');    
const renderer = new UnlitRenderer(canvas);
await renderer.initialize();

const cameraDistance = 10;

const scene = new Node();

const camera = new Node();
let cameraPosition = [(gridCenter * tileSize) + cameraDistance, cameraDistance, (gridCenter * tileSize) + cameraDistance];
let cameraRotation = quat.fromEuler(quat.create(), -Math.asin(1 / Math.sqrt(3)) * (180 / Math.PI), 45, 0)
camera.addComponent(new Transform({
    translation: cameraPosition,
    rotation: cameraRotation,
}))
camera.addComponent(new Camera({
    orthographic: 1, 
}));
scene.addChild(camera);

// Create a 2D array of tiles
const tileArr = Array.from({ length: gridSize }, (_, x) => (Array.from({ length: gridSize }, (_, y) => {
    const node = new Node();
    const tile = new Tile(node, resources, { x, y });
    node.addComponent(tile);
    scene.addChild(node);
    return tile;
})));
tileArr[gridCenter][gridCenter].setPermaStatus("yellow");


const generatorManager = new GeneratorManager();
await generatorManager.initialize(scene, resources, tileArr);

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