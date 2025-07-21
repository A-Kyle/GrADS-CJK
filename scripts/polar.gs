function polar(args)
*************************************************************************
*************************************************************************
*************************************************************************
***
*** GrADS Script Name: "polar.gs"
***                     by Kyle Ahern
***                     on 2015 November 1 (Last Mod: 2015 Dec 7)
***
*** Purpose:  Facilitate describing motion in polar coordinates
***           assuming a given center (radius=0 @ given center).
***
*** Typical Usage:
***
***           "run polar.gs cx cy u v [additional args]"
***
***           Required arguments:
***           cx = central longitude (degrees, default) 
***                OR central X coordinate (alternative option)
***           cy = central latitude (degrees, default)
***                OR central Y coordinate (alt option)
***
***           Additional required arguments for radial & tangential flow fields:
***           u = name of zonal component of vector field
***           v = name of meridional component of vector field
***           * NOTE: without both these arguments, only 
***                   radius & azimuth are calculated.
***
***           Other additional arguments:
***           "-g"  = cx and cy arguments are expressions of
***                   central X and Y coordinates instead of
***                   longitude and latitude. The script will
***                   gather the longitude & latitudes associated
***                   with the central X & Y coordinates using 
***                   NEAREST NEIGHBOR. NOTE that this means that
***                   if your X & Y are NOT integers, they will be 
***                   relocated to the NEAREST INTEGERS of X & Y. No such
***                   relocation is done if you use lon & lat.
***           "-s"  = skip calculations of radius and azimuth, assume
***                   radius and azimuth are already defined.
***                   Useful if wanting to transform multiple vector
***                   fields on the same polar/cylindrical grid.
***           "-x [varname]"  = use [varname] instead of "lon"
***                             as longitude field in calculations.
***           "-y [varname]"  = use [varname] instead of "lat"
***                             at latitude field in calculations.
***
*** Assumptions:
***           ~ A file has already been opened, so fields can be defined
***           ~ Polar grid relative to lon & lat fields is static
***             (for a polar grid that moves, this script can be run
***             once per time analyzed)
***
*** Products:
***
***           For the (X,Y) dimensions set when the function is called:
***           + radius: distance(meters) from the given center
***           + radang: azimuth of radial unit vector
***           + aziang: azimuth of azimuthal unit vector
***
***           For the (X,Y,Z,T) dimensions set when the function is called:
***           + wndang: azimuth of given vector field
***           + radmag: magnitude of vector's radial component
***           + azimag: magnitude of vector's azimuthal component
***           NOTE: given vector fields share units with radmag and azimag.
***
*** Questions: send message to kyle.k.ahern at gmail.com
***
*** Ref: Ahern, K. and L. Cowan (2018):
***         Minimizing errors when projecting geospatial data onto a vortex-centered space.
***         Geophys. Res. Lett., 45, doi:10.1029/2018GL079953.
***
*************************************************************************
*************************************************************************
*************************************************************************

**************
*****
* Process arguments
*****
**************

maxargs=10;
numargs=0;
while (numargs<maxargs)
  if (subwrd(args,numargs+1)="")
    break;
  endif
  numargs=numargs+1;
endwhile

if (numargs<2)
  say "Error: not enough arguments passed."
  say "At least 2 arguments needed:"
  say "1. cx = central longitude (degrees, default)"
  say "2. cy = central latitude (degrees, default)"
  say
  return;
endif

;* args 1 & 2 MUST be central coords
cx=subwrd(args,1);
cy=subwrd(args,2);

u="";
v="";
gr=0;
skipgrid=0;
lonvar="lon";
latvar="lat";

if (numargs>2)
  i=3;
  ;* args 3 & 4 should usually be u & v field names
  ;* BUT they could be other args instead
  a=subwrd(args,i); i=i+1;
  if (a="-g")
    gr=1;
  else; if (a="-x")
    lonvar=subwrd(args,i); i=i+1;
  else; if (a="-y")
    latvar=subwrd(args,i); i=i+1;
  else; if (a="-s")
    ;* the "skip" flag in the 3-slot
    ;* negates everything in the script,
    ;* because then u & v aren't given.
    return;
  else
    u=a;
    v=subwrd(args,i); i=i+1;
  endif; endif; endif; endif;

  while(i<=numargs)
    a=subwrd(args,i); i=i+1;
    if (a="-g")
      gr=1;
    else; if (a="-x")
      lonvar=subwrd(args,i); i=i+1;
    else; if (a="-y")
      latvar=subwrd(args,i); i=i+1;
    else; if (a="-s")
      skipgrid=1;
    endif; endif; endif; endif;
  endwhile
endif

**************
*****
* Query current set dimensional bounds
*****
**************

'q dims'
rec = sublin(result,2);
if (subwrd(rec,3) = 'fixed')
  xmin = subwrd(rec,9);
  xmax = xmin;
else
  xmin = subwrd(rec,11);
  xmax = subwrd(rec,13);
endif

rec = sublin(result,3);
if (subwrd(rec,3) = 'fixed')
  ymin = subwrd(rec,9);
  ymax = ymin;
else
  ymin = subwrd(rec,11);
  ymax = subwrd(rec,13);
endif

rec = sublin(result,4);
if (subwrd(rec,3) = 'fixed')
  zmin = subwrd(rec,9);
  zmax = zmin;
else
  zmin = subwrd(rec,11);
  zmax = subwrd(rec,13);
endif

rec = sublin(result,5);
if (subwrd(rec,3) = 'fixed')
  tmin = subwrd(rec,9);
  tmax = tmin;
else
  tmin = subwrd(rec,11);
  tmax = subwrd(rec,13);
endif

**************
***** 
* Get central lon/lat from X/Y if needed
*****
**************

if (gr)
  'set X 'cx
  'set Y 'cy
  'set Z 'zmin
  'set T 'tmin
  'd 'lonvar
  cx=subwrd(result,4);
  'd 'latvar
  cy=subwrd(result,4);
endif

**************
*****
* Define required constants
*****
**************

pi = 3.1415926;
A = 6371393;

**************
*****
* Define 2D arrays describing X (cross-lateral) 
* and Y (lateral) angular distances relative to the center point
* throughout the domain set (xrange and yrange).
* In other words, we define xrange and yrange, which are 
* the angular distances from the origin of a flat plane orthogonal to the
* Earth's surface at the given center point
*****
**************
  
'set X 'xmin' 'xmax
'set Y 'ymin' 'ymax
'set Z 'zmin
'set T 'tmin

if (!skipgrid)
  'define adist = acos(sin('cy'*'pi'/180)*sin('latvar'*'pi'/180) + cos('cy'*'pi'/180)*cos('latvar'*'pi'/180)*cos(('lonvar'-'cx')*'pi'/180))'
  'define kprime = adist/sin(adist)'

  'define xrange = kprime*cos('latvar'*'pi'/180)*sin(('lonvar'-'cx')*'pi'/180)'
  'define yrange = kprime*(cos('cy'*'pi'/180)*sin('latvar'*'pi'/180) - sin('cy'*'pi'/180)*cos('latvar'*'pi'/180)*cos(('lonvar'-'cx')*'pi'/180))'
  'define radius = adist * 'A

  'undefine adist'
  
  'define radang = 180 - atan2(yrange,-xrange)*180/'pi
  'define aziang = 180 - atan2(xrange, yrange)*180/'pi
endif

'set X 'xmin' 'xmax
'set Y 'ymin' 'ymax
'set Z 'zmin' 'zmax
'set T 'tmin' 'tmax

;* skip the rest if no u or v were given
if (u="" | v="")
  return;
endif

**************
*****
* Define arrays of azimuths for radial, tangential, and full horizontal
* wind (streamline) unit vectors. Angles are mathematical with 0
* degrees directed eastward from the center and increasing counter-clockwise. 
* Units are in degrees.
*****
**************

'define wndang = 180 - atan2('v',-'u')*180/'pi

eps = 1000  ;* the smaller this value, the smaller the perturbation
            ;* distance based on the vector field
            ;* probably don't have to modify this unless you're
            ;* working on extremely small/large scales

'define xpert = ('eps' * cos(wndang * 'pi' / 180)) / ('A' * cos('latvar' * 'pi' / 180))'
'define ypert = ('eps' * sin(wndang * 'pi' / 180)) / 'A
'define lonpert = 'lonvar' + xpert'
'define latpert = 'latvar' + ypert'

'define Padist = acos(sin('cy'*'pi'/180)*sin(latpert*'pi'/180) + cos('cy'*'pi'/180)*cos(latpert*'pi'/180)*cos((lonpert-'cx')*'pi'/180))'
'define Pkprime = Padist/sin(Padist)'

'define Pxrange = Pkprime*cos(latpert*'pi'/180)*sin((lonpert-'cx')*'pi'/180)'
'define Pyrange = Pkprime*(cos('cy'*'pi'/180)*sin(latpert*'pi'/180) - sin('cy'*'pi'/180)*cos(latpert*'pi'/180)*cos((lonpert-'cx')*'pi'/180))'
'define Pradius = Padist * 'A
'define projang = atan2(Pyrange-yrange, Pxrange-xrange)*180/'pi

**************
*****
* With azimuths of the real wind and radial/tangential unit 
* vectors, define magnitudes of the radial/tangential wind
* components via vector multiplication. 
* Units are the same as u and v.
*****
**************

'define azimag = mag('u','v')*cos((projang - aziang)*'pi'/180)'
'define radmag = mag('u','v')*cos((projang - radang)*'pi'/180)'

'undefine xpert'
'undefine ypert'
'undefine lonpert'
'undefine latpert'
'undefine Padist'
'undefine Pkprime'
'undefine Pxrange'
'undefine Pyrange'
'undefine Pradius'
'undefine projang'

return

;* \^o^/