---
layout: post
title: Native Sparse Array
tags: infpoints, pointcloud, sparsearray
---
(Part of a series where I think out loud about an [out-of-core point cloud renderer](https://github.com/johnsietsma/InfPoints) I'm working on.)

A sparse array uss the classic programming trick of adding another layer of indirection. Not by using a pointer, but by adding an abstraction over a traditional array. 

I'm in the process of building an Octree for use in a [Point Cloud Renderer](https://github.com/johnsietsma/InfPoints). The Octree will store nodes layer by layer. This means that some layers will have mostly empty space. Rather then storing the nodes directly, this sparse array has two arrays, one to store the data and the other to store the indices of the data. The data is always sorted, so a binary search can be used to find data or insertion points for adding data.

A sparse array is usually slower for large data sets, and a hash map is preferred. But for the point cloud renderer, most of the time will be bulk processing the nodes for culling, etc. So having all the nodes in contiguous memory is just what I want.

I'd like the SparseArray API to be a close a possible to the [NativeArray](https://docs.unity3d.com/ScriptReference/Unity.Collections.NativeArray_1.html). But with two caveats:

* The `CopyTo`, `CopyFrom` and `ToArray` functions don't make a lot of sense, how should a sparse array get converted to a normal array? You can use the pulblic field `Indices` and `Data` to get access to the underlying arrays if you'd like to copy to and from `NativeArrays`.
* Indexing into the the array can add data. For example `array[1]=2` will add an index `1` with data `2`. The array is fixed size, so simple index access can fail if the array is full. Prefer to `IsFull`, `ContainsIndex` and `SetValue` to explicitly add items. Attempting to access or write to a non-existent index will throw  an `ArgumentOutOfRangeException` if `ENABLE_UNITY_COLLECTIONS_CHECKS` is enabled. 

## Native Collection Extensions

 The Native Collection API is fairly sparse. So I've added the following extension methods:

 * Swap
 * Insert
 * RemoveAt
 * BinarySearch

Strangely there is no common interface for the Native Collections, so the common pattern is to make a private function that implements the algorithm using raw pointers. This gets called by type specific wrappers. This means that the assembly must be marked unsafe, and needs a decent amount of unit tests and precondition tests. I've followed the example of the native collections and used `ENABLE_UNITY_COLLECTIONS_CHECKS` to enable the precondition checks.


## Job Safety

`NativeSparseArray` does not do atomic read or writes. It can still safely be used within a job as long as the each job access individual array indices. The underlying indices and data arrays are available as public properties and can be used within Jobs.

# Native Container Resources

If you'd lke to write your own native containers then the best resources are:

* Unity's code examples here: https://docs.unity3d.com/ScriptReference/Unity.Collections.LowLevel.Unsafe.NativeContainerAttribute.html
* Unity's [Collections Package](https://docs.unity3d.com/Packages/com.unity.collections@0.4/manual/index.html) which contains code for additional native containers.
* [Jackson Dunstan's](https://jacksondunstan.com/) blog is a invaluable. I've used his [NativeCollections](https://github.com/jacksondunstan/NativeCollections) for extra tips and ideas.
* If you'd like to make your native container compatible with the job system, then use this guide [https://docs.unity3d.com/Packages/com.unity.jobs@0.1/manual/custom_job_types.html?_ga=2.122162947.960630263.1577096340-1341159195.1576389166#available-attributes](https://docs.unity3d.com/Packages/com.unity.jobs@0.1/manual/custom_job_types.html?_ga=2.122162947.960630263.1577096340-1341159195.1576389166#available-attributes) and this example code [https://github.com/Unity-Technologies/EntityComponentSystemSamples/tree/a6b5ca01e96f4dd859fdb921bda2943323386038/Samples/Assets/NativeCounterDemo](https://github.com/Unity-Technologies/EntityComponentSystemSamples/tree/a6b5ca01e96f4dd859fdb921bda2943323386038/Samples/Assets/NativeCounterDemo).


# Code

The code for the NativeSparseArray and Native Collection Extensions are available in the [Github repo](https://github.com/johnsietsma/InfPoints).
