var DoubleBufferedRenderTarget = function()
{
    var targetOptions = { type: THREE.FloatType };
    this.sourceIndex = 0;
    this.targetIndex = 1;
    this.targets = [ new THREE.WebGLRenderTarget( 512, 512, targetOptions ), new THREE.WebGLRenderTarget( 512, 512, targetOptions ) ];
    
};

DoubleBufferedRenderTarget.prototype = {
    swap: function() {
        var oldSourceIndex = this.sourceIndex; 
        this.sourceIndex = this.targetIndex;
        this.targetIndex = oldSourceIndex;
    },
    
    getSource: function() {
        return this.targets[this.sourceIndex];
    },
    
    getTarget: function() {
        return this.targets[this.targetIndex];
    }
};
