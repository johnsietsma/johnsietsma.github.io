<script type="x-shader/x-fragment" id="pressureFrag">

// Pressure

#define VelocityField iChannel0
#define DivergenceField iChannel1
#define PressureField iChannel2


vec2 uv;
vec2 texelSize;
vec2 fragCoord;

bool isBorder()
{
    if( fragCoord.x>iResolution.x ||
      	fragCoord.y>iResolution.y ||
      	fragCoord.x<0.0             ||
        fragCoord.y<0.0 )
    {
        return true;
    }
    return false;
}

bool isObstacle()
{
    return texture2D(VelocityField, uv).z > 0.0;
}

float calcPressure()
{
    if( isBorder() ) return 0.0;
    
    const float rBeta = 0.25; // 1/4
    vec2 xOffset = vec2(texelSize.x,0);
    vec2 yOffset = vec2(0,texelSize.y);
    
    float x0 = texture2D(PressureField,uv-xOffset).x;
    float x1 = texture2D(PressureField,uv+xOffset).x;
    float y0 = texture2D(PressureField,uv-yOffset).x;
    float y1 = texture2D(PressureField,uv+yOffset).x;
    
    float div = texture2D(DivergenceField,uv).x;
    return ( x0 + x1 + y0 + y1 - div ) * rBeta;
}

void mainImage( out vec4 fragColor, in vec2 _fragCoord )
{
    fragCoord = _fragCoord;
    uv = fragCoord.xy / iResolution.xy;
    texelSize = 1.0 / iResolution.xy;
    
    fragColor = vec4(1);
    if( !isObstacle() ) {
    	fragColor = vec4( calcPressure(), 0.0, 0.0, 1.0 );
    }
}

</script>