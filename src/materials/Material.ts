import { Color } from "./Color";

export class Material {

    public diffuse: any;
    public specular: Color;
    public shininess: number;

    constructor() {
        this.diffuse = new Color(0xffffff);
        this.specular = new Color(0xffffff).mulScalar(0.5);
        this.shininess = 32;
    }

}
