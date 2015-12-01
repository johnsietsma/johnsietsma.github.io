---
layout: post
title: Simple water flow effect
tags: threejs, water
---

A simple water effect using distortion and scolling uvs.


<script type="x-shader/x-fragment" id="foamFragmentShader">
    uniform float time;
    uniform sampler2D texture;
    
    varying vec2 vUv;
    
    void main()
    {
        vec4 color = texture2D( texture, vUv ).rgba;
        gl_FragColor = color;
    }
</script>


<script>

function setVertColors( mesh, color )
{
    
    for ( var i = 0; i < mesh.faces.length; i++ ) 
    {
        var face = mesh.faces[ i ];
        face.vertexColors = [color, color, color];
    }
}

function initCanvas( threeContext )
{
    var size = threeContext.size;
    var halfSize = size/2;

    // Setup camera
    threeContext.camera = new THREE.OrthographicCamera( -halfSize, halfSize, halfSize, -halfSize, -1000, 1000 );
    threeContext.camera.position.z = 5;
    
    // Add the full screen quad
    var planeGeo = new THREE.PlaneGeometry( size, size, 4 );
    var color = new THREE.Color( 0x043A61 );
    setVertColors( planeGeo, color );
    
    var foamTexture = new THREE.TextureLoader().load('{{ site.assetsurl }}/images/textures/lines.jpg');
    threeContext.uniforms = {
        time: { type: "f", value: 1.0 },
        texture: { type: "t", value: foamTexture }
    };
    
    var vShader = document.getElementById( 'defaultVertexShader' );
    var fShader = document.getElementById( 'foamFragmentShader' );
    var shaderMaterial = new THREE.ShaderMaterial({
        uniforms: threeContext.uniforms,
        vertexShader: vShader.text,
        fragmentShader: fShader.text
    }); 
    //var material = new THREE.ShaderMaterial( { map: foamTexture } );
    threeContext.plane = new THREE.Mesh( planeGeo, shaderMaterial );
    threeContext.plane.position.z = -10;
    
    threeContext.scene = new THREE.Scene();
    threeContext.scene.add( threeContext.plane );
}

</script>

{% include threejs.html %}
{% include threejs-canvas.html canvas-size='200px' canvas-name='Canvas1' init-function='initCanvas' %}
