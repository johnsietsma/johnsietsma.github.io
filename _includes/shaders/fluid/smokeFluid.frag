<script type="x-shader/x-fragment" id="smokeFluidFrag">

uniform float time;
uniform vec2 texelSize;
uniform sampler2D velocityField;
uniform sampler2D divergenceField;
uniform sampler2D pressureField;
uniform sampler2D texture;

varying vec2 vUv;

void main()
{
    vec3 velocity = texture2D(velocityField,vUv).xyz;
    if( velocity.z == 0.0 ) {
        vec2 flowDirection = velocity.xy * -0.02;
        gl_FragColor = vec4( vec3(0.5 * length(flowDirection)), 1.0);
    }
    else {
        gl_FragColor = vec4( vec3(0.25), 1 );
    }
        
}

</script>
