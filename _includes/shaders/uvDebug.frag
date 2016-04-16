<script type="x-shader/x-fragment" id="uvDebug">

varying vec2 vUv;
    
void main()
{
    gl_FragColor = vec4(vUv, 0.0, 1.0);
}
</script>