<script type="x-shader/x-fragment" id="diffusionFrag">

// Diffusion
uniform float timeDelta;
uniform vec2 texelSize;
uniform sampler2D velocityField;

varying vec2 vUv;

const float Viscosity = 0.000000001;
const float DiffusionAlpha = 1.0 / Viscosity;
const float DiffusionBetaReciprocal = 1.0 / (4.0 + DiffusionAlpha);

bool isBorder()
{
    if( vUv.x>1.0-texelSize.x ||
      	vUv.y>1.0-texelSize.y ||
        vUv.x<texelSize.x     ||
        vUv.y<texelSize.y )
    {
        return true;
    }
    return false;
}

bool isObstacle()
{
    return texture2D(velocityField, vUv).z > 0.0;
}

float calcPressure()
{
    if( isBorder() ) return 0.0;
    
    vec2 xOffset = vec2(texelSize.x,0);
    vec2 yOffset = vec2(0,texelSize.y);
    
    float x0 = texture2D(velocityField,vUv-xOffset).x;
    float x1 = texture2D(velocityField,vUv+xOffset).x;
    float y0 = texture2D(velocityField,vUv-yOffset).x;
    float y1 = texture2D(velocityField,vUv+yOffset).x;
    
    float div = texture2D(velocityField,vUv).x;
    return ( x0 + x1 + y0 + y1 + DiffusionAlpha * div ) * DiffusionBetaReciprocal;
}

void main()
{
    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    if( !isObstacle() ) {
        gl_FragColor = vec4( calcPressure(), 0.0, 0.0, 1.0 );
    }
}

</script>