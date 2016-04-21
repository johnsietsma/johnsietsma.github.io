---
layout: post
title: Using a Fluid Sim to Generate a Flow Map
tags: threejs, fluidsim, flowmap
#eye_catch: http://jekyllrb.com/img/logo-2x.png
---


# Fluid Simulation to Generate a Flow Map

Here is a proof of concept of using a 2D fluid simluation to generate a [Flow Map]({% post_url 2015-12-01-flow-maps %}). This follows on from my [Fluid/Flow Map ShaderToy experiment]({% post_url 2016-04-13-fluid-flow-shadertoy %}) to do the same thing, except here I have a much better fluid simulation.

Press the 'f' key to swap between the fluid simulation and the flow map. When the flow map is being displayed the fluid simulation stops. 

This could be used in a game to deal with dynamic obstacles in water or smoke, without having to run a full fluid simulation all the time. The fluid simulation could be amortised over many frames, leading to a cheap fluid effect.

The implmentation is in ThreeJs/WebGL, check the source code of this page for details.

 
<!--more-->


{% include threejs.html %}

{% include shaders/flowDirection.frag %}
{% include shaders/flowMapTimeCycle.frag %}
{% include shaders/flowMap.frag %}
{% include shaders/uvDebug.frag %}
{% include shaders/fluid/advection.frag %}
{% include shaders/fluid/diffusion.frag %}
{% include shaders/fluid/force.frag %}
{% include shaders/fluid/divergence.frag %}
{% include shaders/fluid/pressure.frag %}
{% include shaders/fluid/projection.frag %}
{% include shaders/fluid/fluid.frag %}
{% include shaders/fluid/flowFluid.frag %}
{% include shaders/fluid/smokeFluid.frag %}

<script src="{{ '/js/DoubleBufferedRenderTarget.js'' | prepend: site.assetsurl }}"></script>

<script>

var waterTexture = new THREE.TextureLoader().load('{{ site.assetsurl }}/images/textures/water.jpg');

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
    var targetOptions = { type: THREE.FloatType }; 
    threeContext.velocityTargets = new DoubleBufferedRenderTarget();
    threeContext.pressureTargets = new DoubleBufferedRenderTarget();
    threeContext.divergenceTarget = new THREE.WebGLRenderTarget( 512, 512, targetOptions );
    threeContext.fluidTarget = new THREE.WebGLRenderTarget(512, 512, targetOptions );
    
    
    var defaultUniforms = {
      time: { type: "f", value: 0.0 },
      timeDelta: { type: "f", value: 0.0 },
      texelSize: { type: "v2", value: new THREE.Vector2(1.0/512.0,1.0/512.0) },
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
           
    for( i=0; i<50; i++ ) {
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



{% include threejs-canvas.html canvas-size='640px' canvas-name='CanvasFinal' init-function='initCanvas_FluidFlowMap' render-function='renderCanvas_FluidFlowMap' %}