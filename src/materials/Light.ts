import { Color } from "./Color";
import { Vec3 } from "../math/Vec3";

export class Light {

    public static POINT_LIGHT: string = "point_light";
    public static DIRECTION_LIGHT: string = "direction_light";

    public pos: Vec3;
    public lightColor: Color;
    // Only needed when the light is direction light.
    public dir: Vec3;

    public ambient: Vec3;
    public diffuse: Vec3;
    public specular: Vec3;

    public type: string;

    constructor(lightColor: Color, type?: string) {
        this.pos = new Vec3();
        this.dir = new Vec3(0, 0, -1);
        this.lightColor = lightColor;

        if (type === undefined) {
            type = Light.POINT_LIGHT;
        }
        this.type = type;

        this.ambient = new Vec3(0.2, 0.2, 0.2);
        this.diffuse = new Vec3(0.5, 0.5, 0.5);
        this.specular = new Vec3(1.0, 1.0, 1.0);
    }

}
