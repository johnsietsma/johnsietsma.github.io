<script type="x-shader/x-vertex" id="passthroughVert">
    varying vec2 vUv;
    
    #ifdef USE_COLOR
    varying vec3 vColor;
    #endif
    
    void main()
    {
        vUv = uv;
        
        #ifdef USE_COLOR
        vColor = color;
        #endif
        
        gl_Position = vec4(position,1.0);
    }
</script>
