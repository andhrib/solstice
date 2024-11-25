import { Generator } from './Generator.js';
import { GLTFLoader } from '../engine/loaders/GLTFLoader.js';

export class GeneratorManager {
    constructor() {
        this.generators = [];
        this.loader = new GLTFLoader();
        this.idx = 0;

    }
    
    async initialize(scene, resources, tileArr) {
        await this.loader.load("/models/generator/Generators_pack_V2.gltf");
        const generatorScene = this.loader.loadScene(this.loader.defaultScene);
        const n = generatorScene.children.length;
        
        for (let i = 0; i < n; i++) {
            const generatorNode = generatorScene.children[i];
            generatorNode.enabled = false;
            const generator = new Generator(generatorNode, resources, tileArr, i)
            generatorNode.addComponent(generator);
            this.generators.push(generator);
        }
        for (let i = 0; i < n; i++) {
            this.generators[i].changeParent(scene);
        }
        
        this.generators[this.idx].enable();
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
    }

    handleKeyDown(event) {
        if (event.key === "q") {
            this.generators[this.idx].disable();
            this.idx = (this.idx + 1) % this.generators.length;
            this.generators[this.idx].enable();
        }
        if (event.key === "e") {
            this.generators[this.idx].disable();
            this.idx = (this.idx - 1 + this.generators.length) % this.generators.length;
            this.generators[this.idx].enable();
        }
    }

}