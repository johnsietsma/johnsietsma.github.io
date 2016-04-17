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

    threeContext.velocity1Target = new THREE.WebGLRenderTarget( 512, 512 );
    threeContext.velocity2Target = new THREE.WebGLRenderTarget( 512, 512 );
    threeContext.pressureTargets = [ new THREE.WebGLRenderTarget( 512, 512 ), new THREE.WebGLRenderTarget( 512, 512 )];
    threeContext.currentPressureTarget = 0;
    threeContext.divergenceTarget = new THREE.WebGLRenderTarget( 512, 512 );
    threeContext.fluidTarget = new THREE.WebGLRenderTarget(512, 512 );
    
    
    var defaultUniforms = {
      time: { type: "f", value: 0.0 },
      timeDelta: { type: "f", value: 0.0 },
      texelSize: { type: "v2", value: new THREE.Vector2(1.0,1.0) },
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      generateMipMaps: false  
    };
    
    // Advectiion
    var uniforms = {
      velocityField: { type: "t", value: threeContext.velocity1Target.texture },
    };
    threeContext.advectionUniforms = Object.extend( Object.clone(defaultUniforms), uniforms );
    threeContext.advectionScene = createFullScreenQuadScene( "passthroughVert", "advectionFrag", threeContext.advectionUniforms );
        
    // Divergence
    var uniforms = {
      velocityField: { type: "t", value: threeContext.velocity2Target.texture },
    };
    threeContext.divergenceUniforms = Object.extend( Object.clone(defaultUniforms), uniforms );
    threeContext.divergenceScene = createFullScreenQuadScene( "passthroughVert", "divergenceFrag", threeContext.velocityUniforms );

    // Pressure
    var uniforms = {
      velocityField: { type: "t", value: threeContext.velocity2Target.texture },
      divergenceField: { type: "t", value: threeContext.divergenceTarget.texture },
      pressureField: { type: "t", value: null },
    };
    threeContext.pressureUniforms = Object.extend( Object.clone(defaultUniforms), uniforms );
    threeContext.pressureScene = createFullScreenQuadScene( "passthroughVert", "pressureFrag", threeContext.pressureUniforms );

    // Projection
    var uniforms = {
      velocityField: { type: "t", value: threeContext.velocity2Target.texture },
      divergenceField: { type: "t", value: threeContext.divergenceTarget.texture },
      pressureField: { type: "t", value: null },
    };
    threeContext.projectionUniforms = Object.extend( Object.clone(defaultUniforms), uniforms );
    threeContext.projectionScene = createFullScreenQuadScene( "passthroughVert", "projectionFrag", threeContext.projectionUniforms );
    
    threeContext.uniforms = {
      velocityField: { type: "t", value: threeContext.velocity1Target.texture },
      texture: { type: "t", value: waterTexture },
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      generateMipMaps: false  
    };

    threeContext.uniforms.texture.value.wrapS = threeContext.uniforms.texture.value.wrapT = THREE.RepeatWrapping;
    
    threeContext.initFullScreenCanvas( 'passthroughVert', 'fluidFrag' );
}


function renderCanvas_FluidFlowMap( threeContext )
{
    //threeContext.renderer.setRenderTarget( threeContext.velocity1Target );
    //console.log("Attr6: " + threeContext.renderer.setProgram( threeContext.camera, null, threeContext.advectionMaterial, threeContext.quadMesh ));
    
    /*threeContext.renderer.renderBufferDirect( 
        threeContext.camera, 
        null, 
        threeContext.quadGeo, 
        threeContext.advectionMaterial,
        threeContext.quadMesh,
        null );*/
    
    this.updateDefaultUniforms( this.advectionUniforms );
    this.updateDefaultUniforms( this.divergenceUniforms );
    this.updateDefaultUniforms( this.pressureUniforms );
    this.updateDefaultUniforms( this.projectionUniforms );
    
    threeContext.renderer.render( threeContext.advectionScene, threeContext.camera, threeContext.velocity2Target, true );
    threeContext.renderer.render( threeContext.divergenceScene, threeContext.camera, threeContext.divergenceTarget, true );
    var pressureSourceIndex = threeContext.currentPressureTarget;
    var pressureTargetIndex = (pressureSourceIndex+1)%2;
    this.pressureUniforms.pressureField.value = threeContext.pressureTargets[pressureSourceIndex].texture;
    threeContext.renderer.render( threeContext.pressureScene, threeContext.camera, threeContext.pressureTargets[pressureTargetIndex], true );
    threeContext.currentPressureTarget = pressureTargetIndex;
    this.projectionUniforms.pressureField.value = threeContext.pressureTargets[pressureTargetIndex].texture;
    threeContext.renderer.render( threeContext.projectionScene, threeContext.camera, threeContext.velocity1Target, true );
}

</script>


{% include threejs-canvas.html canvas-size='640px' canvas-name='CanvasFinal' init-function='initCanvas_FluidFlowMap' render-function='renderCanvas_FluidFlowMap' %}