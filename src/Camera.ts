import { Matrix4 } from "./math/Matrix4";
import { Vec3 } from "./math/Vec3";

export class Camera {
    public projectionMatrix: Matrix4;
    public viewMatrix: Matrix4;

    public position: Vec3;
    public worldUp: Vec3;
    public dir: Vec3;

    private fov: number;
    private aspect: number;
    private near: number;
    private far: number;

    constructor(fov: number, aspect: number, near: number, far: number) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.projectionMatrix = Matrix4.createPerspective(fov, aspect, near, far);

        this.position = new Vec3();
        this.worldUp = new Vec3(0, 1, 0);
        this.dir = new Vec3(0, 0, -1);
        this.viewMatrix = Matrix4.createLookAt(this.position, this.dir, this.worldUp);
    }

    public lookAt(pos: Vec3, target: Vec3, upVec: Vec3) {
        this.position = pos;
        this.worldUp = upVec.normalize();
        this.dir = target.substract(pos).normalize();
        this.viewMatrix = Matrix4.createLookAt(pos, target, upVec);
    }

}
