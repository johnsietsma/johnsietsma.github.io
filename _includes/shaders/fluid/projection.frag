<script type="x-shader/x-fragment" id="projectionFrag">

// Projection

#define VelocityField iChannel0
#define DivergenceField iChannel1
#define PressureField iChannel2

vec2 uv;
vec2 texelSize;

vec2 calcProjection()
{
    const float rHalfGridScale = 0.5; // 0.5/gridScale
    
    vec2 xOffset = vec2(texelSize.x,0);
    vec2 yOffset = vec2(0,texelSize.y);
    
    float x0 = texture2D(PressureField,uv-xOffset).x;
    float x1 = texture2D(PressureField,uv+xOffset).x;
    float y0 = texture2D(PressureField,uv-yOffset).x;
    float y1 = texture2D(PressureField,uv+yOffset).x;
    
    // Gradient subtraction
    vec2 vel = texture2D(VelocityField,uv).xy;
    vel -= rHalfGridScale * (vec2(x1,y1)-vec2(x0,y0));
    
    return vel;
    
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    uv = fragCoord.xy / iResolution.xy;
    texelSize = 1.0 / iResolution.xy;
    
    fragColor = vec4(calcProjection(), 0.0, 1.0);
}

</script>