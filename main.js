import { quat } from 'glm';
import { ResizeSystem } from 'engine/systems/ResizeSystem.js';
import { UpdateSystem } from 'engine/systems/UpdateSystem.js';
import { UnlitRenderer } from 'engine/renderers/UnlitRenderer.js';
import { Tile } from './src/Tile.js';
import { GameManager } from './src/GameManager.js';
import { gridSize, gridOffset } from './src/gameParameters.js';

import {
    Camera,
    Node,
    Transform,
} from 'engine/core.js';

import { loadResources } from 'engine/loaders/resources.js';

const resources = await loadResources({
    'mesh_tile': new URL('models/tile/tile.json', import.meta.url),
    'image1': new URL('models/tile/Ground_Night_Diffuse1.jpg', import.meta.url),
    'image2': new URL('models/tile/Ground_Night_Diffuse2.jpg', import.meta.url),
    'image3': new URL('models/tile/Ground_Night_Diffuse3.jpg', import.meta.url),
    'image4': new URL('models/tile/Ground_Night_Diffuse4.jpg', import.meta.url),
    'glow_base': new URL('models/tile/glow_base.jpg', import.meta.url),
});

const canvas = document.querySelector('canvas');    
const renderer = new UnlitRenderer(canvas);
await renderer.initialize();

const cameraDistance = 10;

const scene = new Node();

const camera = new Node();
let cameraPosition = [gridOffset + cameraDistance, cameraDistance, gridOffset + cameraDistance];
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

const generatorManager = new GameManager();
await generatorManager.initialize(scene, tileArr);

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