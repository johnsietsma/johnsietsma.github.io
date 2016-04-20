<script type="x-shader/x-fragment" id="fluidFrag">

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
    vec2 flowDirection = velocity.xy * -0.02;
    
    if( gl_FragColor.z == 0.0 ) {
        gl_FragColor = vec4( abs(flowDirection), 0.0, 1.0);
    }
    else {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    }
}

</script>
