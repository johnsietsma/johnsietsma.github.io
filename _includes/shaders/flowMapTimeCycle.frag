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