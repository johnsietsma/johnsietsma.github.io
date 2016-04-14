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


<script>

var waterTexture = new THREE.TextureLoader().load('{{ site.assetsurl }}/images/textures/water.jpg');
var flowMap = new THREE.TextureLoader().load('{{ site.assetsurl }}/images/textures/flowMap.png');

function initCanvas_FluidFlowMap( threeContext )
{
    threeContext.uniforms = {
        time: { type: "f", value: 1.0 },
        texture: { type: "t", value: waterTexture },
        flowMap: { type: "t", value: flowMap },
        flowSpeed: { type: "f", value: 0.5 },
        cycleTime: { type: "f", value: 20 },
    };
    
    var options = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      generateMipMaps: false  
    };
    
    threeContext.buffA = new THREE.WebGLRenderTarget(threeContext.canvas.clientWidth, threeContext.canvas.clientHeight, options );
    threeContext.buffAMaterial = new THREE.ShaderMaterial(
    );

    initFullScreenCanvas( threeContext, 'passthroughVert', 'flowMapFrag' );
}


function renderCanvas_FluidFlowMap( threeContext )
{
       threeContext.renderer.render( threeContext.scene, threeContext.camera, threeContext.buffA, true );
}

</script>


{% include threejs-canvas.html canvas-size='640px' canvas-name='CanvasFinal' init-function='initCanvas_FluidFlowMap' render-function='renderCanvas_FluidFlowMap' %}