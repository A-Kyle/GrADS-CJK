# Customized Grid Analysis and Display System (GrADS)
#### Sourced from Release 2.2.1
#### Initial customization: 05 Sep 2023

This repository contains customized sources and headers that enable UTF-8
string rendering via Cairo in GrADS 2.2.1. 
The code must be compiled from source, but the user does 
not need to fetch any libraries that GrADS doesn't normally require.

If successful, GrADS will process user inputs as UTF-8 encoded strings, 
which enables the use of user-defined fonts that can cover a vast number 
of languages, including symbol-rich CJK languages 
(Chinese, Japanese, Korean). The user must be sure to load a viable
font that includes the symbols they want to use via `set font <font number> file <font file path>` 
in GrADS.

> [!NOTE]
> The sizing and kerning of individual symbols in these new procedures for UTF-8 strings are following default, English-based and static procedures in GrADS. That means for languages where the kerning/sizing of symbols is quite different from Latin languages, the customizations here may be insufficient.

#### Example
![an example](https://raw.githubusercontent.com/A-Kyle/GrADS-CJK/master/example/utf8_01.png)

## Other customizations

### Vertical strings

A new command, `draw vstring`, was added. It functions the same as `draw string`
commands with the same arguments, and also refers to all
`set string` options in the same way (size, etc), but it 
renders the symbols along the vertical. The following example script:

    "set string 1 bl" ;* bottom-left justify
    "draw vstring 3 3 Hello"

will draw:

     H
     e
     l
     l
    .o

where the period represents X=3, Y=3 (the bottom-left corner
of the string). Rotations also work. 

> [!NOTE]
> Default Hershey fonts are buggy due to incorrect spacing between characters.

#### Example
![an example](https://raw.githubusercontent.com/A-Kyle/GrADS-CJK/master/example/utf8_02.png)

### Query RGB

A new command, `q rgb`, was added. The user can use `q rgb <color#>` to
get the values of the red, green, blue, and alpha channels for any
defined color. In the following example script:

    "set rgb 50 123 0 132"
    "q rgb 50"

GrADS will return:

     R = 123  G = 0  B = 132  A = 255

