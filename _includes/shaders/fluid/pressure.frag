<script type="x-shader/x-fragment" id="pressureFrag">

// Pressure

uniform vec2 texelSize;
uniform sampler2D velocityField;
uniform sampler2D divergenceField;
uniform sampler2D pressureField;

varying vec2 vUv;

bool isBorder()
{
    if( vUv.x>1.0   ||
      	vUv.y>1.0   ||
      	vUv.x<0.0   ||
        vUv.y<0.0 )
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
    
    const float rBeta = 0.25; // 1/4
    vec2 xOffset = vec2(texelSize.x,0);
    vec2 yOffset = vec2(0,texelSize.y);
    
    float x0 = texture2D(pressureField,vUv-xOffset).x;
    float x1 = texture2D(pressureField,vUv+xOffset).x;
    float y0 = texture2D(pressureField,vUv-yOffset).x;
    float y1 = texture2D(pressureField,vUv+yOffset).x;
    
    float div = texture2D(divergenceField,vUv).x;
    return ( x0 + x1 + y0 + y1 - div ) * rBeta;
}

void main()
{
    gl_FragColor = vec4(1);
    if( !isObstacle() ) {
    	gl_FragColor = vec4( calcPressure(), 0.0, 0.0, 1.0 );
    }
}

</script>