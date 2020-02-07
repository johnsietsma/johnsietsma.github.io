# Point Cloud

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
TODO: But this restricts streaming and make code awkward

We want to minimize copying as the Octree is being built. Points are added in any order, points for each node should be in contiguous memory. Using a simple array means lots of rearranging points to make this happen.

We want to minimize memory when the Octree is being used. So each node's points can be packed together.

There a few options for storing points:

- In the Octree node. The node could contain a native array. This does suit the requirements of having multiple nodes in one memory chunk and means that the node data is not in contiguous memory anymore.
- In a node:memory hash map. Simple to set up, but harder to rearrange and consolidate chunks.
- Per-level in the octree.

## Per-level Storage

Per-level storage fits with the idea of level by level processing that is being used generally within the Octree. A level can easily be pre-loaded, level 0 for example.

A level may still have billions of points. An array can index up to ‭2,147,483,647‬ points. So multiple arrays need to be used. We'll call those array chunks.

For simplicity each node will get its own chunk at Octree build time. This will get normalized as the Octree is saved.

The each level will have a array of chunks. And a SparseArray of chunk index, NativeSlice pairs. This array can be indexed with the morton code. The chunk index points to a specific chunk, and the NativeSlice gives the slice that contains the points within that chunk.

This will be wrapped up in another native container, NativeSparseChunkArray. This will allow direct iteration of the chunks for use in jobs.

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
