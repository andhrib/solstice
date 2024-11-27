import { Generator } from "./Generator.js";
import { GLTFLoader } from "../engine/loaders/GLTFLoader.js";

import { gridCenter } from "./gameParameters.js";

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
      const generator = new Generator(scene, generatorNode, tileArr, i, this);
      generatorNode.addComponent(generator);
      this.generators.push(generator);
    }
    for (let i = 0; i < this.n; i++) {
      this.generators[i].changeParent(scene);
    }

    this.generators[this.idx].enable();
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.points += tileArr[gridCenter][gridCenter].setPermaStatus("yellow");

    //UI
    this.element = document.getElementById("b1");
    if (this.element) {
      this.element.addEventListener("click", () => this.selectBuilding(0));
    }
    this.element = document.getElementById("b2");
    if (this.element) {
      this.element.addEventListener("click", () => this.selectBuilding(1));
    }
    this.element = document.getElementById("b3");
    if (this.element) {
      this.element.addEventListener("click", () => this.selectBuilding(2));
    }

    this.updateUI();
  }

  selectBuilding(id) {
    if (this.counts[id] > 0) {
      this.generators[this.idx].disable();
      this.idx = id;
      this.generators[this.idx].enable();
    }
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
          document.getElementById("end-screen").style.display = "block";
          document.getElementById("end-message").innerHTML = "You win!";
        } else {
          document.getElementById("end-screen").style.display = "block";
          document.getElementById("end-message").innerHTML = "You lose!";
        }
        this.updateUI();
        return;
      }
      while (this.counts[this.idx] == 0) {
        this.idx = (this.idx + 1) % this.n;
      }
      this.generators[this.idx].enable();
    }
    this.updateUI();
  }

  updateUI() {
    document.getElementById("b1-count").innerHTML = this.counts[0];
    if (this.counts[0] < 1) {
      document.getElementById("b1").classList.add("disabled");
    }
    document.getElementById("b2-count").innerHTML = this.counts[1];
    if (this.counts[1] < 1) {
      document.getElementById("b2").classList.add("disabled");
    }
    document.getElementById("b3-count").innerHTML = this.counts[2];
    if (this.counts[2] < 1) {
      document.getElementById("b3").classList.add("disabled");
    }

    document.getElementById("light-count").innerHTML =
      this.points + "/" + this.target;
  }
}
