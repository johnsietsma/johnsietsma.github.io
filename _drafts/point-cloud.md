## Nodes
The nodes are a level index, morton code.

## Storing Points

Point storage, break the one to one relationship between a node and its points. Allow paged memory, containing points from multiple nodes, with async loading.


Requirements:

- Multiple nodes in one memory chunk to avoid lots of small chunks.
- Easily serializable. Going to be written to and read from memory during construction and when rendering.
- Can retrieve memory using the node as a key.
- Extendable to allow point colours and other arbitrary point data.
- Compressible. Point clouds are huge. Memory chunks should be compressible to faster wire transfer and less storage requirements.
- Must have handle so that points can be loaded later, be culled, etc while still being able to reason about and use the nodes.
- Have some state so that users know whether the points are loaded.
- Rearrangeable. Memory is likely to change as points are added. While building extra memory may be allocated that is not needed. It should be possible to rearrange memory without breaking nodes.
- Be able to be used in Jobs. So must use native containers.
- Large storage, must be able to hold GBs of points.

Points will have their axes stored individually, eg all the 'X's, the all the 'Y's, etc. This allows for easy access to "wide" (SIMD-friendly) processing jobs.

There a few options for storing points:

- In the Octree node. The node could contain a native array. This does suit the requirements of having multiple nodes in one memory chunk and means that the node data is not in contiguous memory anymore.
- In a mirror data octree. Each level would be a series of chunks. As point are added more chunks are added as needed. Octree is extended to have per-level data. In this case each level would have a series of NativeArrays and give out chunks as NativeSlices. This gives the opportunity to load enter levels, for example level 0 on start. The storage would have to deal with very large data sets. So the memory handle would be a an index to a NativeArray and a NativeSlice into that array.
- In a node:memory hash map. Simple to set up, kinda complicated to pass to jobs.



## Adding Points
Multiple points can be added to a single level. Points are first processed into the node AABBs, then bulk added to each node.



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
