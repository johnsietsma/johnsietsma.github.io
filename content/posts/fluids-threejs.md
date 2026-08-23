---
title: "Using a Fluid Sim to Generate a Flow Map"
publishDate: 2016-04-14T00:00:00+10:00
description: "Here is a proof of concept of using a 2D fluid simluation to generate a Flow Map. This follows on from my Fluid/Flow Map ShaderToy experiment to do the ..."
tags:
  - threejs
  - fluidsim
  - flowmap
---



# Fluid Simulation to Generate a Flow Map

Here is a proof of concept of using a 2D fluid simluation to generate a [Flow Map](/posts/flow-maps/). This follows on from my [Fluid/Flow Map ShaderToy experiment](/posts/fluid-flow-shadertoy/) to do the same thing, except here I have a much better fluid simulation.

**Press the 'f' key to swap between the fluid simulation and the flow map**. When the flow map is being displayed the fluid simulation stops. 

This could be used in a game to deal with dynamic obstacles in water or smoke, without having to run a full fluid simulation all the time. The fluid simulation could be amortised over many frames, leading to a cheap fluid effect.

The implmentation is in ThreeJs/WebGL, check the source code of this page for details.

 



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

<script type="x-shader/x-fragment" id="uvDebugFrag">

varying vec2 vUv;
    
void main()
{
    gl_FragColor = vec4(vUv, 0.0, 1.0);
}
</script>
<script type="x-shader/x-fragment" id="advectionFrag">
// Advection

uniform float time;
uniform float timeDelta;
uniform vec2 texelSize;
uniform sampler2D velocityField;

const vec2 ObstaclePos = vec2(0.5,0.5);
const float ObstacleRadius = 0.1;


varying vec2 vUv;


vec2 calcAdvection()
{
    vec2 currVel = texture2D(velocityField,vUv).xy;
    vec2 backPos = vUv - currVel * texelSize * timeDelta;
    return texture2D(velocityField,backPos).xy;
}

vec2 clampBorder( vec2 value )
{
    // Clamp value at borders to zero.
    if( vUv.x>1.0-texelSize.x ||
        vUv.y>1.0-texelSize.y ||
        vUv.x<texelSize.x     ||
        vUv.y<texelSize.y )
    {
        return vec2(0.0, 0.0);
    }
    
    return value;
}

void main()
{
    gl_FragColor = vec4(0.0 ,0.0, 1.0, 1.0);
    vec2 movingObstaclePosition = vec2(ObstaclePos.x, ObstaclePos.y+sin(time*0.2)*0.2);
    if( distance(vUv, movingObstaclePosition) > ObstacleRadius ) {
        vec2 newVel = calcAdvection();
        newVel = clampBorder( newVel );
        gl_FragColor = vec4(newVel, 0.0, 1.0);
    }
}
</script>

<script type="x-shader/x-fragment" id="diffusionFrag">

// Diffusion
uniform float timeDelta;
uniform vec2 texelSize;
uniform sampler2D velocityField;

varying vec2 vUv;

const float Viscosity = 0.1;
const float DiffusionAlpha = 1.0 / Viscosity;
const float DiffusionBetaReciprocal = 1.0 / (4.0 + DiffusionAlpha);

bool isBorder()
{
    if( vUv.x>1.0-texelSize.x ||
      	vUv.y>1.0-texelSize.y ||
        vUv.x<texelSize.x     ||
        vUv.y<texelSize.y )
    {
        return true;
    }
    return false;
}

bool isObstacle()
{
    return texture2D(velocityField, vUv).z > 0.0;
}

float calcPressure()
{
    if( isBorder() ) return 0.0;
    
    vec2 xOffset = vec2(texelSize.x,0);
    vec2 yOffset = vec2(0,texelSize.y);
    
    float x0 = texture2D(velocityField,vUv-xOffset).x;
    float x1 = texture2D(velocityField,vUv+xOffset).x;
    float y0 = texture2D(velocityField,vUv-yOffset).x;
    float y1 = texture2D(velocityField,vUv+yOffset).x;
    
    float div = texture2D(velocityField,vUv).x;
    return ( x0 + x1 + y0 + y1 + DiffusionAlpha * div ) * DiffusionBetaReciprocal;
}

void main()
{
    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    if( !isObstacle() ) {
        gl_FragColor = vec4( calcPressure(), 0.0, 0.0, 1.0 );
    }
}

</script>
<script type="x-shader/x-fragment" id="forceFrag">
// Advection + Force

uniform float timeDelta;
uniform sampler2D velocityField;

const float ForceStrength = 30.0;
const vec2 ForcePos = vec2(0.2, 0.5);
const float ForceRadius = 0.15;

varying vec2 vUv;


vec2 calcForce()
{
    float forceDist = distance(vUv, ForcePos);
    float forceValue = (1.0-step(ForceRadius,forceDist)) * ForceStrength;
    return vec2(forceValue, 0.0) * timeDelta;
}

void main()
{
    gl_FragColor = texture2D( velocityField, vUv );
    if( gl_FragColor.z == 0.0 ) { // Check for obstacles 
        gl_FragColor += vec4( calcForce(), 0.0, 1.0 );
    }
}
</script>

<script type="x-shader/x-fragment" id="divergenceFrag">

// Divergence

uniform vec2 texelSize;
uniform sampler2D velocityField;

varying vec2 vUv;


float calcDivergence()
{
    const float rHalfGridScale = 0.5; // 0.5/gridScale
    vec2 xOffset = vec2(texelSize.x,0);
    vec2 yOffset = vec2(0,texelSize.y);
    
    float x0 = texture2D(velocityField,vUv-xOffset).x;
    float x1 = texture2D(velocityField,vUv+xOffset).x;
    float y0 = texture2D(velocityField,vUv-yOffset).y;
    float y1 = texture2D(velocityField,vUv+yOffset).y;
    
    return rHalfGridScale * ((x1-x0) + (y1-y0));

}

void main()
{
    gl_FragColor = texture2D( velocityField, vUv );
    if( gl_FragColor.z == 0.0 ) { // Check for obstacles
        gl_FragColor = vec4( calcDivergence(), 0.0, 0.0, 1.0 );
    }
}

</script>

<script type="x-shader/x-fragment" id="pressureFrag">

// Pressure

uniform vec2 texelSize;
uniform sampler2D velocityField;
uniform sampler2D divergenceField;
uniform sampler2D pressureField;

varying vec2 vUv;

bool isBorder()
{
    if( vUv.x>1.0-texelSize.x ||
        vUv.y>1.0-texelSize.x ||
        vUv.x<texelSize.x     ||
        vUv.y<texelSize.y )
    {
        return true;
    }
    return false;
}

bool isObstacle()
{
    return texture2D(velocityField, vUv).z > 0.0;
}

float calcPressure()
{
    if( isBorder() ) return 0.0;
    
    const float rBeta = 0.25; // 1/4
    vec2 xOffset = vec2(texelSize.x,0);
    vec2 yOffset = vec2(0,texelSize.y);
    
    float x0 = texture2D(pressureField,vUv-xOffset).x;
    float x1 = texture2D(pressureField,vUv+xOffset).x;
    float y0 = texture2D(pressureField,vUv-yOffset).x;
    float y1 = texture2D(pressureField,vUv+yOffset).x;
    
    float div = texture2D(divergenceField,vUv).x;
    return ( x0 + x1 + y0 + y1 - div ) * rBeta;
}

void main()
{
    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    if( !isObstacle() ) {
        gl_FragColor = vec4( calcPressure(), 0.0, 0.0, 1.0 );
    }
}

</script>
<script type="x-shader/x-fragment" id="projectionFrag">

// Projection

uniform vec2 texelSize;
uniform sampler2D velocityField;
uniform sampler2D divergenceField;
uniform sampler2D pressureField;

varying vec2 vUv;


vec2 calcProjection()
{
    const float rHalfGridScale = 0.5; // 0.5/gridScale
    
    vec2 xOffset = vec2(texelSize.x,0);
    vec2 yOffset = vec2(0,texelSize.y);
    
    float x0 = texture2D(pressureField,vUv-xOffset).x;
    float x1 = texture2D(pressureField,vUv+xOffset).x;
    float y0 = texture2D(pressureField,vUv-yOffset).x;
    float y1 = texture2D(pressureField,vUv+yOffset).x;
    
    // Gradient subtraction
    vec2 vel = texture2D(velocityField,vUv).xy;
    vel -= rHalfGridScale * (vec2(x1,y1)-vec2(x0,y0));
    
    return vel;
    
}

void main()
{
    gl_FragColor = texture2D( velocityField, vUv );
    if( gl_FragColor.z == 0.0 ) {
        gl_FragColor = vec4(calcProjection(), 0.0, 1.0);
    }
}

</script>
<script type="x-shader/x-fragment" id="fluidFrag">

uniform float time;
uniform vec2 texelSize;
uniform sampler2D velocityField;
uniform sampler2D divergenceField;
uniform sampler2D pressureField;
uniform sampler2D texture;

varying vec2 vUv;

void main()
{
    vec3 velocity = texture2D(velocityField,vUv).xyz;
    vec2 flowDirection = velocity.xy * -0.02;
    
    if( gl_FragColor.z == 0.0 ) {
        gl_FragColor = vec4( abs(flowDirection), 0.0, 1.0);
    }
    else {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    }
}

</script>

<script type="x-shader/x-fragment" id="flowFluidFrag">

uniform float time;
uniform vec2 texelSize;
uniform sampler2D velocityField;
uniform sampler2D divergenceField;
uniform sampler2D pressureField;
uniform sampler2D texture;

varying vec2 vUv;

void main()
{
    vec3 velocity = texture2D(velocityField,vUv).xyz;
    
    if( velocity.z == 0.0 ) {
        vec2 flowDirection = velocity.rg * -0.01;
        
        const float cycleTime = 20.0;
        const float flowSpeed = 0.4;

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
    else {
        gl_FragColor = vec4( vec3(0.25), 1.0);
    }
}

</script>

<script type="x-shader/x-fragment" id="smokeFluidFrag">

uniform float time;
uniform vec2 texelSize;
uniform sampler2D velocityField;
uniform sampler2D divergenceField;
uniform sampler2D pressureField;
uniform sampler2D texture;

varying vec2 vUv;

void main()
{
    vec3 velocity = texture2D(velocityField,vUv).xyz;
    if( velocity.z == 0.0 ) {
        vec2 flowDirection = velocity.xy * -0.02;
        gl_FragColor = vec4( vec3(0.5 * length(flowDirection)), 1.0);
    }
    else {
        gl_FragColor = vec4( vec3(0.25), 1 );
    }
        
}

</script>


<script src="/assets/js/DoubleBufferedRenderTarget.js"></script>

<script>

var waterTexture = new THREE.TextureLoader().load('/assets/images/textures/water.jpg');

var fullScreenMesh;
var currentMaterial = 0;
var fluidFlowMaterial;
var smokeFlowMaterial;

var onKeyDown = function(event) {
    if( event.keyCode!='F'.charCodeAt(0) ) return;
    if( currentMaterial == 0 ) fullScreenMesh.material = fluidFlowMaterial;
    else if( currentMaterial == 1 ) fullScreenMesh.material = smokeFlowMaterial;
    fullScreenMesh.material.needsUpdate = true;
    currentMaterial = (currentMaterial+1)%2;
}

document.addEventListener('keydown', onKeyDown, false);

function initCanvas_FluidFlowMap( threeContext )
{
    var fluidSimSize = 256;
    var targetOptions = { type: THREE.FloatType }; 
    threeContext.velocityTargets = new DoubleBufferedRenderTarget();
    threeContext.pressureTargets = new DoubleBufferedRenderTarget();
    threeContext.divergenceTarget = new THREE.WebGLRenderTarget( fluidSimSize, fluidSimSize, targetOptions );
    threeContext.fluidTarget = new THREE.WebGLRenderTarget( fluidSimSize, fluidSimSize, targetOptions );
    
    
    var defaultUniforms = {
      time: { type: "f", value: 0.0 },
      timeDelta: { type: "f", value: 0.0 },
      texelSize: { type: "v2", value: new THREE.Vector2(1.0/fluidSimSize,1.0/fluidSimSize) },
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      generateMipMaps: false  
    };
    
    // Advection
    var uniformsVelocity = {
      velocityField: { type: "t", value: null },
    };
    
    var uniformsVelocityDivergencePressure = {
      velocityField: { type: "t", value: null },
      divergenceField: { type: "t", value: threeContext.divergenceTarget.texture },
      pressureField: { type: "t", value: null },
    };

    threeContext.advectionUniforms = Object.extend( Object.clone(defaultUniforms), uniformsVelocity );
    threeContext.advectionScene = createFullScreenQuadScene( "passthroughVert", "advectionFrag", threeContext.advectionUniforms );
    
    // Diffusion
    threeContext.diffusionUniforms = Object.extend( Object.clone(defaultUniforms), uniformsVelocity );
    threeContext.diffusionScene = createFullScreenQuadScene( "passthroughVert", "diffusionFrag", threeContext.diffusionUniforms );
    
    // Force
    threeContext.forceUniforms = Object.extend( Object.clone(defaultUniforms), uniformsVelocity );
    threeContext.forceScene = createFullScreenQuadScene( "passthroughVert", "forceFrag", threeContext.forceUniforms );
        
    // Divergence
    threeContext.divergenceUniforms = Object.extend( Object.clone(defaultUniforms), uniformsVelocity );
    threeContext.divergenceScene = createFullScreenQuadScene( "passthroughVert", "divergenceFrag", threeContext.divergenceUniforms );

    // Pressure
    threeContext.pressureUniforms = Object.extend( Object.clone(defaultUniforms), uniformsVelocityDivergencePressure );
    threeContext.pressureScene = createFullScreenQuadScene( "passthroughVert", "pressureFrag", threeContext.pressureUniforms );

    // Projection
    threeContext.projectionUniforms = Object.extend( Object.clone(defaultUniforms), uniformsVelocityDivergencePressure );
    threeContext.projectionScene = createFullScreenQuadScene( "passthroughVert", "projectionFrag", threeContext.projectionUniforms );
    
    threeContext.uniforms = {
      velocityField: { type: "t", value: null },
      divergenceField: { type: "t", value: threeContext.divergenceTarget.texture },
      pressureField: { type: "t", value: null },
      texture: { type: "t", value: waterTexture },
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      generateMipMaps: false  
    };

    threeContext.renderer.autoClear = false;
    threeContext.uniforms.texture.value.wrapS = threeContext.uniforms.texture.value.wrapT = THREE.RepeatWrapping;
    
    threeContext.initFullScreenCanvas( 'passthroughVert', 'smokeFluidFrag' );
    
    fullScreenMesh = threeContext.scene.getObjectByName("FullScreenQuad");
    fluidFlowMaterial = createMaterial('passthroughVert', 'flowFluidFrag', threeContext.uniforms);
    smokeFlowMaterial = createMaterial('passthroughVert', 'smokeFluidFrag', threeContext.uniforms);

}



function renderCanvas_FluidFlowMap( threeContext )
{
    if( currentMaterial == 1 ) return; // Don't update the fluid if we're rendering the flow map
  
    threeContext.updateDefaultUniforms( this.advectionUniforms );
    threeContext.updateDefaultUniforms( this.diffusionUniforms );
    threeContext.updateDefaultUniforms( this.forceUniforms );
    threeContext.updateDefaultUniforms( this.divergenceUniforms );
    threeContext.updateDefaultUniforms( this.pressureUniforms );
    threeContext.updateDefaultUniforms( this.projectionUniforms );
    
    // ---- Advection ----
    threeContext.advectionUniforms.velocityField.value = threeContext.velocityTargets.getSource().texture;
    threeContext.renderer.render( threeContext.advectionScene, threeContext.camera, threeContext.velocityTargets.getTarget(), false );
    threeContext.velocityTargets.swap();
        
    // ---- Diffusion ----
    /*
    for( i=0; i<1; i++ ) {
        this.diffusionUniforms.velocityField.value = threeContext.velocityTargets.getSource().texture;
        threeContext.renderer.render( threeContext.diffusionScene, threeContext.camera, threeContext.velocityTargets.getTarget(), false );
        
        threeContext.velocityTargets.swap();
    }*/
    
    // ---- Force ----    
    threeContext.forceUniforms.velocityField.value = threeContext.velocityTargets.getSource().texture;
    threeContext.renderer.render( threeContext.forceScene, threeContext.camera, threeContext.velocityTargets.getTarget(), false );
    threeContext.velocityTargets.swap();
    
    // ---- Divergence ----
    threeContext.divergenceUniforms.velocityField.value = threeContext.velocityTargets.getSource().texture; 
    threeContext.renderer.render( threeContext.divergenceScene, threeContext.camera, threeContext.divergenceTarget, false );
    
    // ---- Pressure ----
    this.pressureUniforms.velocityField.value = threeContext.velocityTargets.getSource().texture;
           
    for( i=0; i<40; i++ ) {
        this.pressureUniforms.pressureField.value = threeContext.pressureTargets.getSource().texture;
        threeContext.renderer.render( threeContext.pressureScene, threeContext.camera, threeContext.pressureTargets.getTarget(), false );
        threeContext.pressureTargets.swap();
    }
    
    // ---- Projection ----
    this.projectionUniforms.velocityField.value = threeContext.velocityTargets.getSource().texture;
    this.projectionUniforms.pressureField.value = threeContext.pressureTargets.getTarget().texture;
    threeContext.renderer.render( threeContext.projectionScene, threeContext.camera, threeContext.velocityTargets.getTarget(), false );
    threeContext.velocityTargets.swap();
    
    threeContext.uniforms.velocityField.value = threeContext.velocityTargets.getSource().texture;
    threeContext.uniforms.pressureField.value = threeContext.pressureTargets.getTarget().texture;
}

</script>



<div class="threejs">
    <canvas id="CanvasFinal" width="640px" height="640px" style="background-color: #aaaaaa"></canvas>
</div>

<script>
    if ( Detector.webgl )
    {
        var contextCanvasFinal = new ThreeContext( "CanvasFinal", initCanvas_FluidFlowMap, renderCanvas_FluidFlowMap );
        contextCanvasFinal.render();
    }
    else {
        Detector.addGetWebGLMessage();
    }
</script>