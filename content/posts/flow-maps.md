---
title: "Flow maps in three.js"
publishDate: 2015-12-01T00:00:00+10:00
description: "Flow maps are a simple way to get some movement into your shader. Valve"
tags:
  - threejs
  - glsl
  - shader
  - flowmap
---




Flow maps are a simple way to get some movement into your shader. [Valve](http://www.valvesoftware.com/publications/2010/siggraph2010_vlachos_waterflow.pdf)
and [The Wild External](http://www.thewildeternal.com/2014/09/02/devlog-flowing-water/) have documented the process pretty throughly.

I thought I'd try a GLSL/Three.js implmentation.




<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r75/three.min.js"></script>
<!--<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r75/three.js"></script>-->
<!--<script src="/assets/js/three.r75.js"></script>-->
<script src="/assets/js/Detector.js"></script>
<script src="/assets/js/stats.min.js"></script>

<script type="x-shader/x-fragment" id="magentaFragmentShader">
    void main()
    {
        gl_FragColor = vec4(1.0,0.0,1.0,1.0);
    }
</script>

<script type="x-shader/x-vertex" id="passthroughVert">
    varying vec2 vUv;
    
    #ifdef USE_COLOR
    varying vec3 vColor;
    #endif
    
    void main()
    {
        vUv = uv;
        
        #ifdef USE_COLOR
        vColor = color;
        #endif
        
        gl_Position = vec4(position,1.0);
    }
</script>


<script>

Object.clone = function(source) {
    var destination = {};
    for (var property in source) {
        if (source.hasOwnProperty(property)) {
            destination[property] = source[property];
        }
    }
    return destination;
};
    
Object.extend = function(destination, source) {
    for (var property in source) {
        if (source.hasOwnProperty(property)) {
            destination[property] = source[property];
        }
    }
    return destination;
};

function createMaterial(vertShaderName, fragShaderName, uniforms, useVertColors)
{
    var vShader = document.getElementById( vertShaderName );
    if( vShader==null ) console.error( "Couldn't find vert shader: " + vertShaderName );
    
    var fShader = document.getElementById( fragShaderName );
    if( fShader==null ) console.error( "Couldn't find frag shader: " + fragShaderName );
    
    return new THREE.ShaderMaterial({
        uniforms: uniforms || {},
        vertexShader: vShader.text,
        fragmentShader: fShader.text,
        vertexColors: useVertColors ? THREE.VertexColors: THREE.NoColors
    });
}
    
function createFullScreenQuad(vertShaderName, fragShaderName, uniforms, useVertColors)
{
    var shaderMaterial = createMaterial(vertShaderName, fragShaderName, uniforms, useVertColors);
    var planeGeo = new THREE.PlaneGeometry( 2, 2, 1, 1 );
    var mesh = new THREE.Mesh( planeGeo, shaderMaterial );
    mesh.name = "FullScreenQuad";
    return mesh;
}

function createFullScreenQuadScene(vertShaderName, fragShaderName, uniforms, useVertColors)
{
    var plane = createFullScreenQuad( vertShaderName, fragShaderName, uniforms, useVertColors );
    var scene = new THREE.Scene();
    scene.add(plane);
    return scene;
}
   
    
function setVertColors( mesh, color )
{
    for ( var i = 0; i < mesh.faces.length; i++ ) 
    {
        var face = mesh.faces[ i ];
        face.vertexColors = [color, color, color];
    }
}


</script>

<script>
"use strict";

if ( ! Detector.webgl ) { Detector.addGetWebGLMessage(); }

var ThreeContext = function( canvasName, initFunction, renderFunction ) 
{
    this.canvas = document.getElementById( canvasName );
    this.renderer = new THREE.WebGLRenderer( {canvas: this.canvas, antialiasing: true } );
    this.uniforms = {};
    this.scene = new THREE.Scene();
    this.camera = null;
    this.clock = new THREE.Clock( true );
    this.renderFunction = renderFunction;
    
    
    //this.stats = new Stats();
    //this.stats.domElement.style.position = 'absolute';
    //this.stats.domElement.style.top = '0px';
    //this.canvas.parentNode.appendChild( this.stats.domElement );
    
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.onWindowResize();
    
    window.onresize = this.onWindowResize.bind(this);
    
    if( initFunction != 'undefined' ) {
        initFunction( this );
    }
    else {
        // Use a default camera
        this.camera = new THREE.PerspectiveCamera( 45, 1, 0.1, 1000 );
    }
}   

ThreeContext.prototype.onWindowResize = function (event) {
    this.size = [this.canvas.clientWidth, this.canvas.clientHeight]; 
    this.renderer.setSize( this.size[0], this.size[1] );
} 

ThreeContext.prototype.initFullScreenCanvas = function( vertShaderName, fragShaderName, useVertColors )
{
    var halfSize = [this.size[0]/2, this.size[1]/2];

    // Setup camera
    this.camera = new THREE.OrthographicCamera( -halfSize[0], halfSize[0], halfSize[1], -halfSize[1], -1, 1000 );
    this.camera.position.z = 1;
    
    var defaultUniforms = {
        time: { type: "f", value: 0.0 },
        timeDelta: { type: "f", value: 0.0 },
    };
    this.uniforms = Object.extend(defaultUniforms, this.uniforms || {});
    this.scene = createFullScreenQuadScene( vertShaderName, fragShaderName, this.uniforms, useVertColors );
}

ThreeContext.prototype.updateDefaultUniforms = function (uniforms)
{
    if( uniforms.timeDelta!=null ) uniforms.timeDelta.value = this.timeDelta;
    if( uniforms.time!=null )  uniforms.time.value = this.clock.elapsedTime;
}

ThreeContext.prototype.render = function () {
    if( !this.camera ) return;
    var self = this;
    requestAnimationFrame( function() { self.render(); } );
    
    this.timeDelta = this.clock.getDelta();
    this.updateDefaultUniforms( this.uniforms );
    
    this.renderer.clear();
    
    if( this.renderFunction != 'undefined' && this.renderFunction != null ) {
        this.renderFunction( this );
    }
        
    this.renderer.render( this.scene, this.camera );
    //this.stats.update();
}
  
    
</script>

<script type="x-shader/x-fragment" id="flowDirectionFrag">
    uniform sampler2D texture;
    uniform sampler2D flowMap;
    
    varying vec2 vUv;
    varying vec3 vColor;
    
    void main()
    {
        vec2 flowDirection = (texture2D( flowMap, vUv ).rg - 0.5) * 2.0;
        vec2 uv = vUv + flowDirection;
        gl_FragColor = texture2D( texture, vUv );
    }
</script>

<script type="x-shader/x-fragment" id="flowMapTimeCycleFrag">
    uniform float time;
    uniform sampler2D texture;
    uniform sampler2D flowMap;
    
    varying vec2 vUv;
    varying vec3 vColor;
    
    #define CYCLE_TIME 3.0
    
    void main()
    {
        float timeScaled = time / CYCLE_TIME;
        float timeCycle = timeScaled - floor(timeScaled);
    
        vec2 flowDirection = (texture2D( flowMap, vUv ).rg - 0.5) * 2.0;
        
        vec2 uv = vUv + flowDirection * timeCycle;
        gl_FragColor = texture2D( texture, uv );
    }
</script>
<script type="x-shader/x-fragment" id="flowMapFrag">
    uniform float time;
    uniform sampler2D texture;
    uniform sampler2D flowMap;
    uniform float flowSpeed; // How fast it flows
    uniform float cycleTime; // How long one complete lerp between flows takes
    
    varying vec2 vUv;
    
    void main()
    {
        // Look up the flow direction from the flow map.
        vec2 flowDirection = (texture2D( flowMap, vUv ).rg - 0.5) * 2.0;
        
        // Use two cycles, offset by a half so we can blend between them
        float t1 = time / cycleTime;
        float t2 = t1 + 0.5;
        float cycleTime1 = t1 - floor(t1);
        float cycleTime2 = t2 - floor(t2);
        vec2 flowDirection1 = flowDirection * cycleTime1 * flowSpeed;
        vec2 flowDirection2 = flowDirection * cycleTime2 * flowSpeed;
        vec2 uv1 = vUv + flowDirection1;
        vec2 uv2 = vUv + flowDirection2;
        vec4 color1 = texture2D( texture, uv1 );
        vec4 color2 = texture2D( texture, uv2 );
        
        // Ping pong between the two flows, showing the least distorted and allowing uv resets on both.
        gl_FragColor = mix( color1, color2, abs(cycleTime1-0.5)*2.0 );
    }
</script>



<script>

// Load the textures
var waterTexture = new THREE.TextureLoader().load('/assets/images/textures/water.jpg');
var flowMap = new THREE.TextureLoader().load('/assets/images/textures/flowMap.png');


function initCanvas_FlowDirection( threeContext )
{
    threeContext.uniforms = {
        texture: { type: "t", value: waterTexture },
        flowMap: { type: "t", value: flowMap },
    };

    threeContext.initFullScreenCanvas( 'passthroughVert', 'flowDirectionFrag' );
}

function initCanvas_FlowMapTimeCycle( threeContext )
{
    threeContext.uniforms = {
        texture: { type: "t", value: waterTexture },
        flowMap: { type: "t", value: flowMap },
    };
    
    threeContext.uniforms.flowMap.value.wrapS = threeContext.uniforms.flowMap.value.wrapT = THREE.RepeatWrapping;
    threeContext.uniforms.texture.value.wrapS = threeContext.uniforms.texture.value.wrapT = THREE.RepeatWrapping;
    
    threeContext.initFullScreenCanvas( 'passthroughVert', 'flowMapTimeCycleFrag' );
}

function initCanvas_FlowMap( threeContext )
{
    threeContext.uniforms = {
        texture: { type: "t", value: waterTexture },
        flowMap: { type: "t", value: flowMap },
        flowSpeed: { type: "f", value: 0.5 },
        cycleTime: { type: "f", value: 20 },
    };
    
    threeContext.initFullScreenCanvas( 'passthroughVert', 'flowMapFrag' );
}


</script>


# Flow Maps

Flow maps are texures that uses the red and green channels to offset pixels vertically and horizontally. 

For example a value of 0 in the red channel will move the pixel fully to the left, 0.5 will not move at all and 1 will move all the way to the right. How much the pixel is moved is scaled based on the 
flow speed and time value.

Here's the shader code to get the flow direction from the shader map. It takes the color value, which in the 0 to 1 range, and rescales into a -1 to 1 range.

```vec2 flowDirection = (texture2D( flowMap, vUv ).rg - 0.5) * 2.0;```

Here's a flow map that will move in a roughly circular shape. 

![Flow map](/assets/images/textures/flowMap.png)

Using that flow map let's move the pixels in a water texture:
<div class="threejs">
    <canvas id="CanvasSingle" width="320px" height="320px" style="background-color: #aaaaaa"></canvas>
</div>

<script>
    if ( Detector.webgl )
    {
        var contextCanvasSingle = new ThreeContext( "CanvasSingle", initCanvas_FlowDirection, null );
        contextCanvasSingle.render();
    }
    else {
        Detector.addGetWebGLMessage();
    }
</script>
 

Next I'll add a time offset to make the flow move over time, with a time reset every 3 seconds.

Here is how I calculate the time cycle, normalised between 0 and 1:

~~~javascript
float timeScaled = time / 3;
float timeCycle = timeScaled - floor(timeScaled);
~~~

<div class="threejs">
    <canvas id="CanvasSingleTime" width="320px" height="320px" style="background-color: #aaaaaa"></canvas>
</div>

<script>
    if ( Detector.webgl )
    {
        var contextCanvasSingleTime = new ThreeContext( "CanvasSingleTime", initCanvas_FlowMapTimeCycle, null );
        contextCanvasSingleTime.render();
    }
    else {
        Detector.addGetWebGLMessage();
    }
</script>

As you can see the water flows well, but becomes more distorted over time. The trick to solve this is to have two flows that are offset by half and lerp between the two flows. When one flow is being reset the other flow is fully visible.

Here's how you lerp between the two:

```gl_FragColor = mix( waterColor1, waterColor2, abs(cycleTime-0.5)*2.0 );```


And here's the final result.

<div class="threejs">
    <canvas id="CanvasFinal" width="640px" height="640px" style="background-color: #aaaaaa"></canvas>
</div>

<script>
    if ( Detector.webgl )
    {
        var contextCanvasFinal = new ThreeContext( "CanvasFinal", initCanvas_FlowMap, null );
        contextCanvasFinal.render();
    }
    else {
        Detector.addGetWebGLMessage();
    }
</script>


Don't forget you can view source on this page for more implementation details.

