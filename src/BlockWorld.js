// HelloPoint2.js
// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix; 
    uniform mat4 u_ProjectionMatrix; 
    uniform mat4 u_ViewMatrix; 
    void main() {
      gl_Position = u_ProjectionMatrix * u_ViewMatrix* u_ModelMatrix * a_Position;
      v_UV = a_UV;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform int u_TexSelect;
    varying vec2 v_UV;
    void main() {
      if (u_TexSelect == -2) {
        gl_FragColor = u_FragColor;
      }
      else if (u_TexSelect == -1) {
        gl_FragColor = vec4(v_UV,1.0,1.0);
      }
      else if (u_TexSelect == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV);
      }
      else if (u_TexSelect == 1) {
        gl_FragColor = texture2D(u_Sampler1, v_UV);
      }
      else if (u_TexSelect == 2) {
        gl_FragColor = texture2D(u_Sampler2, v_UV);
      }
    }`


// Global Variables
let canvas;
let gl;

let u_TexSelect;
let a_Position;
let a_UV;
let u_FragColor;
let u_Sampler0, u_Sampler1, u_Sampler2;
let u_ModelMatrix;

let g_camera;
var g_texImage1, g_texImage2;
var g_objList = [];
var g_globalAngleX = 0;
var g_globalAngleY = 0;
var g_animDisabled = false;
var g_startTime = performance.now()/1000.0;
var g_secondsPassed = performance.now()/1000.0 - g_startTime;
var g_fps;
var g_oldFrameCount = 0, g_frameCount = 0;
var g_map;
var g_loadedTexture = null;
var g_cheatsEnabled = false;

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    setupHTMLElements();
    
    canvas.addEventListener("click", async () => { 
        if( !document.pointerLockElement ) {
            await canvas.requestPointerLock(); 
        }  
        else {
            click();
        }
    });
    //canvas.onclick = function(ev) { g_mouseCaptured = true; console.log("mouse down"); click(ev);  }
    canvas.onmousemove = function(ev){ mouseControl(ev) }

    document.onkeydown = keydown;
    initTextures(gl,0);
    // Set the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    createWorld();

    g_camera = new Camera();
    var hwmatrix = new Matrix4();
    hwmatrix.setLookAt(0,0,2, 0,0,0, 0,1,0);
    console.log(hwmatrix.elements);
    requestAnimationFrame(tick);
}

function createWorld()
{
    var mazeArray = 
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,
    1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,0,0,1,0,0,0,0,0,1,0,0,1,1,
    1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1,
    1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1,
    1,0,1,0,0,1,0,0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,0,0,1,0,0,0,1,
    1,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,1,1,1,0,1,
    1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,
    1,0,0,0,0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,0,0,1,0,0,0,0,0,0,1,
    1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1,
    1,1,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,1,
    1,0,0,0,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,0,1,
    1,0,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,
    1,0,1,1,1,1,0,0,1,1,1,1,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,1,
    1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,1,1,
    1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,1,
    1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1,1,
    1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,1,
    1,1,1,0,0,1,0,0,1,0,0,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,1,1,
    1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,1,
    1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,1,1,
    1,0,0,0,0,0,0,0,0,0,2,2,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,2,2,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,
    1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1,1,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
    //console.log("" + mazeArray);
    var xLen = 32;
    var yLen = 4;
    var zLen = 32;
    g_map = Array(xLen);
    for(i = 0; i < xLen; i++)  {
        g_map[i] = new Array(yLen);
        for(j = 0; j < yLen; j++)  {
            g_map[i][j] = new Array(zLen).fill(0);
        }
    }
    //console.log("" + g_map);
    for(i = 0; i < xLen; i++)
    {
        for(k = 0; k < zLen; k++)
        {
            for (j = 0; j < yLen; j++)
            {
                var mazeVal = mazeArray[i * 32 + k];
                if (mazeVal == 1)
                {
                    var cube = new Cube(mazeVal);
                    cube.matrix.setTranslate(i,j,k);
                    if (j == 0)
                    { 
                        g_map[i][j][k] = 1;
                        g_objList.push(cube);
                    }
                    else if (g_map[i][j-1][k] == 1)
                    {
                        if (Math.random() < .9)  {
                            g_map[i][j][k] = 1;
                            g_objList.push(cube);
                        }
                        else
                        {
                            g_map[i][j][k] = 0;
                        }
                    }
                }
                if (mazeVal == 2)
                    {
                        var cube = new Cube(mazeVal);
                        cube.matrix.setTranslate(i,j,k);
                        if (j == 0)
                        { 
                            g_map[i][j][k] = 1;
                            g_objList.push(cube);
                        }
                    }
            }
        }
    }
    

    cube = new Cube(-2);
    cube.color = [0.0, 0.8, 1.0, 1.0];
    cube.matrix.setTranslate(-40,-40,-40);
    cube.matrix.scale(250,250,250);
    g_objList.push(cube);

    cube = new Cube(0);
    cube.matrix.setTranslate(-100,-.1,-100);
    cube.matrix.scale(150,.1,150);
    g_objList.push(cube);
}

let sec = 0;
function tick()
{
    if (Math.round(g_secondsPassed) != sec)
    {
        sec = Math.round(g_secondsPassed);
        g_fps = (g_frameCount + g_oldFrameCount) / 2
        g_oldFrameCount = g_frameCount;
        g_frameCount = 0;
        //console.log("FPS: " + g_fps);
    }
    
    g_secondsPassed = performance.now()/1000.0 - g_startTime;
    renderAllObjects();
    updateAllObjects();
    g_frameCount++;
    requestAnimationFrame(tick);    
}

function mouseControl(ev)
{
    if (document.pointerLockElement == canvas) 
    {
        g_camera.panHorizontal(ev.movementX * .3);
        if(g_cheatsEnabled === true)
        {
            g_camera.panVertical(ev.movementY * .3);
        }
    }
}

function keydown(ev)
{
    if(ev.keyCode == 87) // w
    {
        g_camera.moveForward(.2);
    }
    if(ev.keyCode == 83) // s
    {
        g_camera.moveBackward(.2);
    }
    if(ev.keyCode == 65) // a
    {
        g_camera.moveLeft(.2);
    }
    if(ev.keyCode == 68) // d
    {
        g_camera.moveRight(.2);
    }
    if(ev.keyCode == 81) // q
    {
        g_camera.panHorizontal(-10);
    }
    if(ev.keyCode == 69) // q
    {
        g_camera.panHorizontal(10);
    }
}


function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }
    
    // Get the storage location of attribute variable
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    u_TexSelect = gl.getUniformLocation(gl.program, 'u_TexSelect');
    if (!u_TexSelect) {
        console.log('Failed to get the storage location of u_TexSelect');
        return;
    }

    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) 
    {
        console.log('Failed to get storage location of u_Sampler0');
        return false;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) 
    {
        console.log('Failed to get storage location of u_Sampler1');
        return false;
    }
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) 
    {
        console.log('Failed to get storage location of u_Sampler2');
        return false;
    }
}

function setupHTMLElements() {
    const toggleButton = document.getElementById("toggleButton");
    if (!toggleButton) {
        console.log('Failed to retrieve the toggleButton element');
        return;
    }
    toggleButton.addEventListener("click", function() {g_cheatsEnabled = !(g_cheatsEnabled); });
}

function click() {
    if(!g_cheatsEnabled)
    {
        return;
    }
    console.log("Click Triggered");
    var targetCoords = g_camera.at.elements;
    var tX = Math.floor(targetCoords[0]);
    var tY = Math.floor(targetCoords[1]);
    var tZ = Math.floor(targetCoords[2]);
    console.log("tX=" + tX + "   tY=" + tY + "   tZ=" + tZ);
    if (tX < 0 || tY < 0 || tZ < 0) {
        console.log("Negative Target");
        return;
    }
    if (tX < g_map.length && tY < g_map[tX].length && tZ < g_map[tX][tY].length)
    {

        var blockValue = g_map[tX][tY][tZ];
        console.log("Map@target=" + blockValue);
        console.log("" + g_map);
        if (blockValue != 0)
        {
            for(var i = 0; i < g_objList.length; i++)
            {
                var xTranslation = g_objList[i].matrix.elements[12];
                var yTranslation = g_objList[i].matrix.elements[13];
                var zTranslation = g_objList[i].matrix.elements[14];
                if (xTranslation == tX && yTranslation == tY && zTranslation == tZ )
                {
                    console.log("Removing Block");
                    g_objList.splice(i, 1);
                    g_map[tX][tY][tZ] = 0;
                    break;
                }
                
            }
        }
        else
        {
            cube = new Cube(1);
            cube.matrix.setTranslate(tX,tY,tZ);
            g_objList.push(cube);
            g_map[tX][tY][tZ] = 1;
        }
    }
}


function renderAllObjects() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var len = g_objList.length;
    //console.log("Num Shapes " + len);
    for (var i = 0; i < len; i++)  {
        g_objList[i].render();
    }
} 

function initTextures()
{
    var texImage0 = new Image();
    if(!texImage0)
    {
        console.log('Failed to create image object 0');
        return false;
    }

    texImage0.onload = function(){ loadTexture(texImage0, u_Sampler0, 0); };
    texImage0.src = 'grass.png';

    var texImage1 = new Image();
    if(!texImage1)
    {
        console.log('Failed to create image object 1');
        return false;
    }

    texImage1.onload = function(){ loadTexture(texImage1, u_Sampler1, 1); };
    texImage1.src = 'brick.png';

    var texImage2 = new Image();
    if(!texImage2)
    {
        console.log('Failed to create image object 2');
        return false;
    }

    texImage2.onload = function(){ loadTexture(texImage2, u_Sampler2, 2); };
    texImage2.src = 'diamond.jpg';

    return true;
}

function loadTexture(image, sampler, n)
{
    var texture = gl.createTexture();
    if (!texture) 
    {
        console.log('Failed to create Texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    if (n == 0)
    {
        gl.activeTexture(gl.TEXTURE0);
    }
    else if (n == 1)
    {
        gl.activeTexture(gl.TEXTURE1);
    }
    else if (n == 2)
    {
        gl.activeTexture(gl.TEXTURE2);
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(sampler, n);

    console.log('Texture Loaded');
}


function updateAllObjects() {
    g_camera.update();
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projMatrix.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);
    
    var len = g_objList.length;
    //console.log("Num Shapes " + len);
    for (var i = 0; i < len; i++)  {
        g_objList[i].update();
    }  
} 
