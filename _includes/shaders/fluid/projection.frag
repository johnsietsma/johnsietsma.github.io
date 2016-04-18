<script type="x-shader/x-fragment" id="projectionFrag">

// Projection

uniform vec2 texelSize;
uniform sampler2D velocityField;
uniform sampler2D divergenceField;
uniform sampler2D pressureField;

varying vec2 vUv;


vec2 calcProjection()
{
    const float rHalfGridScale = 0.5; // 0.5/gridScale
    
    vec2 xOffset = vec2(texelSize.x,0);
    vec2 yOffset = vec2(0,texelSize.y);
    
    float x0 = texture2D(pressureField,vUv-xOffset).x;
    float x1 = texture2D(pressureField,vUv+xOffset).x;
    float y0 = texture2D(pressureField,vUv-yOffset).x;
    float y1 = texture2D(pressureField,vUv+yOffset).x;
    
    // Gradient subtraction
    vec2 vel = texture2D(velocityField,vUv).xy;
    vel -= rHalfGridScale * (vec2(x1,y1)-vec2(x0,y0));
    
    return vel;
    
}

void main()
{
    gl_FragColor = vec4(calcProjection(), 0.0, 1.0);
}

</script>