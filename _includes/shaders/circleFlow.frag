<script type="x-shader/x-fragment" id="circleFlowFrag">
    uniform float time;
    uniform sampler2D texture;
    uniform sampler2D flowMap;
    uniform float flowSpeed; // How fast it flows
    uniform float cycleTime; // How long one complete lerp between flows takes
    uniform vec2 texRepeat;
    
    varying vec2 vUv;
    varying vec3 vColor;
    
    void main()
    {
        vec2 flowDirection = (vUv-0.5) * 2.0;
        flowDirection = vec2(flowDirection.y, -flowDirection.x);
        
        vec2 uv = vUv * texRepeat;
         
        // Use two cycles, offset by a half so we can blend between them
        float t1 = time / cycleTime;
        float t2 = t1 + 0.5;
        float cycleTime1 = t1 - floor(t1);
        float cycleTime2 = t2 - floor(t2);
        vec2 flowDirection1 = flowDirection * cycleTime1 * flowSpeed;
        vec2 flowDirection2 = flowDirection * cycleTime2 * flowSpeed;
        vec2 uv1 = uv + flowDirection1;
        vec2 uv2 = uv + flowDirection2;
        vec3 color1 = texture2D( texture, uv1 ).rgb;
        vec3 color2 = texture2D( texture, uv2 ).rgb;
        vec3 color = mix( color1, color2, abs(cycleTime1-0.5)*2.0 );
        
        float lerpTime = time / 60.0;
        lerpTime = min( lerpTime, 1.0 );
        vec3 lerpedColor = mix( vec3(0), vColor, lerpTime );
        
        
        // Ping pong between the two flows, showing the least distorted and allowing uv resets on both.
        gl_FragColor = vec4(1) - vec4(color * lerpedColor, 1);
    }
</script>
