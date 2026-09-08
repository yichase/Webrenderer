import { Object3D } from "./AObject3D";
import { Vertex } from "../Vertex";
import { Vec3 } from "../math/Vec3";
import { Matrix4 } from "../math/Matrix4";
import { Color } from "../materials/Color";

export class Box extends Object3D {

    private width: number;
    private height: number;
    private depth: number;

    public vertices: Vertex[] = [];
    public position: Vec3;
    public rotation: Vec3;

    constructor(width: number, height: number, depth: number) {
        super("Box");
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.position = new Vec3(0, 0, 0);
        this.rotation = new Vec3();
        this.generateVertices();
    }

    private generateVertices() {
        var x = this.width / 2;
        var y = this.height / 2;
        var z = this.depth / 2;
        var v0 = new Vertex(x, y, z);
        var v1 = new Vertex(-x, y, z);
        var v2 = new Vertex(-x, -y, z);
        var v3 = new Vertex(x, -y, z);
        var v4 = new Vertex(x, y, -z);
        var v5 = new Vertex(-x, y, -z);
        var v6 = new Vertex(-x, -y, -z);
        var v7 = new Vertex(x, -y, -z);
        this.vertices = [v0, v1, v2, v3, v4, v5, v6, v7];
    }

    public setVertexColor(index: number, color: Color) {
        if (index < 0 || index >= this.vertices.length) {
            return;
        }
        var v = this.vertices[index];
        v.color = color;
    }

    public setColor(color: Color) {
        for (var i = 0; i < this.vertices.length; i++) {
            this.setVertexColor(i, color);
        }
    }

    public setPosition(p: Vec3) {
        this.position = p;
        this.generateModelMatrix();
    }

    public generateModelMatrix(): Matrix4 {
        var mat = Matrix4.createUnitMat4();
        mat = mat.rotateX(this.rotation.x);
        mat = mat.rotateY(this.rotation.y);
        mat = mat.rotateZ(this.rotation.z);

        mat = mat.translate(this.position);
        this.modelMatrix = mat;
        return this.modelMatrix;
    }
}
