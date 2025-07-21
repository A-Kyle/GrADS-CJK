function mn(args)

_XI=subwrd(args,1);
_YI=subwrd(args,2);
_XF=subwrd(args,3);
_YF=subwrd(args,4);
_M=subwrd(args,5);
_V=subwrd(args,6);
if (_YF="")
  'q gxinfo'
  plin=sublin(result,2);
  WWIDTH=subwrd(plin,4);
  WHEIGHT=subwrd(plin,6);
  _XI=0;
  _YI=0;
else
  WWIDTH =_XF-_XI;
  WHEIGHT=_YF-_YI;
endif
if (_M="")
  _M=1.0;
endif

'q dims'
xlin=sublin(result,2);
ylin=sublin(result,3);
xtyp=subwrd(xlin,3);
ytyp=subwrd(ylin,3);
if (xtyp = "fixed" | ytyp = "fixed")
  say "X or Y are not varying; doing nothing"
  return;
endif

xi=subwrd(xlin,11);
xf=subwrd(xlin,13);
yi=subwrd(ylin,11);
yf=subwrd(ylin,13);

xsiz=xf-xi;
ysiz=yf-yi;


if (xsiz > ysiz)
  pw=1.0;
  ph=ysiz/xsiz;
else
  pw=xsiz/ysiz;
  ph=1.0;
endif
if (WWIDTH > WHEIGHT)
  uw=1.0;
  uh=WHEIGHT/WWIDTH;
  ;* rescale the plotting area
  if (ph > uh)
    scale=uh/ph;
    ph=uh;
    pw=pw*scale;
    pwi=pw*WWIDTH ;* scaled parea width (in) INCLUDING margin
    phi=ph*WWIDTH ;* ............ height
    mscale=(phi-_M)/phi ;* fraction of scaled h EXCLUDING 1-inch margin
    phi=phi*mscale ;* scaled parea height (in) EXCLUDING margin
    pwi=pwi*mscale ;* ............ width
  else
    pwi=pw*WWIDTH ;* scaled parea width (in) INCLUDING margin
    phi=ph*WWIDTH ;* ............ height
    mscale=(pwi-_M)/pwi ;* fraction of scaled w EXCLUDING 1-inch margin
    phi=phi*mscale ;* scaled parea height (in) EXCLUDING margin
    pwi=pwi*mscale ;* ............ width
  endif
else
  uw=WWIDTH/WHEIGHT;
  uh=1.0;
  if (pw > uw)
    ;* rescale the plotting area
    scale=uw/pw;
    pw=uw;
    ph=ph*scale;
    pwi=pw*WHEIGHT ;* scaled parea width (in) INCLUDING margin
    phi=ph*WHEIGHT ;* ............ height
    mscale=(pwi-_M)/pwi ;* fraction of scaled w EXCLUDING 1-inch margin
    phi=phi*mscale ;* scaled parea height (in) EXCLUDING margin
    pwi=pwi*mscale ;* ............ width
  else
    pwi=pw*WHEIGHT ;* scaled parea width (in) INCLUDING margin
    phi=ph*WHEIGHT ;* ............ height
    mscale=(phi-_M)/phi ;* fraction of scaled w EXCLUDING 1-inch margin
    phi=phi*mscale ;* scaled parea height (in) EXCLUDING margin
    pwi=pwi*mscale ;* ............ width
  endif
endif

xmin=_XI+((WWIDTH-pwi)*0.5);
xmax=xmin+pwi;
ymin=_YI+((WHEIGHT-phi)*0.5);
ymax=ymin+phi;

if (_V="1")
  say
  say "   Scaled parea info"
  say "   -----------------"
  say "          Page W: "WWIDTH
  say "          Page H: "WHEIGHT
  say "   X-grid length: "xsiz
  say "   Y-grid length: "ysiz
  say "     Plot Area X: "xmin" to "xmax
  say "     Plot Area Y: "ymin" to "ymax
  say "     Plot Area W: "xmax-xmin
  say "     Plot Area H: "ymax-ymin
  say
endif
'set parea 'xmin' 'xmax' 'ymin' 'ymax
return

*\^o^/*
