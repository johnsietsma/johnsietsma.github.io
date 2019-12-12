---
layout: post
title: Morton Order - Burst
tags: infpoints, point cloud, morton order
---
(Part of a series where I think out loud about an [out-of-core point cloud renderer](https://github.com/johnsietsma/InfPoints) I'm working on.)

[Morton encoding]({% post_url 2019-12-05-morton-order-introduction %}) is a perfect set up for [Burst](https://docs.unity3d.com/Packages/com.unity.burst@latest/index.html), lots of data in a row to crunch!

So what happens when I turn it on? In order to use Burst, we need to have our code in a job.

```
[BurstCompile(FloatPrecision.Standard, FloatMode.Fast, CompileSynchronously = true)]
public struct MortonDecodeJob_Packed : IJob
{
    [ReadOnly] public NativeArray<uint4> Codes;
    public NativeArray<uint4x3> Coordinates;

    public void Execute()
    {
        for (int i = 0; i < Codes.Length; i++)
        {
            Coordinates[i] = Morton.DecodeMorton3(Codes[i]);
        }
    }
}
```

`CompileSynchronously` is only used in the editor to make sure the Burst code is compiled before this function is called, rather then using the non-burst code until it's ready.

I then fire everything off like this:
```
var encodeJob = new MortonEncodeJob()
{
    Coordinates = m_Coordinates,
    Codes = m_Codes
};

var decodeJob = new MortonDecodeJob()
{
    Codes = m_Codes,
    Coordinates = m_CoordinatesDecoded
};

var encodeJobHandle = encodeJob.Schedule();
var decodeJobHandle = decodeJob.Schedule(encodeJobHandle);

decodeJobHandle.Complete();
```
I'm using the [Performance Testing API](https://docs.unity3d.com/Packages/com.unity.test-framework.performance@2.0/manual/index.html) to measure results. It has some nice features like warm-up and iterations.

So I can run a test like this:
```
Measure.Method(DoEncodeDecodeJob).WarmupCount(2).Run();
```

So what's the result? I ran through encoded and decoded one million coordinates. Without Burst it takes 205.39ms, the same code outside of the job takes 207.98, so there is some job overhead. With Burst on it takes 6.12ms. This is huge, exactly the same code runs 33x faster.

For a great background on what Burst does and how it can achieve this speed up, check out - [ECS - Deep Dive into the Burst Compiler](https://www.youtube.com/watch?v=QkM6zEGFhDY).

But we can do better. Inspired by [Instrinsics: Low-level engine development with Burst](https://www.youtube.com/watch?v=BpwvXkoFcp8), I learnt that we use "packed" numbers Burst can store more more data in registers in a single operation and also auto-vectorise the Unity.Mathematics operations.

Out encoding function changes from `public static uint EncodeMorton3(uint3 coordinate)` to `public static uint4 EncodeMorton3(uint4x3 coordinates)`. Or it could equally be `public static uint EncodeMorton3(uint4 coordinateX, uint4 coordinateY, uint4 coordinateZ )`. I just choose the former because I can easily change an array of `uint3`s to an array of `uint4x3` by type punning like this `m_Coordinates.Reinterpret<uint3x4>(UnsafeUtility.SizeOf<uint3>())` and then transposing each of the elements.

Assembly is not my strong point. But what I'm looking for is moving data to registers changing from:

```movsxd  r8, dword ptr [rcx + 8]```

to

```
movdqa  xmmword ptr [rsp + 80], xmm11
movdqa  xmmword ptr [rsp + 64], xmm10
movdqa  xmmword ptr [rsp + 48], xmm9
movdqa  xmmword ptr [rsp + 32], xmm8
movdqa  xmmword ptr [rsp + 16], xmm7
movdqa  xmmword ptr [rsp], xmm6
```
xmmword is a SIMD data type with 128 bits (16bytes), which is exactly the size of a uint4x3.

Here is the first couple of lines of the morton encoding:
```
x = (x ^ (x << 16)) & 0xff0000ff; // x = ---- --98 ---- ---- ---- ---- 7654 3210
x = (x ^ (x << 8)) & 0x0300f00f;  // x = ---- --98 ---- ---- 7654 ---- ---- 3210
```

In the unpacked version we see this:
```
shl     ecx, 16
or      ecx, edx
shl     eax, 8
and     eax, 61440
and     ecx, 50331663
or      ecx, eax
```

In the packed version, which is exactly the same code, but with a `unit4` passed in instead of a `uint`.
```
pslld   xmm6, 16
por     xmm6, xmm0
pslld   xmm4, 8
pand    xmm4, xmm1
pand    xmm6, xmm2
por     xmm6, xmm4
```

Here we get packed versions of the same operations. So we get 4 operations for the price of 1.

This brings the test time from 6.12ms to 3.06ms, another 2x speed up.

I thought I'd also try to use IJobParallelFor (batch size 32) to see if I could get a further speed up by splitting this across cores. This **increased** the time taken to 151.61ms. Still have the time of not using Burst at all, but much worse then just turing Burst on.

The big question now is data layout for points. Either an array each for x,y,z, or using the interleaved uint4x3 I've been using in these tests. The interleave data is more complicated to work with, but for very large data sets I like the idea of not having to maintain indices that fit beyond the bounds of an array.
