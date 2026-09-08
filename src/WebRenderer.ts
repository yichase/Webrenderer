import { Color } from "./materials/Color";
import { Light } from "./materials/Light";
import { Material } from "./materials/Material";
import { Texture } from "./materials/Texture";
import { Vec3 } from "./math/Vec3";
import { _Math } from "./math/Math";
import { Box } from "./Object3D/Box";
import { Scene } from "./Scene";
import { Camera } from "./Camera";
import { Vertex, sortTriangleVertex } from "./Vertex";
import { MAX_DEPTH } from "./constants";

export class WebRenderer {

    private ctx: CanvasRenderingContext2D;
    public bufferData: ImageData;
    private width: number;
    private height: number;

    public enableZBuffer: boolean = true;
    private depthBuffer: number[] = [];

    public static MAX_DEPTH: number = MAX_DEPTH;

    constructor(_canvas: HTMLCanvasElement, width: number, height: number) {
        _canvas.width = width;
        _canvas.height = height;
        this.ctx = _canvas.getContext("2d") as CanvasRenderingContext2D;
        this.bufferData = this.ctx.createImageData(width, height);
        this.width = width;
        this.height = height;
        this.clearBuffer();
    }

    public clearBuffer() {
        var index = 0;
        var data = this.bufferData.data;
        this.depthBuffer = [];
        for (var h = 0; h < this.height; h++) {
            for (var w = 0; w < this.width; w++) {
                index = (h * this.width + w) * 4;
                data[index] = 0;
                data[index+1] = 0;
                data[index+2] = 0;
                data[index+3] = 255;
                this.depthBuffer[h * this.width + w] = WebRenderer.MAX_DEPTH;
            }
        }
        
    }

    public render() {
        this.ctx.putImageData(this.bufferData, 0, 0);
    }

    public renderScene(scene: Scene, camera: Camera) {
        this.clearBuffer();
        for (var obj of scene.children) {
            if (obj.type == "Box") {
                this.drawBox(obj as Box, camera, scene.light);
            } else {
                console.warn("WebRenderer.renderScene: Only drawBox available.");
            }
        }
        this.render();
    }

    public drawPixel(x: number, y: number, color: Color, alpha = 1.0, depth?: number) {
        if (x > this.width || y > this.height || x < 0 || y < 0) {
            return;
        }
        x = Math.round(x); y = Math.round(y);
        if (this.enableZBuffer) {
            if (depth === undefined) {
                depth = WebRenderer.MAX_DEPTH;
            }

            if (depth > this.depthBuffer[y * this.width + x]) {
                return;
            }
            this.depthBuffer[y * this.width + x] = depth;
        }
        var index = (y * this.width + x) * 4;
        var data = this.bufferData.data;
        data[index] = color.r;
        data[index + 1] = color.g;
        data[index + 2] = color.b;
        data[index + 3] = 255 * alpha;
    }

    public drawLine(_v1: Vertex, _v2: Vertex) {
        var v1 = _v1.clone();
        var v2 = _v2.clone();
        var x1 = v1.position.x;
        var y1 = v1.position.y;
        var x2 = v2.position.x;
        var y2 = v2.position.y;
        var dx = Math.abs(x2 - x1);
        var dy = Math.abs(y2 - y1);
        if (dx >= dy) {
            if (x1 > x2) {
                var tmp = x1;
                x1 = x2; x2 = tmp;
                tmp = y1; y1 = y2; y2 = tmp;
                v1.color.swap(v2.color);
            }
            var flag = y2 >= y1 ? 1 : -1;
            var k = flag * (dy << 1);
            var e = -dx * flag;
            for (var x = x1, y = y1; x <= x2; x++) {
                var t = (x-x1) / (x2-x1);
                var color = v1.color.interp(v2.color, t);
                var depth = _Math.interp(v1.depth, v2.depth, t);
                this.drawPixel(x, y, color, 1.0, depth);
                e += k;
                if (flag * e > 0) {
                    y += flag;
                    e -= 2 * dx * flag;
                }
            }
        } else {
            if (y1 > y2) {
                var tmp = x1;
                x1 = x2; x2 = tmp;
                tmp = y1; y1 = y2; y2 = tmp;
                v1.color.swap(v2.color);
            }
            var flag = x2 > x1 ? 1 : -1;
            var k = flag * (dx << 1);
            var e = -dy * flag;
            for (var x = x1, y = y1; y <= y2; y++) {
                var t = (y - y1) / (y2 - y1);
                var color = v1.color.interp(v2.color, t);
                var depth = _Math.interp(v1.depth, v2.depth, t);
                this.drawPixel(x, y, color, 1.0, t);
                e += k;
                if (flag * e > 0) {
                    x += flag;
                    e -= 2 * dy * flag;
                }
            }
        }
    }

    public drawTriangle(_v1: Vertex, _v2: Vertex, _v3: Vertex) {
        var v1 = _v1.clone();
        var v2 = _v2.clone();
        var v3 = _v3.clone();
        v1.position.round();
        v2.position.round();
        v3.position.round();
        sortTriangleVertex(v1, v2, v3);
        if (v1.position.y == v2.position.y) {
            this.drawBottomFlatTriangle(v1, v2, v3);
        } else if (v2.position.y == v3.position.y) {
            this.drawTopFlatTriangle(v1, v2, v3);
        } else {
            var t = (v2.position.y - v1.position.y) / (v3.position.y - v1.position.y);
            var v4 = v1.interp(v3, t);
            if (v4.position.x < v2.position.x) {
                v2.swap(v4);
            }
            this.drawBottomFlatTriangle(v2, v4, v3);
            this.drawTopFlatTriangle(v1, v2, v4);
        }
    }

    public drawBoxWireframe(v_vec: Vertex[]) {
        // top
        this.drawSquareWireframe(v_vec[0], v_vec[1], v_vec[5], v_vec[4]);
        // down
        this.drawSquareWireframe(v_vec[3], v_vec[2], v_vec[6], v_vec[7]);
        // left
        this.drawSquareWireframe(v_vec[1], v_vec[2], v_vec[6], v_vec[5]);
        // right
        this.drawSquareWireframe(v_vec[0], v_vec[3], v_vec[7], v_vec[4]);
        // front
        this.drawSquareWireframe(v_vec[0], v_vec[1], v_vec[2], v_vec[3]);
        // back
        this.drawSquareWireframe(v_vec[4], v_vec[5], v_vec[6], v_vec[7]);
    }


    public drawBoxPipLine(box: Box, camera: Camera, light?: Light) {
        var proj = camera.projectionMatrix;
        var view = camera.viewMatrix;
        var model = box.generateModelMatrix();
        var triangleIndex = [
            //top
            1, 0, 4, 4, 5, 1,
            // bottom
            7, 3, 2, 2, 6, 7,
            //left
            6, 2, 1, 1, 5, 6,
            //right
            7, 4, 0, 0, 3, 7,
            //front
            2, 3, 0, 0, 1, 2,
            //back 
            6, 5, 4, 4, 7, 6
        ];
        
        var normalArray = [
            new Vec3( 0,   1.0, 0),
            new Vec3( 0,  -1.0, 0),
            new Vec3(-1.0, 0,   0),
            new Vec3( 1.0, 0,   0),
            new Vec3( 0,   0,   1.0),
            new Vec3( 0,   0,  -1.0)
        ];
        var textureCoordArray = [
            // top
            [0.0, 1.0], [1.0, 1.0], [1.0, 0.0],  [1.0, 0.0], [0.0, 0.0], [0.0, 1.0],
            // bottom
            [1.0, 1.0], [1.0, 0.0], [0.0, 0.0],  [0.0, 0.0], [0.0, 1.0], [1.0, 1.0],
            // left
            [0.0, 1.0], [1.0, 1.0], [1.0, 0.0],  [1.0, 0.0], [0.0, 0.0], [0.0, 1.0],
            // right
            [1.0, 1.0], [1.0, 0.0], [0.0, 0.0],  [0.0, 0.0], [0.0, 1.0], [1.0, 1.0],
            // front
            [0.0, 1.0], [1.0, 1.0], [1.0, 0.0],  [1.0, 0.0], [0.0, 0.0], [0.0, 1.0],
            // back
            [1.0, 1.0], [1.0, 0.0], [0.0, 0.0],  [0.0, 0.0], [0.0, 1.0], [1.0, 1.0]
        ];
        for (var i = 0; i < triangleIndex.length; i += 3) {
            var vertices = [box.vertices[triangleIndex[i]], box.vertices[triangleIndex[i + 1]], box.vertices[triangleIndex[i + 2]]];
            var normalIndex = Math.floor(i / 6);
            var normal = normalArray[normalIndex].clone();
            var newModel = model.copy().getInverse().getTranspose().getMat3();
            normal = newModel.mulVec3(normal);
            var textureCoord = [textureCoordArray[i], textureCoordArray[i + 1], textureCoordArray[i + 2]];
            var attr = {
                "projection": proj,
                "view": view,
                "model": model,
                "normal": normal,
                "light": light,
                "material": box.material,
                "viewPos": camera.position,
                "textureCoord": textureCoord
            }
            this.vertexShader(vertices, attr, "triangle");
        }
    }

    public vertexShader(vertices: Vertex[], attr: any, type: string) {
        if (vertices.length !== 3) {
            console.warn("WebRenderer.vertexShader: input vectices array's length not equal to 3.");
        }

        var gl_Vertices = [];
        for (var i = 0; i < vertices.length; i++) {
            var gl_Position = attr.projection.mulMat4(attr.view).mulMat4(attr.model).mulVec3(vertices[i].position);
            var fragPos = attr.model.mulVec3(vertices[i].position).getVec3();
            var textureCoord = attr.textureCoord[i];
            var gl_Vertex = {
                "gl_Position": gl_Position,
                "fragPos": fragPos,
                "color": vertices[i].color.normalize(),
                "textureCoord": textureCoord
            };
            gl_Vertices.push(gl_Vertex);
        }
        var geo_Attr = {
            "light": attr.light,
            "material": attr.material,
            "normal": attr.normal,
            "viewPos": attr.viewPos
        }
        this.geometryAssemble(gl_Vertices, geo_Attr, type);
    }

    public geometryAssemble(gl_Vertices: any[], attr: any, type: string) {
        for (var i = 0; i < gl_Vertices.length; i++) {
            var v = gl_Vertices[i];
            var vec4 = v.gl_Position;
            var vec3 = new Vec3(vec4.x / vec4.w, vec4.y / vec4.w, vec4.z / vec4.w);
            v.depth = vec3.z;
            vec3.addScalar(1.0);
            vec3.x *= this.width / 2;
            vec3.y *= this.height / 2;
            vec3.y = this.height - vec3.y;
            vec3 = vec3.round();
            v.gl_Position = vec3;
        }
        this.sortGLVertices(gl_Vertices);
        var v1 = gl_Vertices[0];
        var v2 = gl_Vertices[1];
        var v3 = gl_Vertices[2];
        if (v1.gl_Position.y == v2.gl_Position.y) {
            this.drawBottomFlatTrianglePipline([v1, v2, v3], attr);
        } else if (v2.gl_Position.y == v3.gl_Position.y) {
            this.drawTopFlatTrianglePipline([v1, v2, v3], attr);
        } else {
            var t = (v2.gl_Position.y - v1.gl_Position.y) / (v3.gl_Position.y - v1.gl_Position.y);
            var textureCoord = [_Math.interp(v1.textureCoord[0], v3.textureCoord[0], t), _Math.interp(v1.textureCoord[1], v3.textureCoord[1], t)];
            var v4 = {
                "gl_Position": v1.gl_Position.interp(v3.gl_Position, t).round(),
                "fragPos": v1.fragPos.interp(v3.fragPos, t),
                "color": v1.color.interp(v3.color, t),
                "textureCoord": textureCoord,
                "depth": _Math.interp(v1.depth, v3.depth, t)
            }
            if (v4.gl_Position.x < v2.gl_Position.x) {
                var tmp = v4;
                v4 = v2;
                v2 = tmp;
            }
            this.drawBottomFlatTrianglePipline([v2, v4, v3], attr);
            this.drawTopFlatTrianglePipline([v1, v2, v4], attr);
        }
    }

    public drawBottomFlatTrianglePipline(gl_Vertices: any[], attr: any) {
        var v1 = gl_Vertices[0];
        var v2 = gl_Vertices[1];
        var v3 = gl_Vertices[2];
        var startY = v1.gl_Position.y;
        var endY = v3.gl_Position.y;
        for (var y = startY; y <= endY; y++) {
            var t = (y- startY) / (endY - startY);
            var vl_textureCoord = [_Math.interp(v1.textureCoord[0], v3.textureCoord[0], t), _Math.interp(v1.textureCoord[1], v3.textureCoord[1], t)];
            var vl = {
                "gl_Position": v1.gl_Position.interp(v3.gl_Position, t).round(),
                "fragPos": v1.fragPos.interp(v3.fragPos, t),
                "color": v1.color.interp(v3.color, t),
                "depth": _Math.interp(v1.depth, v3.depth, t),
                "textureCoord": vl_textureCoord
            };
            var vr_textureCoord = [_Math.interp(v2.textureCoord[0], v3.textureCoord[0], t), _Math.interp(v2.textureCoord[1], v3.textureCoord[1], t)];
            var vr = {
                "gl_Position": v2.gl_Position.interp(v3.gl_Position, t).round(),
                "fragPos": v2.fragPos.interp(v3.fragPos, t),
                "color": v2.color.interp(v3.color, t),
                "depth": _Math.interp(v2.depth, v3.depth, t),
                "textureCoord": vr_textureCoord
            }
            this.drawScanLinePipline(vl, vr, attr);
        }
    }

    public drawTopFlatTrianglePipline(gl_Vertices: any[], attr: any) {
        var v1 = gl_Vertices[0];
        var v2 = gl_Vertices[1];
        var v3 = gl_Vertices[2];
        var startY = v1.gl_Position.y;
        var endY = v3.gl_Position.y;
        for (var y = startY; y <= endY; y++) {
            var t = (y - startY) / (endY - startY);
            var vl_textureCoord = [_Math.interp(v1.textureCoord[0], v2.textureCoord[0], t), _Math.interp(v1.textureCoord[1], v2.textureCoord[1], t)];
            var vl = {
                "gl_Position": v1.gl_Position.interp(v2.gl_Position, t).round(),
                "fragPos": v1.fragPos.interp(v2.fragPos, t),
                "color": v1.color.interp(v2.color, t),
                "depth": _Math.interp(v1.depth, v2.depth, t),
                "textureCoord": vl_textureCoord
            }
            var vr_textureCoord = [_Math.interp(v1.textureCoord[0], v3.textureCoord[0], t), _Math.interp(v1.textureCoord[1], v3.textureCoord[1], t)];
            var vr = {
                "gl_Position": v1.gl_Position.interp(v3.gl_Position, t).round(),
                "fragPos": v1.fragPos.interp(v3.fragPos, t),
                "color": v1.color.interp(v3.color, t),
                "depth": _Math.interp(v1.depth, v3.depth, t),
                "textureCoord": vr_textureCoord
            }
            this.drawScanLinePipline(vl, vr, attr);
        }
    }

    public drawScanLinePipline(v1: any, v2: any, attr: any) {
        var x = Math.round(v1.gl_Position.x);
        var y = Math.round(v1.gl_Position.y);
        var length = Math.round(v2.gl_Position.x) - x;
        for (var i = 0; i <= length; i++) {
            var t = length > 0 ? i / length : 1;
            var color = v1.color.interp(v2.color, t);
            var depth = _Math.interp(v1.depth, v2.depth, t);
            var textureCoord = [_Math.interp(v1.textureCoord[0], v2.textureCoord[0], t), _Math.interp(v1.textureCoord[1], v2.textureCoord[1], t)];
            var frag = {
                "gl_Position": new Vec3(x + i, y, 0),
                "fragPos": v1.fragPos.interp(v2.fragPos, t),
                "color": color,
                "depth": depth,
                "textureCoord": textureCoord
            }
            this.fragmentShader(frag, attr);
        }
    }

    public fragmentShader(frag: any, attr: any) {
        if (attr.material === undefined || attr.light == undefined) {
            var color = frag.color.mulScalar(255);
            color = new Color(color.x, color.y, color.z);
            this.drawPixel(frag.gl_Position.x, frag.gl_Position.y, color, 1.0, frag.depth);
            return;
        }
        var material: Material = attr.material;
        var light: Light = attr.light;
        var normal: Vec3 = attr.normal.normalize();
        var fragPos: Vec3 = frag.fragPos;
        var viewPos: Vec3 = attr.viewPos;
        if (material.diffuse.type === "Color") {
            var diffuse = material.diffuse.normalize();
            var ambient = diffuse.clone();
            var specular = material.specular.normalize();

            var lightColor = light.lightColor.normalize();

            // 环境光
            ambient = ambient.mulVec3(lightColor).mulVec3(light.ambient);

            // 漫反射
            var lightDir = light.pos.clone().substract(fragPos).normalize();
            if (light.type == Light.DIRECTION_LIGHT) {
                lightDir = light.dir.clone().mulScalar(-1).normalize();
            }
            
            var diff = Math.max(normal.dotVec3(lightDir), 0.0);
            diffuse = diffuse.mulVec3(lightColor).mulVec3(light.diffuse).mulScalar(diff);

            // 镜面反射
            var viewDir = viewPos.substract(fragPos).normalize();
            var reflectDir = _Math.getRelectVec(lightDir.clone().mulScalar(-1), normal).mulScalar(-1);
            var spec = Math.pow(Math.max(viewDir.dotVec3(reflectDir), 0), material.shininess);
            specular = specular.mulVec3(lightColor).mulVec3(light.specular).mulScalar(spec);

            var result = diffuse.add(ambient).add(specular);
            result.mulScalar(255.0);
            var fragColor = new Color(result.x, result.y, result.z);

            this.drawPixel(frag.gl_Position.x, frag.gl_Position.y, fragColor, 1.0, frag.depth);
                
        } else if (material.diffuse.type === "Texture") {
            var lightColor = light.lightColor.normalize();

            var texture: Texture = material.diffuse;
            var diffuseTexture = texture.diffuse;

            var diffuseColor: Vec3 = lightColor.clone();
            if (diffuseTexture !== undefined) {
                diffuseTexture = diffuseTexture as ImageData;
                var x = Math.round(frag.textureCoord[0] * diffuseTexture.width);
                var y = Math.round(frag.textureCoord[1] * diffuseTexture.height);
                var index = (y*diffuseTexture.width + x) * 4;
                var texColor = new Color(diffuseTexture.data[index], diffuseTexture.data[index+1], diffuseTexture.data[index+2]);
                diffuseColor = texColor.normalize();
            }

            var specularColor: Vec3 = lightColor.clone();
            if (texture.specular !== undefined) {
                var specularTexture = texture.specular;
                var x = Math.round(frag.textureCoord[0] * specularTexture.width);
                var y = Math.round(frag.textureCoord[1] * specularTexture.height);
                var index = (y * specularTexture.width + x) * 4;
                var texSpecColor = new Color(specularTexture.data[index], specularTexture.data[index+1], specularTexture.data[index+2]);
                specularColor = texSpecColor.normalize();
            }

            // 环境光
            var ambientColor = diffuseColor.clone();
            ambientColor = ambientColor.mulVec3(lightColor).mulVec3(light.ambient);

            // 漫反射纹理
            var lightDir = light.pos.clone().substract(fragPos).normalize();
            if (light.type == Light.DIRECTION_LIGHT) {
                lightDir = light.dir.clone().mulScalar(-1).normalize();
            }
            var diff = Math.max(normal.dotVec3(lightDir), 0.0);
            diffuseColor = diffuseColor.mulVec3(lightColor).mulVec3(light.diffuse).mulScalar(diff);

            // 镜面纹理
            var viewDir = viewPos.substract(fragPos).normalize();
            var reflectDir = _Math.getRelectVec(lightDir.clone().mulScalar(-1), normal).mulScalar(-1);
            var spec = Math.pow(Math.max(viewDir.dotVec3(reflectDir), 0), material.shininess);
            specularColor = specularColor.mulVec3(lightColor).mulVec3(light.specular).mulScalar(spec);


            var resultColor = diffuseColor.add(ambientColor).add(specularColor);
            resultColor = resultColor.mulScalar(255.0);
            var fragColor = new Color(resultColor.x, resultColor.y, resultColor.z);


            this.drawPixel(frag.gl_Position.x, frag.gl_Position.y, fragColor, 1.0, frag.depth);
        }
    }

    // y     v3    v2  v3
    // 0x  v1  v2    v1
    public sortGLVertices(gl_Vertices: any[]) {
        if (gl_Vertices[0].gl_Position.y > gl_Vertices[1].gl_Position.y || 
            (gl_Vertices[0].gl_Position.y == gl_Vertices[1].gl_Position.y && 
                gl_Vertices[0].gl_Position.x > gl_Vertices[1].gl_Position.x)) {
            var tmp = gl_Vertices[0];
            gl_Vertices[0] = gl_Vertices[1];
            gl_Vertices[1] = tmp;
        }
        if (gl_Vertices[1].gl_Position.y > gl_Vertices[2].gl_Position.y ||
            (gl_Vertices[1].gl_Position.y == gl_Vertices[2].gl_Position.y &&
                gl_Vertices[1].gl_Position.x > gl_Vertices[2].gl_Position.x)) {
            var tmp = gl_Vertices[1];
            gl_Vertices[1] = gl_Vertices[2];
            gl_Vertices[2] = tmp;
        }
        if (gl_Vertices[0].gl_Position.y > gl_Vertices[1].gl_Position.y ||
            (gl_Vertices[0].gl_Position.y == gl_Vertices[1].gl_Position.y &&
                gl_Vertices[0].gl_Position.x > gl_Vertices[1].gl_Position.x)) {
            var tmp = gl_Vertices[0];
            gl_Vertices[0] = gl_Vertices[1];
            gl_Vertices[1] = tmp;
        }
    }

    // private functions
    private drawBox(box: Box, camera: Camera, light?: Light) {
        var v_vec = [];
        var proj = camera.projectionMatrix;
        var view = camera.viewMatrix;
        var model = box.generateModelMatrix();
        var triangleIndex = [
            //top
            1, 0, 4, 4, 5, 1,
            // bottom
            7, 3, 2, 2, 6, 7,
            //left
            6, 2, 1, 1, 5, 6,
            //right
            7, 4, 0, 0, 3, 7,
            //front
            2, 3, 0, 0, 1, 2,
            //back 
            6, 5, 4, 4, 7, 6
        ];
        for (var v of box.vertices) {
            var mat = proj.mulMat4(view).mulMat4(model);
            var vec4 = mat.mulVec3(v.position);
            var vec3 = new Vec3(vec4.x / vec4.w, vec4.y / vec4.w, vec4.z / vec4.w);
            var depth = vec3.z;
            vec3.addScalar(1.0);
            vec3.x *= this.width / 2;
            vec3.y *= this.height / 2;
            vec3.y = this.height - vec3.y;
            var new_v = new Vertex(vec3.x, vec3.y, vec3.z, v.color.clone());
            new_v.depth = depth;
            v_vec.push(new_v);
        }
        if (box.wireframe) {
            for (var i = 0; i < triangleIndex.length; i += 3) {
                this.drawTriangleWireframe(v_vec[triangleIndex[i]], v_vec[triangleIndex[i + 1]], v_vec[triangleIndex[i + 2]]);
            }
        } else {
            this.drawBoxPipLine(box, camera, light);
        }
    }

    private drawSquareWireframe(v1: Vertex, v2: Vertex, v3: Vertex, v4: Vertex) {
        this.drawLine(v1, v2);
        this.drawLine(v2, v3);
        this.drawLine(v3, v4);
        this.drawLine(v4, v1);
    }

    private drawTriangleWireframe(v1: Vertex, v2: Vertex, v3: Vertex) {
        this.drawLine(v1, v2);
        this.drawLine(v2, v3);
        this.drawLine(v3, v1);
    }

    private drawBottomFlatTriangle(v1: Vertex, v2: Vertex, v3: Vertex) {
        var startY = v1.position.y;
        var endY = v3.position.y;
        for (var y = startY; y <= endY; y++) {
            var t = (y - startY) / (endY - startY);
            var vl = v1.interp(v3, t);
            var vr = v2.interp(v3, t);
            this.drawScanLine(vl, vr);
        }
    }

    private drawTopFlatTriangle(v1: Vertex, v2: Vertex, v3: Vertex) {
        var startY = v1.position.y;
        var endY = v3.position.y;
        for (var y = startY; y <= endY; y++) {
            var t = (y - startY) / (endY - startY);
            var vl = v1.interp(v2, t);
            var vr = v1.interp(v3, t);
            this.drawScanLine(vl, vr);
        }
    }

    // draw the screen scan line
    private drawScanLine(v1: Vertex, v2: Vertex) {
        var x = Math.round(v1.position.x);
        var y = Math.round(v1.position.y);
        var length = Math.round(v2.position.x) - x;
        for (var i = 0; i <= length; i++) {
            var t = length > 0 ? i / length : 1;
            var color = v1.color.interp(v2.color, t);
            var depth = _Math.interp(v1.depth, v2.depth, t);
            this.drawPixel(x + i, y, color, 1.0, depth);
        }
    }

}