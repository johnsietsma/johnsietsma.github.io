You make a job to add a number to every element in an array.
You then need a float4 version to take advantage of SIMD.
Copy and paste?
What if you need more?
The rule of three before generalising
Generic don't work, can't constrain to an addition.
Use t4 templates, builtin into VS and Rider.
Notice they're used for Unity.Mathematics and FixedList, etc.
Can generate tests as well!
