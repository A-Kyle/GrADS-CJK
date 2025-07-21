say "click the bottom-left corner of the box"
'q pos'
cxi=subwrd(result,3);
cyi=subwrd(result,4);
'draw mark 3 'cxi' 'cyi' 0.1'
'q xy2gr 'cxi' 'cyi
xi=subwrd(result,3);
yi=subwrd(result,6);
'q xy2w 'cxi' 'cyi
Lxi=subwrd(result,3);
Lyi=subwrd(result,6);

say "click the top-right corner of the box"
'q pos'
cxf=subwrd(result,3);
cyf=subwrd(result,4);
'draw mark 3 'cxf' 'cyf' 0.1'
'q xy2gr 'cxf' 'cyf
xf=subwrd(result,3);
yf=subwrd(result,6);
'q xy2w 'cxf' 'cyf
Lxf=subwrd(result,3);
Lyf=subwrd(result,6);

'draw rec 'cxi' 'cyi' 'cxf' 'cyf

say
say "Your box:"
say "    X: "xi" "xf
say "    Y: "yi" "yf
say "  lon: "Lxi" "Lxf
say "  lat: "Lyi" "Lyf
say

*\^o^/*