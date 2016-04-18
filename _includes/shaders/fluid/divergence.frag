<script type="x-shader/x-fragment" id="divergenceFrag">

// Divergence

uniform vec2 texelSize;
uniform sampler2D velocityField;

varying vec2 vUv;


float calcDivergence()
{
    const float rHalfGridScale = 0.5; // 0.5/gridScale
    vec2 xOffset = vec2(texelSize.x,0);
    vec2 yOffset = vec2(0,texelSize.y);
    
    float x0 = texture2D(velocityField,vUv-xOffset).x;
    float x1 = texture2D(velocityField,vUv+xOffset).x;
    float y0 = texture2D(velocityField,vUv-yOffset).y;
    float y1 = texture2D(velocityField,vUv+yOffset).y;
    
    return rHalfGridScale * ((x1-x0) + (y1-y0));

}

void main()
{
    gl_FragColor = vec4( calcDivergence(), 0.0, 0.0, 1.0 );
}

</script>
