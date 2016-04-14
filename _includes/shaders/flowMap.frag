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
