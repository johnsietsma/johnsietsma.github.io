<script type="x-shader/x-fragment" id="divergenceFrag">

// Divergence
#define VelocityField iChannel0

vec2 uv;
vec2 texelSize;

float calcDivergence()
{
    const float rHalfGridScale = 0.5; // 0.5/gridScale
    vec2 xOffset = vec2(texelSize.x,0);
    vec2 yOffset = vec2(0,texelSize.y);
    
    float x0 = texture2D(VelocityField,uv-xOffset).x;
    float x1 = texture2D(VelocityField,uv+xOffset).x;
    float y0 = texture2D(VelocityField,uv-yOffset).y;
    float y1 = texture2D(VelocityField,uv+yOffset).y;
    
    return rHalfGridScale * ((x1-x0) + (y1-y0));

}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    uv = fragCoord.xy / iResolution.xy;
    texelSize = vec2(1.0) / iResolution.xy;
    
    fragColor = vec4( calcDivergence(), 0.0, 0.0, 1.0 );
}

</script>
