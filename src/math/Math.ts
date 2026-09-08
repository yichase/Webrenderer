import { Vec3 } from "./Vec3";

export class _Math {

    public static interp(x1: number, x2: number, t: number): number {
        return x1 + (x2 - x1) * t;
    }

    public static radians(angle: number): number {
        return angle / 180.0 * Math.PI;
    }

    public static generateUUID(): string {
        var lut: string[] = [];

        for (var i = 0; i < 256; i++) {
            lut[i] = (i < 16 ? "0" : "") + i.toString(16);
        }

        var d0 = Math.random() * 0xffffffff | 0;
        var d1 = Math.random() * 0xffffffff | 0;
        var d2 = Math.random() * 0xffffffff | 0;
        var d3 = Math.random() * 0xffffffff | 0;
        var uuid = lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + "-" +
            lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + "-" + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + "-" +
            lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + "-" + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
            lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];

        return uuid.toUpperCase();
    }

    public static getRelectVec(inVec: Vec3, norVec: Vec3): Vec3 {
        if (inVec.lengthSq() === 0 || norVec.lengthSq() === 0) {
            console.log("WebRenderer._Math.getReflectVec: in vec or normal vec is zero vector.");
            return inVec;
        }

        inVec.normalize();
        norVec.normalize();

        let cosA = inVec.x * norVec.x + inVec.y * norVec.y + inVec.z * norVec.z;
        let len = 2 * 1 * cosA;
        var outVec = new Vec3(
            inVec.x + norVec.x * len,
            inVec.y + norVec.y * len,
            inVec.z + norVec.z * len
        );

        outVec.normalize();

        return outVec;
    }

}
