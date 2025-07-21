function mn(args)
name=subwrd(args,1);
if (name="")
  name="toogood";
endif

res=sys("date");
res=sublin(res,1);
mon=subwrd(res,2);
day=subwrd(res,3);
tstamp=subwrd(res,4);
year=subwrd(res,6);
hh=substr(tstamp,1,2);
mm=substr(tstamp,4,2);
ss=substr(tstamp,7,2);

if (mon="Jan"); mon="01"; endif;
if (mon="Feb"); mon="02"; endif;
if (mon="Mar"); mon="03"; endif;
if (mon="Apr"); mon="04"; endif;
if (mon="May"); mon="05"; endif;
if (mon="Jun"); mon="06"; endif;
if (mon="Jul"); mon="07"; endif;
if (mon="Aug"); mon="08"; endif;
if (mon="Sep"); mon="09"; endif;
if (mon="Oct"); mon="10"; endif;
if (mon="Nov"); mon="11"; endif;
if (mon="Dec"); mon="12"; endif;

time=year%mon%day%hh%mm%ss;

type="png";
target='/home/stygian/grads-2.2.1/img/bestof';
'gxprint 'target'/'name'_'time'.'type

return

*welp*
