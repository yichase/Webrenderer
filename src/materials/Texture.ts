export class Texture {

    public diffuse?: ImageData;
    public specular?: ImageData;
    public type: string;

    constructor(diffuse?: ImageData, specular?: ImageData) {
        this.diffuse = diffuse;
        this.specular = specular;
        this.type = "Texture";
    }

}
