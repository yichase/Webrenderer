import { Object3D } from "./Object3D/AObject3D";
import { Light } from "./materials/Light";

export class Scene {

    public children: Object3D[];

    public light?: Light;

    constructor() {
        this.children = [];
    }

    public addChild(object: Object3D) {
        this.children.push(object);
    }

    public removeChild(object: Object3D) {
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].uuid == object.uuid) {
                this.children.splice(i, 1);
                break;
            }
        }
    }
}
