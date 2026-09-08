export class ImageLoader {

    /**
     * load image from url
     * after image is loaded, execute callback function
     */
    public static load(url: string, callback: (data: ImageData) => void) {
        var imageContainer = document.createElement("img");
        imageContainer.src = url;

        imageContainer.onload = function () {
            console.log("WebRenderer.ImageLoader: load image ", imageContainer.src, " success.");
            var canvas = document.createElement("canvas");
            canvas.width = imageContainer.width;
            canvas.height = imageContainer.height;

            var ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
            ctx.drawImage(imageContainer, 0, 0);

            var data = ctx.getImageData(0, 0, imageContainer.width, imageContainer.height);
            callback(data);
        };
    }

}
