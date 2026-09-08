import { Matrix4 } from "../math/Matrix4";
import { _Math } from "../math/Math";
import { Material } from "../materials/Material";

export class Object3D {

    public type: string;
    public wireframe: boolean;
    public uuid: string;

    public modelMatrix: Matrix4;

    public material?: Material;

    constructor(_type: string = "Object3D") {
        this.type = _type;
        this.wireframe = false;
        this.uuid = _Math.generateUUID();
        this.modelMatrix = Matrix4.createUnitMat4();
    }
}
