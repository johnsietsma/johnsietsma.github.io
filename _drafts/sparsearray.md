# Sparse Array

Classic double indirection. Each level of the octree will be stored in an array. Especially at the lower levels, most nodes will be empty. So use two arrays; one with the data, one which maps nodes indices to the data array indices.

This gives us contiguous data, easy to process with DOTS.

The cost is log(n) look up and insertion. At run we'll mostly avoid this by bulk processing all or part of each level.



# Native Containers

Code examples here: https://docs.unity3d.com/ScriptReference/Unity.Collections.LowLevel.Unsafe.NativeContainerAttribute.html

[Jackson Dunstan's](https://jacksondunstan.com/) blog is a invaluable. I've used his [NativeCollections](https://github.com/jacksondunstan/NativeCollections) for extra tips and ideas.



Data has be blittable. Before [2018.3 introduced Rolsyn and C# 7.3](https://blogs.unity3d.com/2018/09/13/unity-2018-3-beta-get-early-access-now/) you could use a generic type constraint of `struct`, but this did not stop the `struct` containing non-blittable members. Native containers use [UnsafeUtility.IsUnmanaged<T>](https://docs.unity3d.com/2019.1/Documentation/ScriptReference/Unity.Collections.LowLevel.Unsafe.UnsafeUtility.IsUnmanaged.html) to check for non-blittable types. In [C# 7.3 the unmanaged type was introduced](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/unmanaged-types), which is always bittable.

So we can use the following generic type constraint (thanks Jackson Dunstan).
```
#if CSHARP_7_3_OR_NEWER
        where T : unmanaged
#else
		where T : struct
#endif
```

And check for an unmanaged type in the constructor.
```
#if !CSHARP_7_3_OR_NEWER
            if (!UnsafeUtility.IsUnmanaged<T>())
            {
                throw new InvalidOperationException(
                    "Only unmanaged types are supported");
            }
#endif
```

Requirements:
- IDispose
- IEnum?
- Equals?
- Hash?
- ToString?
- DebugView, Debugger attributes


"ENABLE_UNITY_COLLECTIONS_CHECKS"
AtomicSafetyHandle

Safety checks:
* Constructor
    * Is a valid allocator. UnsafeUtility.IsValidAllocator(allocator).
* Read and Write
    * AtomicSafetyHandle.CheckReadAndThrow and CheckWriteAndThrow
Index values

The only way to get non-primitive data into jobs
Allows jobs and thread safety

NativeContainerAttribute

Gave up not referencing the engine. Needs for jobs and containers. Not worth segregating that code. Be careful not to use other engine types.

* Dispose
// Make sure we're not double-disposing
#if ENABLE_UNITY_COLLECTIONS_CHECKS
#if UNITY_2018_3_OR_NEWER
            DisposeSentinel.Dispose(ref m_Safety, ref m_DisposeSentinel);
#else
			DisposeSentinel.Dispose(m_Safety, ref m_DisposeSentinel);
#endif
#endif


* Interface, check NatveArray
