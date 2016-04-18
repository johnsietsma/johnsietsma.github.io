---
layout: post
title: Fluids Three.js
tags: threejs, fluidsim
#eye_catch: http://jekyllrb.com/img/logo-2x.png
---

{% include threejs.html %}

{% include shaders/flowDirection.frag %}
{% include shaders/flowMapTimeCycle.frag %}
{% include shaders/flowMap.frag %}
{% include shaders/uvDebug.frag %}
{% include shaders/fluid/advection.frag %}
{% include shaders/fluid/divergence.frag %}
{% include shaders/fluid/pressure.frag %}
{% include shaders/fluid/projection.frag %}
{% include shaders/fluid/fluid.frag %}

<script>

var waterTexture = new THREE.TextureLoader().load('{{ site.assetsurl }}/images/textures/water.jpg');
var flowMap = new THREE.TextureLoader().load('{{ site.assetsurl }}/images/textures/flowMap.png');

function initCanvas_FluidFlowMap( threeContext )
{
    var targetOptions = { type: THREE.FloatType }; 
    threeContext.velocityTargets = [ new THREE.WebGLRenderTarget( 512, 512, targetOptions ), new THREE.WebGLRenderTarget( 512, 512, targetOptions ) ];
    threeContext.pressureTargets = [ new THREE.WebGLRenderTarget( 512, 512, targetOptions ), new THREE.WebGLRenderTarget( 512, 512, targetOptions ) ];
    threeContext.currentPressureTarget = 0;
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
    
    // Advectiion
    var uniforms = {
      velocityField: { type: "t", value: threeContext.velocityTargets[0].texture },
    };
    threeContext.advectionUniforms = Object.extend( Object.clone(defaultUniforms), uniforms );
    threeContext.advectionScene = createFullScreenQuadScene( "passthroughVert", "advectionFrag", threeContext.advectionUniforms );
        
    // Divergence
    var uniforms = {
      velocityField: { type: "t", value: null },
    };
    threeContext.divergenceUniforms = Object.extend( Object.clone(defaultUniforms), uniforms );
    threeContext.divergenceScene = createFullScreenQuadScene( "passthroughVert", "divergenceFrag", threeContext.divergenceUniforms );

    // Pressure
    var uniforms = {
      velocityField: { type: "t", value: null },
      divergenceField: { type: "t", value: threeContext.divergenceTarget.texture },
      pressureField: { type: "t", value: null },
    };
    threeContext.pressureUniforms = Object.extend( Object.clone(defaultUniforms), uniforms );
    threeContext.pressureScene = createFullScreenQuadScene( "passthroughVert", "pressureFrag", threeContext.pressureUniforms );

    // Projection
    var uniforms = {
      velocityField: { type: "t", value: null },
      divergenceField: { type: "t", value: threeContext.divergenceTarget.texture },
      pressureField: { type: "t", value: null },
    };
    threeContext.projectionUniforms = Object.extend( Object.clone(defaultUniforms), uniforms );
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
    
    threeContext.initFullScreenCanvas( 'passthroughVert', 'fluidFrag' );
}


function renderCanvas_FluidFlowMap( threeContext )
{
    threeContext.updateDefaultUniforms( this.advectionUniforms );
    threeContext.updateDefaultUniforms( this.divergenceUniforms );
    threeContext.updateDefaultUniforms( this.pressureUniforms );
    threeContext.updateDefaultUniforms( this.projectionUniforms );
    
    var pressureSourceIndex = threeContext.currentPressureTarget;
    var pressureTargetIndex = (pressureSourceIndex+1)%2;
    
    threeContext.advectionUniforms.velocityField.value = threeContext.velocityTargets[0].texture;
    threeContext.renderer.render( threeContext.advectionScene, threeContext.camera, threeContext.velocityTargets[1], false );
    threeContext.renderer.render( threeContext.divergenceScene, threeContext.camera, threeContext.divergenceTarget, false );
    
    this.pressureUniforms.velocityField.value = threeContext.velocityTargets[1].texture;
    this.pressureUniforms.pressureField.value = threeContext.pressureTargets[pressureSourceIndex].texture;
    threeContext.renderer.render( threeContext.pressureScene, threeContext.camera, threeContext.pressureTargets[pressureTargetIndex], false );
    
    this.projectionUniforms.velocityField.value = threeContext.velocityTargets[1].texture;
    this.projectionUniforms.pressureField.value = threeContext.pressureTargets[pressureTargetIndex].texture;
    threeContext.renderer.render( threeContext.projectionScene, threeContext.camera, threeContext.velocityTargets[0], false );
    
    threeContext.uniforms.velocityField.value = threeContext.velocityTargets[0].texture;
    threeContext.uniforms.pressureField.value = threeContext.pressureTargets[pressureTargetIndex].texture;
    
    threeContext.currentPressureTarget = pressureTargetIndex;
}

</script>


{% include threejs-canvas.html canvas-size='640px' canvas-name='CanvasFinal' init-function='initCanvas_FluidFlowMap' render-function='renderCanvas_FluidFlowMap' %}