---
layout: post
title: Text Generation for Unity Jobs
tags: t4, text, unity, jobs
---

You have a NativeArray of floats and and want to add a number to each element. You make an addition job. Easy!

```csharp
[BurstCompile(FloatPrecision.Standard, FloatMode.Fast, CompileSynchronously = true)]
public struct AdditionJob : IJobParallelFor
{
    [ReadOnly] public float NumberToAdd;
    public NativeArray<float> Values;

    public void Execute(int index)
    {
        Values[index] += NumberToAdd;
    }
}
```

Then you do a quick test and realise that using `float4`s in the job instead of `floats` will allow Burst to use SIMD operations. This cuts the time to add to four million elements to almost a third (from 1.996ms to 0.765ms). So you copy and paste the job for a `float4` version. Later in the project you realise that `int` and `int4` version would be useful as well. So calling on the [Rule of Three](https://en.wikipedia.org/wiki/Rule_of_three_(computer_programming)), you decide to generalise somehow.

You'd like to make jobs for each [Unity.Mathematics](https://github.com/Unity-Technologies/Unity.Mathematics) numeric types; `double`, `float`, `int` and `uint` with the dimensions up to 4. This ends up being a lot of jobs! Unfortunately you can't use [Generics](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/) because there is no addition [constraint](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters). So the only real alternative is to use [T4 text generation](https://docs.microsoft.com/en-us/visualstudio/modeling/code-generation-and-t4-text-templates?view=vs-2019).

T4 templates let you write C# code to generate text. You may have noticed that the [Unity.Mathematics](https://github.com/Unity-Technologies/Unity.Mathematics) code is all generated by T4 templates. And [Unity.Collections](https://docs.unity3d.com/Packages/com.unity.collections@0.0/manual/index.html) is using T4 text generation to generate types for [FixedList](https://docs.unity3d.com/Packages/com.unity.collections@0.4/api/Unity.Collections.FixedListByte128.html) and [NativeString](https://docs.unity3d.com/Packages/com.unity.collections@0.4/api/Unity.Collections.NativeString128.html).

So to generate jobs for each numeric type and each dimension I can use this template code:

```csharp
<#
var TYPES = new []{"double","float","int","uint"};
foreach (var TYPE in TYPES)
{
    for (int i = 1; i <= 4; i++)
    {
        for (int j = 1; j <= 4; j++)
        {
            string NUM1 = i==1 ? "" : i.ToString();
            if (i == 1 && j > 1) break;
            string SEP = j==1 ? "" : "x";
            string NUM2 = j==1 ? "" : j.ToString();
            var TYPE_FULL = $"{TYPE}{NUM1}{SEP}{NUM2}";
#>
```

and then the job looks like:

```csharp
[BurstCompile(FloatPrecision.Standard, FloatMode.Fast, CompileSynchronously = true)]
public struct AdditionJob_<#=TYPE_FULL#> : IJobParallelFor
{
    [ReadOnly] public <#=TYPE_FULL#> NumberToAdd;
    public NativeArray<<#=TYPE_FULL#>> Values;

    public void Execute(int index)
    {
        Values[index] += NumberToAdd;
    }
}
```

Running it gives you all the combinations you need.

![Burst Addition Jobs]({{site.assetsurl}}/images/blog/AdditionJobs.png "Addition Jobs")


You can even use the text templates to generate the tests. This may seem like a waste of test time, but it actually helped me find precision differences between the `float` and `float4` versions of these jobs.

![Burst Addition Job Tests]({{site.assetsurl}}/images/blog/AdditionJobTests.png "Addition Job Tests")

Very handy. I'm sure I'm going to be using more T4 templates in the future.