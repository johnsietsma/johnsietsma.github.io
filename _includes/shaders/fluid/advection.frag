<script type="x-shader/x-fragment" id="advectionFrag">
// Advection + Force

#define VelocityField iChannel0

const float ForceStrength = 100.0;
const vec2 ForcePos = vec2(0.2, 0.5);
const float ForceRadius = 0.15;

const vec2 ObstaclePos = vec2(0.5,0.5);
const float ObstacleRadius = 0.1;


vec2 uv;
vec2 texelSize;
vec2 fragCoord;

vec2 calcForce()
{
    float forceDist = distance(uv, ForcePos);
    float forceValue = (1.0-step(ForceRadius,forceDist)) * ForceStrength;
    return vec2(forceValue, 0.0) * iTimeDelta;
}

vec2 calcAdvection()
{
    vec2 currVel = texture2D(VelocityField,uv).xy;
    vec2 backPos = uv - currVel * texelSize * iTimeDelta;
    return texture2D(VelocityField,backPos).xy;
}

vec2 clampBorder( vec2 value, float borderSize )
{
    // Clamp value at borders to zero.
    if( fragCoord.x>iResolution.x ||
      	fragCoord.y>iResolution.y ||
      	fragCoord.x<0.0           ||
        fragCoord.y<0.0 )
    {
        return vec2(0.0, 0.0);
    }
    
    return value;
}

void mainImage( out vec4 fragColor, in vec2 _fragCoord )
{
    fragCoord = _fragCoord;
    uv = fragCoord.xy / iResolution.xy;  
    texelSize = vec2(1.0) / iResolution.xy;
    
    fragColor = vec4(0,0,99.0,1.0);
    vec2 movingObstaclePosition = vec2(ObstaclePos.x, ObstaclePos.y+sin(iGlobalTime*0.2)*0.2);
    if( distance(uv, movingObstaclePosition) > ObstacleRadius ) {
    	vec2 newVel = calcAdvection() + calcForce();
    	newVel = clampBorder( newVel, 1.0 );
    	fragColor = vec4(newVel, 0.0, 1.0);
    }
}
</script>
