
An Octree built on sparse arrays. Each level is its own array.

Requirements:

- DOTS ready, must be able to get a NativeContainer for each level for processing.
- Must be able to add from within a job.
- Add multiple points at once.

NativeCollections cannot hold other native collections.

## Adding Points
Multiple points can be added to a single level. Points are first processed into the node AABBs, then bulk added to each node.

Point storage as 4x3

Steps:
- Convert points to Octree space
- Convert points to node coordinates
- 