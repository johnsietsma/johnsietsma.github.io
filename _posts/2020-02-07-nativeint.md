---
layout: post
title: NativeInt
tags: unity, jobs
---

## Update (20/02/20)

The `NativeContainerIsAtomicWriteOnly` attribute is required for use in `IJobParallelFor`, but it also means the container is marked as write only! If you use it in a `IJobParallelFor` and attempt to read a value which is checked with `AtomicSafetyHandle.CheckReadAndThrow(m_Safety);`, then you'll get the error `When accessing: InvalidOperationException: The native container has been declared as [WriteOnly] in the job, but you are reading from it.`

So two separate containers are required.

* A write only container that uses the `NativeContainerIsAtomicWriteOnly` attribute.
* A read and write container without this attribute for use in `IJob`s. You can optional mark this as read only with the `[ReadOnly]` attribute.

Note you can use a container that is not marked as atomic write only in an IJobParallelFor if the field in the job has a `NativeDisableParallelForRestriction` attribute.

This impossible without copying and pasting code. `struct`s don't have inheritance, you can't use an interface in a job. You can't use a third shared class for implementation with two light wrappers around it. The `DisposeSentinel` is not blittable and can't be used in this class. So none of the safety checks can go in the third class. Which in this case is the majority of the code.

## Passing Data to Jobs

Jobs in Unity must be `struct`s and must only contain [blittable types](https://docs.microsoft.com/en-us/dotnet/framework/interop/blittable-and-non-blittable-types). This allows jobs to be copyable and for the job system to [enforce thread safety](https://docs.unity3d.com/Manual/JobSystemSafetySystem.html). If I have a job with an `int` field, the value of the `int` is copied and I have no way to get the result of my fancy calculation I performed in the job.

<!--more-->

So how to do [NativeCollections](https://docs.unity3d.com/Manual/JobSystemNativeContainer.html) get data in an out of jobs? Well the quick answer is that they hold a *pointer* to the data, instead of the data itself. So the pointer gets copied, rather then the data. The same data can still be accessed by all the copies of the job through the pointer.

[The current advice](https://forum.unity.com/threads/job-is-struct-no-pointers-allowed-so-how-does-a-job-return-a-value.523339/) for passing simple `int`s into a job is to use a single element `NativeArray`.

There are a few downsides to this:

- It's awkward to use with subscript operator in and out of the job to get the value. It may not be clear to future coders what the intent is.
- `NativeArray` doesn't support [parallel for jobs](https://docs.unity3d.com/ScriptReference/Unity.Jobs.IJobParallelFor.html). Although you can use the Concurrent versions of NativeHashMap and other containers.

## Thread Safety

We could write our own container that uses a similar approach, allocating an int pointer that is shared with all copies of the job.

In order to make the container thread safe we need to think about thread safety. Even simply adding a number isn't thread safe.
We need to:

- Retrieve the number from memory and copy it to a CPU register
- Execute the addition instruction
- Move the result back to memory

Our thread could get stalled between the retrieve and store. The another thread updates the number and our copy is stale.

Usually we'd use the [C# `lock` statement](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/lock-statement) or a [Mutex](https://docs.microsoft.com/en-us/dotnet/api/system.threading.mutex) to ensure thread safety. But both of these require an object to lock on, we can't use those in jobs.

But we can use [interlocked methods](https://docs.microsoft.com/en-us/dotnet/api/system.threading.interlocked) to perform atomic operations like adding, incrementing and decrementing.

## NativeInt

There are already a couple of implementations that use `int` pointers and interlocked functions.

- In the [Unity Custom Containers sample code](https://docs.unity3d.com/Packages/com.unity.jobs@0.0/manual/custom_job_types.html#custom-nativecontainers). It's a great start and shows a non-interlocked per-thread counter.
- [NativeIntPtr](https://github.com/jacksondunstan/NativeCollections/blob/master/JacksonDunstanNativeCollections/NativeIntPtr.cs) by Jackson Dunstan. His implementation has a non-thread-safe container with a separate `Parallel` interface that uses the interlocked methods. I'd prefer to just have one, thread-safe interface.

So I wrote my own [NativeInt](https://github.com/johnsietsma/InfPoints/blob/master/com.infpoints/Runtime/NativeCollections/NativeInt.cs).

This has the [NativeContainerIsAtomicWriteOnly attribute](https://docs.unity3d.com/ScriptReference/Unity.Collections.LowLevel.Unsafe.NativeContainerIsAtomicWriteOnlyAttribute.html) and has an `IDispose(JobHandle)` function. So it supports both parallel for jobs and the [DeallocateOnJobCompletion attribute](https://docs.unity3d.com/ScriptReference/Unity.Collections.DeallocateOnJobCompletionAttribute.html).

The gotcha with this (and most) container is that jobs are required to have an `IsCreated` property, but from a copy of job there is no way of knowing if the memory has been freed. We only set one copy of the pointer to null when it is disposed. We could allocate another shared pointer to communicate this, but that would be overkill. So don't use `IsCreated` after a job is done to detect if the job has been cleaned up yet.

## Usage

```csharp
public struct IncrementIntJob : IJobParallelFor
{
    [DeallocateOnJobCompletion] public NativeInt Count;

    public void Execute(int index)
    {
        Count.Increment();
    }
}

var nativeInt = new NativeInt(0, Allocator.TempJob);

var incrementJob = new IncrementIntJob()
{
    Count = nativeInt
}.Schedule(incrementCount, batchCount);

incrementJob.Complete();

int total = nativeInt.Value;
```
