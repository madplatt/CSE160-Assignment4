class Sphere {
    constructor(texValue = -2){
        this.type='sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.texValue = texValue;
        this.vertices = [];
        this.uv = [];
        this.normal = [];
        var vertices = this.vertices;
        var uv = this.uv;
        var normal = this.normal;
        var aStep = Math.PI / 10;
        var bStep = aStep;
        for(var t = 0; t < Math.PI; t += aStep) {
            for(var r = 0; r < 2 * Math.PI; r += aStep) {
                vertices.push(Math.sin(t) * Math.cos(r), Math.sin(t) * Math.sin(r), Math.cos(t)); // P1
                vertices.push(Math.sin(t + bStep) * Math.cos(r), Math.sin(t + bStep) * Math.sin(r), Math.cos(t + bStep));  // P2
                vertices.push(Math.sin(t + bStep) * Math.cos(r + bStep), Math.sin(t + bStep) * Math.sin(r + bStep), Math.cos(t + bStep)); // P4
                uv.push(0,0, 0,0, 0,0);

                vertices.push(Math.sin(t) * Math.cos(r), Math.sin(t) * Math.sin(r), Math.cos(t)); // P1
                vertices.push(Math.sin(t + bStep) * Math.cos(r + bStep), Math.sin(t + bStep) * Math.sin(r + bStep), Math.cos(t + bStep)); // P4
                vertices.push(Math.sin(t) * Math.cos(r + bStep), Math.sin(t) * Math.sin(r + bStep), Math.cos(t)); // P3
                uv.push(0,0, 0,0, 0,0);
            }
        }
    }
    update() {}
    render()
    {
        //console.log("" + this.texValue);
        if(this.texValue < 0)
        {
            gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        }
        if(g_loadedTexture != this.texValue)
        {
            gl.uniform1i(u_TexSelect, this.texValue);
            g_loadedTexture = this.texValue;
        }
        
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        //console.log(this.vertices)
        drawTriangle3DUVNormal(this.vertices, this.uv, this.vertices);
    }
}