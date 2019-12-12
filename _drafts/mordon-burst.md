
Without Burst
Without safety checks
With packed
It's always good when performance results start coming back in milliseconds!

Assembly comparison

Without packed, function call:
```movsxd  r8, dword ptr [rcx + 8]```

With packed function call
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


