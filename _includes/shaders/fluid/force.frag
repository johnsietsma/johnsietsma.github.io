<script type="x-shader/x-fragment" id="forceFrag">
// Advection + Force

uniform float timeDelta;
uniform sampler2D velocityField;

const float ForceStrength = 30.0;
const vec2 ForcePos = vec2(0.2, 0.5);
const float ForceRadius = 0.15;

varying vec2 vUv;


vec2 calcForce()
{
    float forceDist = distance(vUv, ForcePos);
    float forceValue = (1.0-step(ForceRadius,forceDist)) * ForceStrength;
    return vec2(forceValue, 0.0) * timeDelta;
}

void main()
{
    gl_FragColor = texture2D( velocityField, vUv ) + vec4( calcForce(), 0.0, 1.0 );
}
</script>
