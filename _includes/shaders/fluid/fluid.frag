<script type="x-shader/x-fragment" id="fluidFrag">

#define VelocityField iChannel0
#define DivergenceField iChannel1
#define PressureField iChannel2

#define DiffuseTexture iChannel3

#define DisplayField VelocityField
//#define DisplayField DivergenceField
//#define DisplayField PressureField


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 flowDirection = texture2D(DisplayField,uv).xy * -0.002;
    

    fragColor = vec4( flowDirection, 0.0, 1.0 );
    
    if( fragColor.z == 0.0 ) {
        const float cycleTime = 10.0;
        const float flowSpeed = 0.5;

        // Use two cycles, offset by a half so we can blend between them
        float t1 = iGlobalTime / cycleTime;
        float t2 = t1 + 0.5;
        float cycleTime1 = t1 - floor(t1);
        float cycleTime2 = t2 - floor(t2);
        vec2 flowDirection1 = flowDirection * cycleTime1 * flowSpeed;
        vec2 flowDirection2 = flowDirection * cycleTime2 * flowSpeed;
        vec2 uv1 = uv + flowDirection1;
        vec2 uv2 = uv + flowDirection2;
        vec4 color1 = texture2D( DiffuseTexture, uv1 );
        vec4 color2 = texture2D( DiffuseTexture, uv2 );

        // Ping pong between the two flows, showing the least distorted and allowing uv resets on both.
        fragColor = mix( color1, color2, abs(cycleTime1-0.5)*2.0 );
    }
    
}

</script>
