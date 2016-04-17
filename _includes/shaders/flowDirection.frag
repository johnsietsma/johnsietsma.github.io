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
