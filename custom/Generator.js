import {
  Node,
  Primitive,
  Texture,
  Sampler,
  Material,
  Model,
  Transform,
} from "../engine/core.js";

import { gridCenter, gridSize, tileSize } from "./gameParameters.js";

const generatorPattern = [
  [
    { x: 0, y: 0, type: "generator" },
    { x: 1, y: 0, type: "yellow" },
    { x: -1, y: 0, type: "yellow" },
  ],
  [
    { x: 0, y: 0, type: "generator" },
    { x: 0, y: 1, type: "yellow" },
    { x: 0, y: 2, type: "yellow" },
    { x: 0, y: -1, type: "yellow" },
    { x: 0, y: -2, type: "yellow" },
  ],
  [
    { x: 0, y: 0, type: "generator" },
    { x: 0, y: 1, type: "generator" },
    { x: 1, y: 0, type: "yellow" },
    { x: 2, y: 0, type: "yellow" },
    { x: -1, y: 0, type: "yellow" },
    { x: -2, y: 0, type: "yellow" },
    { x: 1, y: -1, type: "yellow" },
    { x: -1, y: -1, type: "yellow" },
    { x: 1, y: 1, type: "purple" },
    { x: 2, y: 1, type: "purple" },
    { x: -1, y: 1, type: "purple" },
    { x: -2, y: 1, type: "purple" },
    { x: 1, y: 2, type: "purple" },
    { x: -1, y: 2, type: "purple" },
  ],
];

const offsetToCamera = 1;

export class Generator {
  constructor(scene, node, tileArr, idx, gameManager) {
    this.scene = scene;
    this.node = node;
    this.tileArr = tileArr;
    this.idx = idx;
    this.gameManager = gameManager;
    this.baseTranslation = [
      offsetToCamera + gridCenter * tileSize,
      offsetToCamera,
      offsetToCamera + gridCenter * tileSize,
    ];
    if (idx == 2) {
      this.baseTranslation[2] += tileSize / 2;
    }
    this.transform = new Transform({
      translation: [...this.baseTranslation],
      scale: [tileSize, tileSize, tileSize],
    });

    this.x = gridCenter;
    this.y = gridCenter;
    this.xNext = this.x;
    this.yNext = this.y;
    this.yMax = idx == 2 ? gridSize - 1 : gridSize;
    this.moveFlag = false;
    this.status = "red";

    this.placeDownFlag = false;

    this.node.removeComponentsOfType(Transform);
    this.node.addComponent(this.transform);

    this.keyDownBind = this.handleKeyDown.bind(this);
  }

  update(t, dt) {
    if (this.moveFlag) {
      this.moveFlag = false;

      this.clearPattern();

      this.x = this.xNext;
      this.y = this.yNext;

      this.setPattern();
    }

    if (this.placeDownFlag) {
      this.placeDownFlag = false;
      if (this.status === "green") {
        this.clearPattern();
        this.placeDown();
      }
    }
  }

  clearPattern() {
    for (const gp of generatorPattern[this.idx]) {
      const x = this.x + gp.x;
      const y = this.y + gp.y;
      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        this.tileArr[x][y].setTempStatus("none");
      }
    }
  }

  setPattern() {
    this.status = "green";
    for (const gp of generatorPattern[this.idx]) {
      const x = this.x + gp.x;
      const y = this.y + gp.y;

      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        if (gp.type === "generator") {
          this.tileArr[x][y].setTempStatus("generator");
          if (this.tileArr[x][y].permaStatus !== "yellow") {
            this.status = "red";
          }
        } else {
          const tempStatus =
            this.status == "green"
              ? gp.type == "yellow"
                ? "green"
                : "darkGreen"
              : gp.type == "yellow"
              ? "red"
              : "darkRed";
          this.tileArr[x][y].setTempStatus(tempStatus);
        }
      }
    }
  }

  placeDown() {
    for (const gp of generatorPattern[this.idx]) {
      const x = this.x + gp.x;
      const y = this.y + gp.y;
      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        this.gameManager.points += this.tileArr[x][y].setPermaStatus(gp.type);
      }
    }
    //console.log(this.gameManager.points + "/" + this.gameManager.target);

    const placedModel = new Node();
    placedModel.addComponent(_.cloneDeep(this.node.getComponentOfType(Model)));
    placedModel.addComponent(_.cloneDeep(this.transform));
    this.scene.addChild(placedModel);

    this.moveFlag = true;
    this.gameManager.decrementCount();
  }

  changeParent(newParent) {
    this.node.remove();
    newParent.addChild(this.node);
  }

  handleKeyDown(event) {
    switch (event.key) {
      case "w":
        if (this.yNext > 0) {
          this.yNext--;
          this.transform.translation[2] -= tileSize;
          this.moveFlag = true;
        }
        break;
      case "a":
        if (this.xNext > 0) {
          this.xNext--;
          this.transform.translation[0] -= tileSize;
          this.moveFlag = true;
        }
        break;
      case "s":
        if (this.yNext < this.yMax - 1) {
          this.yNext++;
          this.transform.translation[2] += tileSize;
          this.moveFlag = true;
        }
        break;
      case "d":
        if (this.xNext < gridSize - 1) {
          this.xNext++;
          this.transform.translation[0] += tileSize;
          this.moveFlag = true;
        }
        break;
      case " ": {
        this.placeDownFlag = true;
      }
    }
  }

  enable() {
    if (this.count == 0) {
      return false;
    }
    this.node.enabled = true;
    this.moveFlag = true;
    this.xNext = gridCenter;
    this.yNext = gridCenter;
    this.transform.translation = [...this.baseTranslation];
    window.addEventListener("keydown", this.keyDownBind);
    //console.log("Generator enabled: " + this.idx);
    return true;
  }

  disable() {
    this.node.enabled = false;
    this.moveFlag = false;
    this.clearPattern();
    window.removeEventListener("keydown", this.keyDownBind);
    //console.log("Generator disabled: " + this.idx);
  }
}
