
An Octree built on sparse arrays. Each level is its own array.

Requirements:

- DOTS ready, must be able to get a NativeContainer for each level for processing.
- Must be able to add from within a job.
- Add multiple points at once.

NativeCollections cannot hold other native collections.

## Adding Points
Multiple points can be added to a single level. Points are first processed into the node AABBs, then bulk added to each node.

Point storage as 4x3

## Steps

For each level:

- Convert points to Octree space
- Convert points to node coordinates
- Get unique nodes
- Convert unique node coordinates to morton codes
- Filter full nodes
- Filter new unique nodes
- Create storage for new unique nodes (key=level,morton code packed into long)
- Add new new nodes as keys to octree
- For each node (can be parallel)
  - Filter (clustering) and collate points for the node into memory storage
- Compress remainder points (or swap to back before adding)
