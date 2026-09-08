import { Vec3 } from "./Vec3";

export class Vec4 {
    public x: number;
    public y: number;
    public z: number;
    public w: number;

    constructor(_x: number = 0, _y: number = 0, _z: number = 0, _w: number = 0) {
        this.x = _x;
        this.y = _y;
        this.z = _z;
        this.w = _w;
    }

    public set(_x: number, _y: number, _z: number, _w: number = 1): Vec4 {
        this.x = _x;
        this.y = _y;
        this.z = _z;
        this.w = _w;
        return this;
    }

    public setVec3(v: Vec3, _w = 1): Vec4 {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        this.w = _w;
        return this;
    }

    public getVec3(): Vec3 {
        return new Vec3(this.x, this.y, this.z);
    }

    public clone() {
        return new Vec4(this.x, this.y, this.z, this.w);
    }

    public add(v: Vec4): Vec4 {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        this.w += v.w;
        return this;
    }

    public addScalar(s: number): Vec4 {
        this.x += s;
        this.y += s;
        this.z += s;
        this.w += s;
        return this;
    }

    public mulScalar(s: number): Vec4 {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        this.w *= s;
        return this;
    }

}
