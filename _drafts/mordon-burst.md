Encode Job
```
        .text
        .intel_syntax noprefix

        .globl  "Unity.Jobs.IJobExtensions.JobStruct`1<InfPoints.Octree.Morton.MortonEncodeJob>.Execute(ref InfPoints.Octree.Morton.MortonEncodeJob data, System.IntPtr additionalPtr, System.IntPtr bufferRangePatchData, ref Unity.Jobs.LowLevel.Unsafe.JobRanges ranges, int jobIndex)_C34A80E56D2CFA6A"
        .p2align        4, 0x90
        .type   "Unity.Jobs.IJobExtensions.JobStruct`1<InfPoints.Octree.Morton.MortonEncodeJob>.Execute(ref InfPoints.Octree.Morton.MortonEncodeJob data, System.IntPtr additionalPtr, System.IntPtr bufferRangePatchData, ref Unity.Jobs.LowLevel.Unsafe.JobRanges ranges, int jobIndex)_C34A80E56D2CFA6A",@function
"Unity.Jobs.IJobExtensions.JobStruct`1<InfPoints.Octree.Morton.MortonEncodeJob>.Execute(ref InfPoints.Octree.Morton.MortonEncodeJob data, System.IntPtr additionalPtr, System.IntPtr bufferRangePatchData, ref Unity.Jobs.LowLevel.Unsafe.JobRanges ranges, int jobIndex)_C34A80E56D2CFA6A":
.Lfunc_begin0:
        .cfi_sections .debug_frame
        .cfi_startproc
        push    rsi
        .cfi_def_cfa_offset 16
        .cfi_offset rsi, -16
        movsxd  r8, dword ptr [rcx + 8]
        test    r8, r8
        jle     .LBB0_3
        mov     r10, qword ptr [rcx]
        mov     r9, qword ptr [rcx + 56]
        .p2align        4, 0x90
.LBB0_2:
        movq    xmm0, qword ptr [r10]
        mov     eax, dword ptr [r10 + 8]
        mov     edx, eax
        and     edx, 1023
        mov     ecx, edx
        shl     ecx, 16
        or      ecx, edx
        shl     eax, 8
        and     eax, 61440
        and     ecx, 50331663
        or      ecx, eax
        mov     eax, ecx
        shl     eax, 4
        or      eax, ecx
        and     eax, 51130563
        lea     r11d, [rax + 4*rax]
        and     r11d, 153391689
        pextrd  ecx, xmm0, 1
        mov     eax, ecx
        and     eax, 1023
        mov     edx, eax
        shl     edx, 16
        or      edx, eax
        shl     ecx, 8
        and     ecx, 61440
        and     edx, 50331663
        or      edx, ecx
        mov     eax, edx
        shl     eax, 4
        or      eax, edx
        and     eax, 51130563
        lea     eax, [rax + 4*rax]
        and     eax, 153391689
        movd    ecx, xmm0
        mov     edx, ecx
        and     edx, 1023
        mov     esi, edx
        shl     esi, 16
        or      esi, edx
        shl     ecx, 8
        and     ecx, 61440
        and     esi, 50331663
        or      esi, ecx
        mov     ecx, esi
        shl     ecx, 4
        or      ecx, esi
        and     ecx, 51130563
        lea     ecx, [rcx + 4*rcx]
        and     ecx, 153391689
        lea     eax, [rcx + 2*rax]
        lea     eax, [rax + 4*r11]
        mov     dword ptr [r9], eax
        add     r9, 4
        add     r10, 12
        dec     r8
        jne     .LBB0_2
.LBB0_3:
        pop     rsi
        ret
.Lfunc_end0:
        .size   "Unity.Jobs.IJobExtensions.JobStruct`1<InfPoints.Octree.Morton.MortonEncodeJob>.Execute(ref InfPoints.Octree.Morton.MortonEncodeJob data, System.IntPtr additionalPtr, System.IntPtr bufferRangePatchData, ref Unity.Jobs.LowLevel.Unsafe.JobRanges ranges, int jobIndex)_C34A80E56D2CFA6A", .Lfunc_end0-"Unity.Jobs.IJobExtensions.JobStruct`1<InfPoints.Octree.Morton.MortonEncodeJob>.Execute(ref InfPoints.Octree.Morton.MortonEncodeJob data, System.IntPtr additionalPtr, System.IntPtr bufferRangePatchData, ref Unity.Jobs.LowLevel.Unsafe.JobRanges ranges, int jobIndex)_C34A80E56D2CFA6A"
        .cfi_endproc

        .globl  burst.initialize
        .p2align        4, 0x90
        .type   burst.initialize,@function
burst.initialize:
.Lfunc_begin1:
        .cfi_startproc
        ret
.Lfunc_end1:
        .size   burst.initialize, .Lfunc_end1-burst.initialize
        .cfi_endproc


        .ident  "Burst"
        .section        ".note.GNU-stack","",@progbits
```



EncodeJob Packed
```

        .text
        .intel_syntax noprefix

        .section        .rodata.cst16,"aM",@progbits,16
        .p2align        4
.LCPI0_0:
        .long   1023
        .long   1023
        .long   1023
        .long   1023
.LCPI0_1:
        .long   61440
        .long   61440
        .long   61440
        .long   61440
.LCPI0_2:
        .long   50331663
        .long   50331663
        .long   50331663
        .long   50331663
.LCPI0_3:
        .long   51130563
        .long   51130563
        .long   51130563
        .long   51130563
.LCPI0_4:
        .long   613566756
        .long   613566756
        .long   613566756
        .long   613566756
.LCPI0_5:
        .long   306783378
        .long   306783378
        .long   306783378
        .long   306783378
.LCPI0_6:
        .long   153391689
        .long   153391689
        .long   153391689
        .long   153391689
        .text
        .globl  "Unity.Jobs.IJobExtensions.JobStruct`1<InfPoints.Octree.Morton.MortonEncodeJob_Packed>.Execute(ref InfPoints.Octree.Morton.MortonEncodeJob_Packed data, System.IntPtr additionalPtr, System.IntPtr bufferRangePatchData, ref Unity.Jobs.LowLevel.Unsafe.JobRanges ranges, int jobIndex)_493B713E4E699B9B"
        .p2align        4, 0x90
        .type   "Unity.Jobs.IJobExtensions.JobStruct`1<InfPoints.Octree.Morton.MortonEncodeJob_Packed>.Execute(ref InfPoints.Octree.Morton.MortonEncodeJob_Packed data, System.IntPtr additionalPtr, System.IntPtr bufferRangePatchData, ref Unity.Jobs.LowLevel.Unsafe.JobRanges ranges, int jobIndex)_493B713E4E699B9B",@function
"Unity.Jobs.IJobExtensions.JobStruct`1<InfPoints.Octree.Morton.MortonEncodeJob_Packed>.Execute(ref InfPoints.Octree.Morton.MortonEncodeJob_Packed data, System.IntPtr additionalPtr, System.IntPtr bufferRangePatchData, ref Unity.Jobs.LowLevel.Unsafe.JobRanges ranges, int jobIndex)_493B713E4E699B9B":
.Lfunc_begin0:
        .cfi_startproc
        sub     rsp, 104
        movdqa  xmmword ptr [rsp + 80], xmm11
        movdqa  xmmword ptr [rsp + 64], xmm10
        movdqa  xmmword ptr [rsp + 48], xmm9
        movdqa  xmmword ptr [rsp + 32], xmm8
        movdqa  xmmword ptr [rsp + 16], xmm7
        movdqa  xmmword ptr [rsp], xmm6
        .cfi_def_cfa_offset 112
        .cfi_offset xmm6, -112
        .cfi_offset xmm7, -96
        .cfi_offset xmm8, -80
        .cfi_offset xmm9, -64
        .cfi_offset xmm10, -48
        .cfi_offset xmm11, -32
        movsxd  r8, dword ptr [rcx + 8]
        test    r8, r8
        jle     .LBB0_3
        mov     rdx, qword ptr [rcx]
        mov     rcx, qword ptr [rcx + 56]
        add     rdx, 44
        movabs  rax, offset .LCPI0_0
        movdqa  xmm11, xmmword ptr [rax]
        movabs  rax, offset .LCPI0_1
        movdqa  xmm1, xmmword ptr [rax]
        movabs  rax, offset .LCPI0_2
        movdqa  xmm2, xmmword ptr [rax]
        movabs  rax, offset .LCPI0_3
        movdqa  xmm3, xmmword ptr [rax]
        movabs  rax, offset .LCPI0_4
        movdqa  xmm8, xmmword ptr [rax]
        movabs  rax, offset .LCPI0_5
        movdqa  xmm9, xmmword ptr [rax]
        movabs  rax, offset .LCPI0_6
        movdqa  xmm10, xmmword ptr [rax]
        .p2align        4, 0x90
.LBB0_2:
        movdqu  xmm4, xmmword ptr [rdx - 44]
        movdqu  xmm5, xmmword ptr [rdx - 28]
        movdqu  xmm7, xmmword ptr [rdx - 12]
        movdqa  xmm0, xmm4
        pand    xmm0, xmm11
        movdqa  xmm6, xmm0
        pslld   xmm6, 16
        por     xmm6, xmm0
        pslld   xmm4, 8
        pand    xmm4, xmm1
        pand    xmm6, xmm2
        por     xmm6, xmm4
        movdqa  xmm0, xmm6
        pslld   xmm0, 4
        por     xmm0, xmm6
        pand    xmm0, xmm3
        movdqa  xmm4, xmm0
        pslld   xmm4, 2
        por     xmm4, xmm0
        pslld   xmm4, 2
        pand    xmm4, xmm8
        movdqa  xmm0, xmm5
        pand    xmm0, xmm11
        movdqa  xmm6, xmm0
        pslld   xmm6, 16
        por     xmm6, xmm0
        pslld   xmm5, 8
        pand    xmm5, xmm1
        pand    xmm6, xmm2
        por     xmm6, xmm5
        movdqa  xmm0, xmm6
        pslld   xmm0, 4
        por     xmm0, xmm6
        pand    xmm0, xmm3
        movdqa  xmm5, xmm0
        pslld   xmm5, 2
        por     xmm5, xmm0
        paddd   xmm5, xmm5
        pand    xmm5, xmm9
        movdqa  xmm0, xmm7
        pand    xmm0, xmm11
        movdqa  xmm6, xmm0
        pslld   xmm6, 16
        por     xmm6, xmm0
        pslld   xmm7, 8
        pand    xmm7, xmm1
        pand    xmm6, xmm2
        por     xmm6, xmm7
        movdqa  xmm0, xmm6
        pslld   xmm0, 4
        por     xmm0, xmm6
        pand    xmm0, xmm3
        movdqa  xmm6, xmm0
        pslld   xmm6, 2
        por     xmm6, xmm0
        pand    xmm6, xmm10
        por     xmm6, xmm4
        por     xmm6, xmm5
        movdqu  xmmword ptr [rcx], xmm6
        add     rcx, 16
        add     rdx, 48
        dec     r8
        jne     .LBB0_2
.LBB0_3:
        movaps  xmm6, xmmword ptr [rsp]
        movaps  xmm7, xmmword ptr [rsp + 16]
        movaps  xmm8, xmmword ptr [rsp + 32]
        movaps  xmm9, xmmword ptr [rsp + 48]
        movaps  xmm10, xmmword ptr [rsp + 64]
        movaps  xmm11, xmmword ptr [rsp + 80]
        add     rsp, 104
        ret
.Lfunc_end0:
        .size   "Unity.Jobs.IJobExtensions.JobStruct`1<InfPoints.Octree.Morton.MortonEncodeJob_Packed>.Execute(ref InfPoints.Octree.Morton.MortonEncodeJob_Packed data, System.IntPtr additionalPtr, System.IntPtr bufferRangePatchData, ref Unity.Jobs.LowLevel.Unsafe.JobRanges ranges, int jobIndex)_493B713E4E699B9B", .Lfunc_end0-"Unity.Jobs.IJobExtensions.JobStruct`1<InfPoints.Octree.Morton.MortonEncodeJob_Packed>.Execute(ref InfPoints.Octree.Morton.MortonEncodeJob_Packed data, System.IntPtr additionalPtr, System.IntPtr bufferRangePatchData, ref Unity.Jobs.LowLevel.Unsafe.JobRanges ranges, int jobIndex)_493B713E4E699B9B"
        .cfi_endproc

        .globl  burst.initialize
        .p2align        4, 0x90
        .type   burst.initialize,@function
burst.initialize:
.Lfunc_begin1:
        .cfi_startproc
        mov     rax, rcx
        movabs  rcx, offset .Lburst_abort.function.string
        rex64 jmp       rax
.Lfunc_end1:
        .size   burst.initialize, .Lfunc_end1-burst.initialize
        .cfi_endproc

        .type   .Lburst_abort.function.string,@object
        .section        .rodata,"a",@progbits
.Lburst_abort.function.string:
        .asciz  "burst_abort"
        .size   .Lburst_abort.function.string, 12


        .ident  "Burst"
        .section        ".note.GNU-stack","",@progbits
```