# Morton Order

For the [out-of-core point cloud renderer I'm working on]({% post_url 2019-11-29-infinite-points-introduction.md %}) I need a way to convert a node coordinate into an array index. The idea is all nodes in a layer and children of a node should be in contiguous memory for easy access and cache friendly processing.

In my first implementation I used Hilbert curves. They guarantee each array index will be a next-door neighbour node, but they are reasonably complex to calculate. Morton order guarantees the 8 children of a node will be contiguous, but there may be discontinuities between those blocks.


## What is Morton Order (Z-Order, Lebesgue Curve)
To store an Octree node in an array, we need a way to convert its 3D coordinate to a 1D array index. 

Let's take the simple case of the first level of the Octree, with 8 nodes. Each axis will be in either position 0 or 1. We can use one bit of each of these axis, or a total of 3 bits to encode each node. As enumerate each node, these bits increment just like normal binary numbers. They can be used as an integer index into an array.

```
node  | bits | index
-----:|:----:|:-----
0,0,0 |  000 |    0
0,0,1 |  001 |    1
0,1,0 |  010 |    2
0,1,1 |  011 |    3
1,0,0 |  100 |    4
1,0,1 |  101 |    5
1,1,0 |  110 |    6
1,1,1 |  111 |    7
```

For larger coordinates we continue to have sets of 3 bits for each additional digit on each axis and the Z pattern repeats.

Morton order is perfect for an Octree, the 8 children of a node are guaranteed to be in contiguous memory.

[This blog post from Asger Hoedt gives a great introduction to Morton order.](http://asgerhoedt.dk/?p=276)

The Octree for the point cloud can have data in non-leaf nodes. So each level of the Octree will have it's own array, filled with nodes for that level.


## Encoding and Decoding
To make a morton code, we need to get each of the 3 axes and interleave their bits. Asger Hoedt's post above gives a method which repeatedly shifts a number up and masks out the bit we don't want. [Jeroen Baert gives 3 more methods](https://www.forceflow.be/2013/10/07/morton-encodingdecoding-through-bit-interleaving-implementations/). The second method is similar to Asger's "Magic Bits" method.

[Fabian "ryg" Giesen also mentions the same method as Asger Hoedt and gives an implementation for a 3D encoding](https://fgiesen.wordpress.com/2009/12/13/decoding-morton-codes/).

[A follow up blog post](https://www.forceflow.be/2016/01/18/libmorton-a-library-for-morton-order-encoding-decoding/) shows that the third method, using a LUT, is faster. But Asger/ryg's method is more readable and I believe, more open to Burst performance optimisations.


[Here is code](https://github.com/johnsietsma/InfPoints/blob/master/com.infpoints.octree/Runtime/Morton.cs). I still have to add limits checking and Burst friendly versions.


# Resources
* Wikipedia Z-Order Curves: https://en.wikipedia.org/wiki/Z-order_curve
* Bithacks - Interleaving with magic numbers: http://www-graphics.stanford.edu/~seander/bithacks.html#InterleaveBMN
* Generate magic numbers: https://stackoverflow.com/questions/18529057/produce-interleaving-bit-patterns-morton-keys-for-32-bit-64-bit-and-128bit
* Jeoen Baert's Sparse Voxel Octree:
  * Intro: https://www.forceflow.be/2012/07/24/out-of-core-construction-of-sparse-voxel-octrees/
  * Encoding/decoding: https://www.forceflow.be/2013/10/07/morton-encodingdecoding-through-bit-interleaving-implementations/
  * Update on perf: https://www.forceflow.be/2016/01/18/libmorton-a-library-for-morton-order-encoding-decoding/
  * Paper: http://graphics.cs.kuleuven.be/publications/BLD13OCCSVO/BLD13OCCSVO_paper.pdf
  * Code: https://github.com/Forceflow/libmorton
  * Paper cde: https://github.com/Forceflow/ooc_svo_builder
* Ryg Blog Decoding: https://fgiesen.wordpress.com/2009/12/13/decoding-morton-codes/
* Avenel's Code: https://github.com/aavenel/mortonlib