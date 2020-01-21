
## Adding Points
Multiple points can be added to a single level. Points are first processed into the node AABBs, then bulk added to each node.

Point storage as 4x3
Point storage as x,y,z to allow for 64 bit processing in the future

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
