import { Color } from "./materials/Color";
import { Vec3 } from "./math/Vec3";
import { _Math } from "./math/Math";
import { MAX_DEPTH } from "./constants";

export class Vertex {

    public position: Vec3;
    public color: Color;
    public depth: number;

    constructor(x: number = 0, y: number = 0, z: number = 0, color?: Color) {
        this.position = new Vec3(x, y, z);
        if (color === undefined) {
            this.color = new Color(0xffffff);
        } else {
            this.color = color;
        }
        this.depth = MAX_DEPTH;
    }

    public interp(other: Vertex, t: number) {
        var position = this.position.interp(other.position, t);
        var color = this.color.interp(other.color, t);
        var depth = _Math.interp(this.depth, other.depth, t);
        var result = new Vertex(position.x, position.y, position.z, color);
        result.depth = depth;
        return result;
    }

    public swap(v: Vertex) {
        this.position.swap(v.position);
        this.color.swap(v.color);
        var tmp = this.depth;
        this.depth = v.depth;
        v.depth = tmp;
    }

    public clone(): Vertex {
        var v = new Vertex(this.position.x, this.position.y, this.position.z, this.color.clone());
        v.depth = this.depth;
        return v;
    }
}

// y     v3    v2  v3
// 0x  v1  v2    v1
export function sortTriangleVertex(v1: Vertex, v2: Vertex, v3: Vertex) {
    if (v1.position.y > v2.position.y || (v1.position.y == v2.position.y && v1.position.x > v2.position.x)) {
        v1.swap(v2);
    }
    if (v2.position.y > v3.position.y || (v2.position.y == v3.position.y && v2.position.x > v3.position.x)) {
        v2.swap(v3);
    }
    if (v1.position.y > v2.position.y || (v1.position.y == v2.position.y && v1.position.x > v2.position.x)) {
        v1.swap(v2);
    }
}
