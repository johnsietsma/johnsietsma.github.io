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
