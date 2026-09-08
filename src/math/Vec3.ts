import { _Math } from "./Math";

export class Vec3 {

    public x: number;
    public y: number;
    public z: number;

    constructor(_x: number = 0, _y: number = 0, _z: number = 0) {
        this.x = _x;
        this.y = _y;
        this.z = _z;
    }

    public set(_x: number, _y: number, _z: number) {
        this.x = _x;
        this.y = _y;
        this.z = _z;
        return this;
    }

    public clone() {
        return new Vec3(this.x, this.y, this.z);
    }

    public swap(v: Vec3) {
        var tmp = v.clone();
        v.x = this.x;
        v.y = this.y;
        v.z = this.z;
        this.x = tmp.x;
        this.y = tmp.y;
        this.z = tmp.z;
    }

    public interp(v: Vec3, t: number): Vec3 {
        var x = _Math.interp(this.x, v.x, t);
        var y = _Math.interp(this.y, v.y, t);
        var z = _Math.interp(this.z, v.z, t);
        return new Vec3(x, y, z);
    }

    public add(v: Vec3) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    public addScalar(s: number) {
        this.x += s;
        this.y += s;
        this.z += s;
        return this;
    }

    public mulScalar(s: number) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    public dotVec3(v: Vec3): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    public mulVec3(v: Vec3): Vec3 {
        var res = new Vec3();
        res.x = this.x * v.x;
        res.y = this.y * v.y;
        res.z = this.z * v.z;
        return res;
    }

    public normalize(): Vec3 {
        let tmp = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        if (tmp === 0) {
            console.warn("WebRender.Vec3: zero vector; normilize failed.");
            return this;
        }
        this.x /= tmp;
        this.y /= tmp;
        this.z /= tmp;
        return this;
    }

    public round(): Vec3 {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);
        return this;
    }

    // return a vector (self - vec)
    public substract(vec: Vec3): Vec3 {
        var res = new Vec3();
        res.x = this.x - vec.x;
        res.y = this.y - vec.y;
        res.z = this.z - vec.z;
        return res;
    }

    public cross(vec: Vec3): Vec3 {
        var ax = this.x, ay = this.y, az = this.z;
        var bx = vec.x, by = vec.y, bz = vec.z;

        var res = new Vec3();

        res.x = ay * bz - az * by;
        res.y = az * bx - ax * bz;
        res.z = ax * by - ay * bx;

        return res;
    }

    public lengthSq() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
}
