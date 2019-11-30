# Infinite Points - Part 1

It's becoming more and more common to use photogrammetry and lidar scanning to capture buildings, engineering projects, sites of cultural significance, archaeological digs, etc. Most of these points clouds are in the billions of points; slow to render and unable to fit into memory.

There are workflows for converting point cloud data into meshes, but the process is usually laborious and data is lost in the process. For digs or remote inspections keeping all the point cloud data is very important.

I'd like to build a point cloud renderer for Unity that solves these issues but keeping parts of the point cloud data on disk and reading in the most important data for the users viewpoint.

## Requirements

* The data should be stored on disk in multiple files.
* These files should be able to be loaded into memory at runtime.
* The data should be laid out efficiently in memory to allow for quick processing for culling.

## Previous Work

* [Potree](http://www.potree.org/)
* [Unreal Point Cloud Plugin](https://pointcloudplugin.com/)

## Structure

The data will be stored in an Octree. Rather then nodes containing pointers to their children, each layer of the Octree is stored in a sparse array. This mean nodes can be stored in a tightly packed array, ready for processing.

Level 0 of the Octree is a single node, level 1 has 8 nodes, level 2 has 64, etc.

### Indexing

Nodes are stored in arrays, so we need a way to convert a node with a 3D coordinate into an array index, and back again. Node coordinates do no need to be explicitly stored, it's inferred from the array index.

The indexing should be contiguous, so children of a node are stored together in the array. This means children can be accessed using a simple index range and processed quickly without any cache misses.

The most straightforward way to do this is Lebesgue curves. A fractal space filling curve.

### Sparse Array

The number of nodes at each level grows very quickly. Assuming that lower levels will mostly have no nodes, we'll use a sparse array. This is a classic solution of adding a layer of indirection. The nodes are stored together in one array and another array of the same size contains the sorted large indices.

A single array lookup is a binary search of the index array. Efficient processing of contiguous memory is still possible by turning an index range of large indices into an index range of nodes that exist. The most common case would be to process (for eg culling) an entire level of nodes directly, without using the index indirection.


Please follow along here: https://github.com/johnsietsma/InfPoints
