import { WebRenderer } from "../WebRenderer";
import { Scene } from "../Scene";
import { Camera } from "../Camera";
import { Box } from "../Object3D/Box";
import { Color } from "../materials/Color";
import { Vec3 } from "../math/Vec3";
import { _Math } from "../math/Math";

export class ExampleColorfulRectangle {
    public static main() {
        var canvas = document.getElementById("canvas") as HTMLCanvasElement;
        var width = window.innerWidth;
        var height = window.innerHeight;
        var renderer = new WebRenderer(canvas, width, height);

        var scene = new Scene();
        var camera = new Camera(_Math.radians(45.0), width/height, 10, 80000);
        camera.lookAt(new Vec3(2400, 1600, 4000), new Vec3(0, 0, 0), new Vec3(0, 1, 0));

        var box = new Box(800, 800, 800);
        box.setVertexColor(0, new Color(0xff0000));
        box.setVertexColor(1, new Color(0x00ff00));
        box.setVertexColor(2, new Color(0x0000ff));
        box.setVertexColor(3, new Color(0xffff00));

        box.setVertexColor(4, new Color(0xff00ff));
        box.setVertexColor(5, new Color(0x00ffff));
        box.setVertexColor(6, new Color(0xffffff));
        box.setVertexColor(7, new Color(0x000000));
        scene.addChild(box);

        var enableAnimate = true;
        canvas.onclick = function () {
            enableAnimate = !enableAnimate;
        };

        animate();

        function animate() {
            if (enableAnimate) {
                box.rotation.x += 0.01;
                box.rotation.z += 0.02;
            }

            renderer.renderScene(scene, camera);

            requestAnimationFrame(animate);
        }
    }
}
