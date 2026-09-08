import { Vec3 } from "./Vec3";
import type { Matrix4 } from "./Matrix4";

export class Matrix3 {
    public elements: number[] = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,
    ];

    constructor(
        _n11: number = 1, _n12: number = 0, _n13: number = 0,
        _n21: number = 0, _n22: number = 1, _n23: number = 0,
        _n31: number = 0, _n32: number = 0, _n33: number = 1 ) {
        this.elements[0] = _n11, this.elements[1] = _n12, this.elements[2] = _n13;
        this.elements[3] = _n21, this.elements[4] = _n22, this.elements[5] = _n13;
        this.elements[6] = _n31, this.elements[7] = _n32, this.elements[8] = _n33;
    }

    // generate a matrix3 from matrix4 with its top 3 and left 3 elements
    public static generateFromMat4(mat4: Matrix4): Matrix3 {
        return new Matrix3(
            mat4.elements[0], mat4.elements[1], mat4.elements[2],
            mat4.elements[4], mat4.elements[5], mat4.elements[6],
            mat4.elements[8], mat4.elements[9], mat4.elements[10],
        );
    }

    // right multiplied by vec3
    public mulVec3(vec: Vec3): Vec3 {
        return new Vec3(
            this.elements[0] * vec.x + this.elements[1] * vec.y + this.elements[2] * vec.z,
            this.elements[3] * vec.x + this.elements[4] * vec.y + this.elements[5] * vec.z,
            this.elements[6] * vec.x + this.elements[7] * vec.y + this.elements[8] * vec.z,
        );
    }
}
