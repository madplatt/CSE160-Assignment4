class Camera {
    constructor(){
        this.type='camera';
        this.fov = 60;
        this.eye = new Vector3([-5,2,10]);
        this.at = new Vector3([-4,2,10]);
        this.up = new Vector3([0,1,0]);
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.viewMatrix = new Matrix4();
        this.viewMatrix.setLookAt(-5,2,10, -4,2,10, 0,1,0); //Eye, At, Up
        this.projMatrix = new Matrix4();
        this.projMatrix.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 1000);
        this.forwardVec = new Vector3([0,0,0]);
        this.sideVec = new Vector3([0,0,0]);
        this.rotMatrix = new Matrix4();
    }
    update() {
        var eye = this.eye.elements;
        var at = this.at.elements;
        var up = this.up.elements;
        console.log("Eye: " + eye + "   At: " + at);
        this.viewMatrix.setLookAt(eye[0],eye[1],eye[2], at[0],at[1],at[2], up[0],up[1],up[2]);
    }
    getProjectionMatrix()
    {
        return this.projMatrix;
    }
    getViewMatrix()
    {
        return this.viewMatrix;
    }
    moveForward(speed) {
        var forwardVec = this.forwardVec;
        forwardVec.set(this.at);
        forwardVec.sub(this.eye);
        forwardVec.normalize();
        forwardVec.mul(speed);
        //console.log("" + forwardVec.elements);
        this.eye = this.eye.add(forwardVec);
        this.at = this.at.add(forwardVec);
    }
    moveBackward(speed) {
        var at = this.at;
        var eye = this.eye;
        var forwardVec = this.forwardVec;
        forwardVec.set(at);
        forwardVec.sub(eye);
        forwardVec.normalize();
        forwardVec.mul(speed);
        eye.sub(forwardVec);
        at.sub(forwardVec);
    }
    moveLeft(speed)
    {
        var at = this.at;
        var eye = this.eye;
        var up = this.up;
        var forwardVec = this.forwardVec;
        forwardVec.set(at);
        forwardVec.sub(eye);
        var sideVec = Vector3.cross(forwardVec, up) 
        sideVec.normalize();
        sideVec.mul(speed);
        eye.sub(sideVec);
        at.sub(sideVec);
    }
    moveRight(speed)
    {
        var at = this.at;
        var eye = this.eye;
        var up = this.up;
        var forwardVec = new Vector3([0,0,0]);
        forwardVec.set(at);
        forwardVec.sub(eye);
        var sideVec = Vector3.cross(forwardVec, up) 
        sideVec.normalize();
        sideVec.mul(speed);
        eye.add(sideVec);
        at.add(sideVec);
    }
    panHorizontal(angle)
    {
        var atVec = this.at;
        var eyeVec = this.eye;
        var up = this.up.elements;
        var forwardVec = this.forwardVec;
        forwardVec.set(atVec);
        forwardVec.sub(eyeVec);
        forwardVec.normalize();
        this.rotMatrix.setRotate(-angle,up[0],up[1],up[2]);
        var atDelta = this.rotMatrix.multiplyVector3(forwardVec);
        atDelta.normalize();
        forwardVec.set(eyeVec);
        forwardVec.add(atDelta);
        atVec.set(forwardVec);
    }
    panVertical(angle)
    {
        var atVec = this.at;
        var eyeVec = this.eye;
        var upVec = this.up;
        var forwardVec = this.forwardVec;
        forwardVec.set(atVec);
        forwardVec.sub(eyeVec);
        forwardVec.normalize();
        var sideVec = Vector3.cross(forwardVec, upVec) 
        sideVec.normalize();
        this.rotMatrix.setRotate(-angle,sideVec.elements[0],sideVec.elements[1],sideVec.elements[2]);
        var atDelta = this.rotMatrix.multiplyVector3(forwardVec);
        atDelta.normalize();
        forwardVec.set(eyeVec);
        forwardVec.add(atDelta);
        atVec.set(forwardVec);
    }
};