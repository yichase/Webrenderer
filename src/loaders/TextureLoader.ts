import { Texture } from "../materials/Texture";
import { ImageLoader } from "./ImageLoader";

export class TextureLoader {
    private texture: Texture;

    constructor() {
        this.texture = new Texture();
    }

    public static createTexture() {
        return new TextureLoader();
    }

    public loadDiffuse(url: string) {
        var self = this;
        ImageLoader.load(url, function(data: ImageData) {
            self.texture.diffuse = data;
            console.log("WebRenderer.TextureLoader: load diffuse texture asset.");
        });
        return this;
    }

    public loadSpecular(url: string) {
        var self = this;
        ImageLoader.load(url, function(data: ImageData) {
            self.texture.specular = data;
            console.log("WebRenderer.TextureLoader: load specular texture asset.");
        });
        return this;
    }

    public getTexture() {
        return this.texture;
    }
}
