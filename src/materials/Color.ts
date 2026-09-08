import { _Math } from "../math/Math";
import { Vec3 } from "../math/Vec3";

export class Color {

    public r: number = 0;
    public g: number = 0;
    public b: number = 0;

    public type: string = "Color";

    constructor(r: any, g?: any, b?: any) {
        if (g === undefined && b === undefined) {
            this.set(r);
        } else {
            this.setRGB(r, g, b);
        }
    }

    public setRGB(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    public set(value: any) {
        if (typeof value === "number") {
            this.setHex(value);
        }
    }

    public setHex(hex: number) {
        hex = Math.floor(hex);
        this.r = hex >> 16 & 255;
        this.g = hex >> 8 & 255;
        this.b = hex & 255;
    }


    public interp(c: Color, t: number): Color {
        var iR = Math.round(_Math.interp(this.r, c.r, t));
        var iG = Math.round(_Math.interp(this.g, c.g, t));
        var iB = Math.round(_Math.interp(this.b, c.b, t));
        return new Color(iR, iG, iB);
    }

    public clone(): Color {
        return new Color(this.r, this.g, this.b);
    }

    public swap(c: Color) {
        var tmp = c.clone();
        c.r = this.r;
        c.g = this.g;
        c.b = this.b;
        this.r = tmp.r;
        this.g = tmp.g;
        this.b = tmp.b;
    }

    public mulScalar(s: number): Color {
        this.r *= s;
        this.g *= s;
        this.b *= s;
        return this;
    }

    public mulVec3(v: Vec3): Color {
        var result = new Color(0xffffff);
        result.r = this.r * v.x;
        result.g = this.g * v.y;
        result.b = this.b * v.z;
        return result;
    }

    public mul(c: Color): Color {
        var max = 255;
        var result = new Color(0xffffff);
        result.r = this.r*c.r/max;
        result.g = this.g*c.g/max;
        result.b = this.b*c.b/max;
        return result;
    }

    public normalize(): Vec3 {
        var max = 255.0;
        return new Vec3(this.r / max, this.g / max, this.b / max);
    }
}
