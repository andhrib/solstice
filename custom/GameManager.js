import { Generator } from './Generator.js';
import { GLTFLoader } from '../engine/loaders/GLTFLoader.js';

import { gridCenter } from './gameParameters.js';

export class GameManager {
    constructor() {
        this.generators = [];
        this.loader = new GLTFLoader();
        this.idx = 0;
        this.counts = [3, 2, 1];
        this.n = this.counts.length;
        this.typesLeft = this.n;
        this.points = 0;
        this.target = 13;
    }
    
    async initialize(scene, tileArr) {
        await this.loader.load("/models/generator/Generators_pack_V2.gltf");
        const generatorScene = this.loader.loadScene(this.loader.defaultScene);
        
        for (let i = 0; i < this.n; i++) {
            const generatorNode = generatorScene.children[i];
            generatorNode.enabled = false;
            const generator = new Generator(scene, generatorNode, tileArr, i, this)
            generatorNode.addComponent(generator);
            this.generators.push(generator);
        }
        for (let i = 0; i < this.n; i++) {
            this.generators[i].changeParent(scene);
        }
        
        this.generators[this.idx].enable();
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
        this.points += tileArr[gridCenter][gridCenter].setPermaStatus("yellow");
    }

    handleKeyDown(event) {
        if (this.typesLeft == 0) { 
            return;
        }
        if (event.key === "q") {
            this.generators[this.idx].disable();
            this.idx = (this.idx + 1) % this.n;
            while (this.counts[this.idx] == 0) {
                this.idx = (this.idx + 1) % this.n;
            }
            while (!this.generators[this.idx].enable()) {
                this.generators.splice(this.idx, 1);
            }
        }
        if (event.key === "e") {
            this.generators[this.idx].disable();
            this.idx = (this.idx - 1 + this.n) % this.n;
            while (this.counts[this.idx] == 0) {
                this.idx = (this.idx - 1 + this.n) % this.n;
            }
            this.generators[this.idx].enable();
        }
    }

    decrementCount() {
        this.counts[this.idx]--;
        //console.log(this.counts[this.idx]);
        if (this.counts[this.idx] == 0) {
            this.typesLeft--;
            this.generators[this.idx].disable();
            if (this.typesLeft == 0) {
                if (this.points >= this.target) {
                    console.log("You win!");
                }
                else {
                    console.log("You lose.");
                }
                return;
            }
            while (this.counts[this.idx] == 0) {
                this.idx = (this.idx + 1) % this.n;
            }
            this.generators[this.idx].enable();
        }
    }

}