import { Vec3 } from "./Vec3";
import { Vec4 } from "./Vec4";
import { Matrix3 } from "./Matrix3";

// TODO: test
export class Matrix4 {
    // NOTE: member function with keyword `const function` will not modify this.elements in function body.

    public elements: number[] = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    // _nij: element at row i and col j
    constructor(_n11: number = 1, _n12: number = 0, _n13: number = 0, _n14: number = 0,
        _n21: number = 0, _n22: number = 1, _n23: number = 0, _n24: number = 0,
        _n31: number = 0, _n32: number = 0, _n33: number = 1, _n34: number = 0,
        _n41: number = 0, _n42: number = 0, _n43: number = 0, _n44: number = 1) {
        this.elements[0] = _n11, this.elements[1] = _n12, this.elements[2] = _n13, this.elements[3] = _n14;
        this.elements[4] = _n21, this.elements[5] = _n22, this.elements[6] = _n23, this.elements[7] = _n24;
        this.elements[8] = _n31, this.elements[9] = _n32, this.elements[10] = _n33, this.elements[11] = _n34;
        this.elements[12] = _n41, this.elements[13] = _n42, this.elements[14] = _n43, this.elements[15] = _n44;
    }

    public set(_n11: number = 1, _n12: number = 0, _n13: number = 0, _n14: number = 0,
        _n21: number = 0, _n22: number = 1, _n23: number = 0, _n24: number = 0,
        _n31: number = 0, _n32: number = 0, _n33: number = 1, _n34: number = 0,
        _n41: number = 0, _n42: number = 0, _n43: number = 0, _n44: number = 1) {
        this.elements[0] = _n11, this.elements[1] = _n12, this.elements[2] = _n13, this.elements[3] = _n14;
        this.elements[4] = _n21, this.elements[5] = _n22, this.elements[6] = _n23, this.elements[7] = _n24;
        this.elements[8] = _n31, this.elements[9] = _n32, this.elements[10] = _n33, this.elements[11] = _n34;
        this.elements[12] = _n41, this.elements[13] = _n42, this.elements[14] = _n43, this.elements[15] = _n44;
    }

    /* perspective (same as glm::perspective)
     * return a projective matrix
     * fov: radians, field of view
     * aspect: width / height
     * nearZ: near z plane, > 0
     * farZ: far z plane, > nearZ > 0
     */
    public static createPerspective(fov: number, aspect: number, nearZ: number, farZ: number): Matrix4 {
        let cotHalfFoV = 1 / Math.tan(fov / 2);
        return new Matrix4(
            cotHalfFoV / aspect, 0,          0,                                0,
            0,                   cotHalfFoV, 0,                                0,
            0,                   0,         -(farZ + nearZ) / (farZ - nearZ), -2 * farZ * nearZ / (farZ - nearZ),
            0,                   0,         -1,                                0
        );
    }

    /* return a view matrix that transforms world CS to camera CS
    // NOTE: same as OPENGL, camera is always in the origin point(0, 0, 0)
    // NOTE: so, this function return lookAt .* translate(-pos)
     * pos: camera's positon
     * target: target that camera to focus on (it means that the direction is [target - pos])
     * upVec: up vector, y axis in camera's coodinate system
     */
    public static createLookAt(pos: Vec3, target: Vec3, upVec: Vec3): Matrix4 {
        var z = pos.substract(target);

        if (z.lengthSq() === 0) {
            // pos and target are in the same position
            z.z = 1;
        }

        z.normalize();
        var x = upVec.cross(z);

        if (x.lengthSq() === 0) {
            // up and z are parallel
            if (Math.abs(upVec.z) === 1) {
                z.x += 0.0001;
            } else {
                z.z += 0.0001;
            }

            z.normalize();
            x = upVec.cross(z);
        }

        x.normalize();
        var y = z.cross(x);

        var lookAt = new Matrix4(
            x.x, x.y, x.z, 0,
            y.x, y.y, y.z, 0,
            z.x, z.y, z.z, 0,
            0,   0,   0,   1
        );

        return lookAt.mulMat4(
            Matrix4.createTranslate(
                new Vec3(-pos.x, -pos.y, -pos.z)
            )
        );
    }

    // return an unit matirx
    public static createUnitMat4(): Matrix4 {
        return new Matrix4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
    }

    // return a translateion matrix
    // M .* p => let p move dir 
    public static createTranslate(dir: Vec3, mat4?: Matrix4): Matrix4 {
        if (mat4 == undefined) {
            mat4 = Matrix4.createUnitMat4();
        }

        let tmat4 = new Matrix4(
            1, 0, 0, dir.x,
            0, 1, 0, dir.y,
            0, 0, 1, dir.z,
            0, 0, 0, 1
        );
        return tmat4.mulMat4(mat4);
    }

    // return a scalar matrix
    // scale: [Vec3] 3 different axis scales or [number] a scale ratio to all axis
    // M .* (x,y,z,w) => (sx,sy,sz,w)
    public static createScalar(scale: Vec3 | number, mat4?: Matrix4): Matrix4 {
        if (mat4 == undefined) {
            mat4 = Matrix4.createUnitMat4();
        }

        if (typeof scale === "number") {
            scale = new Vec3(scale, scale, scale);
        }

        let rmat = new Matrix4(
            scale.x, 0,       0,       0,
            0,       scale.y, 0,       0,
            0,       0,       scale.z, 0,
            0,       0,       0,       1
        );

        return rmat.mulMat4(mat4);
    }

    // return a rotation matrix with tha axis x, y, or z
    // all the input angles are radians
    public static createRotateX(angle: number, mat4?: Matrix4): Matrix4 {
        if (mat4 == undefined) {
            mat4 = Matrix4.createUnitMat4();
        }

        let c = Math.cos(angle);
        let s = Math.sin(angle);

        let rmat =  new Matrix4(
            1, 0,  0, 0,
            0, c, -s, 0,
            0, s,  c, 0,
            0, 0,  0, 1
        );

        return rmat.mulMat4(mat4);
    }

    public static createRotateY(angle: number, mat4?: Matrix4): Matrix4 {
        if (mat4 == undefined) {
            mat4 = Matrix4.createUnitMat4();
        }

        let c = Math.cos(angle);
        let s = Math.sin(angle);

        let rmat =  new Matrix4(
             c, 0, s, 0,
             0, 1, 0, 0,
            -s, 0, c, 0,
             0, 0, 0, 1
        );

        return rmat.mulMat4(mat4);
    }

    public static createRotateZ(angle: number, mat4?: Matrix4): Matrix4 {
        if (mat4 == undefined) {
            mat4 = Matrix4.createUnitMat4();
        }

        let c = Math.cos(angle);
        let s = Math.sin(angle);

        let rmat =  new Matrix4(
            c, -s, 0, 0,
            s,  c, 0, 0,
            0,  0, 1, 0,
            0,  0, 0, 1
        );

        return rmat.mulMat4(mat4);
    }

    // return translation matrix .* self
    // const function
    public translate(dir: Vec3): Matrix4 {
        return Matrix4.createTranslate(dir,this);
    }

    //  return scalar matrix .* self
    // const function
    public scale(s: Vec3 | number): Matrix4 {
        return Matrix4.createScalar(s, this);
    }

    // return rotation matix .* self
    // const function
    public rotateX(angle: number): Matrix4 {
        return Matrix4.createRotateX(angle,this);
    }

    public rotateY(angle: number): Matrix4 {
        return Matrix4.createRotateY(angle,this);
    }

    public rotateZ(angle: number): Matrix4 {
        return Matrix4.createRotateZ(angle,this);
    }

    // return a copy of this object
    // const function
    public copy() {
        return new Matrix4(
            this.elements[0], this.elements[1], this.elements[2], this.elements[3],
            this.elements[4], this.elements[5], this.elements[6], this.elements[7],
            this.elements[8], this.elements[9], this.elements[10], this.elements[11],
            this.elements[12], this.elements[13], this.elements[14], this.elements[15],
        );
    }

    // return the value at positon(row i, col j)
    // i, j are both from 0 to 3
    // const function
    public elementAt(i: number, j: number) {
        return this.elements[i * 4 + j];
    }

    // print this object (4x4 matrix) 
    // ONLY for debugging
    // const function
    public print() {
        console.warn("WebRenderer.Matrix4: print this matrix. this function is only for debugging.")
        console.log(this.elements[0], this.elements[1], this.elements[2], this.elements[3]);
        console.log(this.elements[4], this.elements[5], this.elements[6], this.elements[7]);
        console.log(this.elements[8], this.elements[9], this.elements[10], this.elements[11]);
        console.log(this.elements[12], this.elements[13], this.elements[14], this.elements[15]);
    }

    // return self .* vec
    // the return vector (Vec4) is a column vector
    // const function
    public mulVec4(v: Vec4): Vec4 {
        var result = new Vec4();
        result.x = this.elements[0] * v.x + this.elements[1] * v.y + this.elements[2] * v.z + this.elements[3] * v.w;
        result.y = this.elements[4] * v.x + this.elements[5] * v.y + this.elements[6] * v.z + this.elements[7] * v.w;
        result.z = this.elements[8] * v.x + this.elements[9] * v.y + this.elements[10] * v.z + this.elements[11] * v.w;
        result.w = this.elements[12] * v.x + this.elements[13] * v.y + this.elements[14] * v.z + this.elements[15] * v.w;
        return result;
    }

    // return self .* (x, y, z, 1)
    // const function
    public mulVec3(v: Vec3): Vec4 {
        var tmp = new Vec4(v.x, v.y, v.z, 1.0);
        return this.mulVec4(tmp);
    }

    // return self .* mat4
    // const function
    public mulMat4(mat4: Matrix4): Matrix4 {
        var result = new Matrix4();
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                var tmp = 0;
                for (var t = 0; t < 4; t++) {
                    tmp += this.elementAt(i, t) * mat4.elementAt(t, j);
                }
                result.elements[i * 4 + j] = tmp;
            }
        }
        return result;
    }

    // return a inverted copy of self
    // const function
    public getInverse() {
        var res = this.copy();
        return res.inverse();
    }

    // return a transposed copy of self
    // const function
    public getTranspose(): Matrix4 {
        var res = this.copy();
        return res.transpose();
    }

    public getMat3(): Matrix3 {
        return new Matrix3(
            this.elements[0], this.elements[1], this.elements[2], // this.elements[3]
            this.elements[4], this.elements[5], this.elements[6], // this.elements[7]
            this.elements[8], this.elements[9], this.elements[10] // this.elements[11]
        );
    }

    // invert self
    public inverse() {
        var me = this.elements;

        var 
        n11 = me[ 0 ], n21 = me[ 1 ], n31 = me[ 2 ], n41 = me[ 3 ],
        n12 = me[ 4 ], n22 = me[ 5 ], n32 = me[ 6 ], n42 = me[ 7 ],
        n13 = me[ 8 ], n23 = me[ 9 ], n33 = me[ 10 ], n43 = me[ 11 ],
        n14 = me[ 12 ], n24 = me[ 13 ], n34 = me[ 14 ], n44 = me[ 15 ];

        var
        t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
        t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
        t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
        t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

        var det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

        if (det === 0) {
            console.warn("WebRenderer.Matrix4: inverse() can't invert matrix, determinant is 0.");
            return this;
        }

        var detInv = 1 / det;

        this.elements[ 0 ] = t11 * detInv;
		this.elements[ 1 ] = ( n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44 ) * detInv;
		this.elements[ 2 ] = ( n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44 ) * detInv;
		this.elements[ 3 ] = ( n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43 ) * detInv;

		this.elements[ 4 ] = t12 * detInv;
		this.elements[ 5 ] = ( n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44 ) * detInv;
		this.elements[ 6 ] = ( n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44 ) * detInv;
		this.elements[ 7 ] = ( n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43 ) * detInv;

		this.elements[ 8 ] = t13 * detInv;
		this.elements[ 9 ] = ( n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44 ) * detInv;
		this.elements[ 10 ] = ( n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44 ) * detInv;
		this.elements[ 11 ] = ( n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43 ) * detInv;

		this.elements[ 12 ] = t14 * detInv;
		this.elements[ 13 ] = ( n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34 ) * detInv;
		this.elements[ 14 ] = ( n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34 ) * detInv;
        this.elements[ 15 ] = ( n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33 ) * detInv;
        
        return this;
    }

    // transpose self
    public transpose() {
        // 1,4
        this.swapPosition(1, 4);
        // 2,8
        this.swapPosition(2, 8);
        // 3,12; 6,9
        this.swapPosition(3, 12);
        this.swapPosition(6, 9);
        // 7,13
        this.swapPosition(7, 13);
        // 11,14
        this.swapPosition(11, 14);

        return this;
    }

    // swap two position's value of this elements matrix
    private swapPosition(i: number, j: number) {
        let tmp = this.elements[i];
        this.elements[i] = this.elements[j];
        this.elements[j] = tmp;
    }
}