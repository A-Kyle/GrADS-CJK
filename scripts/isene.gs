function isen(args)
*----------------------------------------------------------------------
* Bob Hart (rhart@fsu.edu) /  FSU Meteorology
* Last Updated: 6/22/2018
* 
* 6/22/18 - Added hcurl example and simplified script a bit, all in commented examples.
*
* 2/12/12 - Updated so that it can be called as a regular function
*           like cbarn.   Note that the field is now returned as
*           a variable defined by the fifth argument passed. See
*           updated call examples below.
*
* 2/26/99 - Fixed a bug that caused the script to crash on
*           certain machines.  
*
* GrADS function to interpolate within a 3-D grid to a specified
* isentropic level.  Can also be used on non-pressure level data, such
* as sigma or eta-coordinate output where pressure is a function
* of time and grid level.  Can be used to create isentropic PV surfaces
* (examples are given at end of documentation just prior to
* function.)
* 
* Advantages:  Easy to use, no UDFs.  Disadvantages:  Can take 5-20 secs,
*              especially with large domains and/or high resolution data.
*
* Arguments:
*    field = name of 3-D grid to interpolate
*
*    tgrid = name of 3-D grid holding temperature values (deg K) at each
*            gridpoint.
*
*    pgrid = name of 3-D grid holding pressure values (mb) at each gridpoint
*            If you are using regular pressure-level data, this should be
*            set to the builtin GrADS variable 'lev'.
*
*    tlev  = theta-level (deg K) at which to interpolate
* 
*    rgrid = variable name of the grid into which the result is stored
*
* NOTE:  Areas having tlev below bottom level or above upper level 
*        will be undefined in output field. Extrapolation is NOT
*        performed!!
*
*------------------------------------------------------------------------
*
* EXAMPLE FUNCTION CALLS:
*
* Sample variables: u = u-wind in m/s
*                   v = v-wind in m/s
*                   w = vertical velocity
*                   t = temperature in K
*                   PP = pressure data in mb
*
* 1) Display vertical velocity field on 320K surface:
* 
*    run isen.gs w t PP 320 omega320
*    "d omega320"
*
* 2) Create & Display colorized streamlines on 320K surface:
*
*    run isen.gs u t PP 320 u320
*    run isen.gs v t PP 320 v320
*    "set z 1"
*    "set gxout stream"
*    "d u320;v320;mag(u320,v320)"
*
* 3) Create & display a 320K isentropic PV surface:
*
*    "set lev 1050 150"
*    "defind d2r=3.1415926/180"
*    "define coriol=2*7.29e-5*sin(lat*d2r)"
*    "define dvdx=cdiff(v,x)/(6.371e6*cos(lat*d2r)*cdiff(lon,x)*d2r)"
*    "define dudy=cdiff(u*cos(lat*d2r),y)/(6.371e6*cos(lat*d2r)*cdiff(lat,y)*d2r)"
*    "define vort=dvdx-dudy"
*    "define dt=t(z-1)*pow(1000/PP(z-1),0.286)-t(z+1)*pow(1000/PP(z+1),0.286)"
*    "define dp=100*(PP(z-1)-PP(z+1))"
*    "define dtdp=dt/dp"
*    run isen.gs vort t PP 320 part1
*    run isen.gs dtdp t PP 320 part2
*    "define pv320=-9.8*(coriol+part1)*part2"
*    "set z 1"
*    "d pv320"
*
** or more simply, using the built in hcurl function:
*
*    "set lev 1050 150"
*    "defind d2r=3.1415926/180"
*    "define coriol=2*7.29e-5*sin(lat*d2r)"
*    "define vort=hcurl(u,v)"
*    "define dt=t(z-1)*pow(1000/PP(z-1),0.286)-t(z+1)*pow(1000/PP(z+1),0.286)"
*    "define dp=100*(PP(z-1)-PP(z+1))"
*    "define dtdp=dt/dp"
*    run isen.gs vort t PP 320 part1
*    run isen.gs dtdp t PP 320 part2
*    "define pv320=-9.8*(coriol+part1)*part2"
*    "set z 1"
*    "d pv320"
*
* PROBLEMS:  Send email to Bob Hart (rhart@fsu.edu)
* 
*-----------------------------------------------------------------------
*-------------------- BEGINNING OF FUNCTION ----------------------------
*-----------------------------------------------------------------------

* Parse input arguments

field=subwrd(args,1)
tgrid=subwrd(args,2)
pgrid=subwrd(args,3)
tlev=subwrd(args,4)
rgrid=subwrd(args,5)

if (rgrid = "") 
   say "*** NOTE:   As of March 2012, the method of calling this script has changed. ***"
   say " "
   say "Insufficient number of arguments given."
   say " "
   say "Usage:   run isen.gs field tgrid pgrid tlev rgrid"
   say "    field = name of 3-D grid to interpolate"
   say "    tgrid = name of 3-D grid holding temperature values (deg K) at each gridpoint."
   say "    pgrid = name of 3-D grid holding pressure values (mb) at each gridpoint"
   say "            If you are using regular pressure-level data, this should be set to the builtin GrADS variable 'lev'."
   say "    tlev  = theta-level (deg K) at which to interpolate"
   say "    rgrid = variable name of the grid into which the result is stored"
   say " "
   say "For example, GFS 320K zonal wind stored into the variable zonal320 would be called as:"
   say "     run isen.gs ugrdprs tmpprs lev 320 zonal320"
   say " "
   say "Exiting."
   exit
endif

* Get initial dimensions of dataset so that exit dimensions will be
* same

"q dims"
rec=sublin(result,4)
ztype=subwrd(rec,3)
if (ztype = "fixed") 
   zmin=subwrd(rec,9)
   zmax=zmin
else
   zmin=subwrd(rec,11)
   zmax=subwrd(rec,13)
endif

* Get full z-dimensions of dataset.

"q file"
rec=sublin(result,5)
zsize=subwrd(rec,9)

* Determine spatially varying bounding pressure levels for isen surface
* tabove = theta-value at level above ; tbelow = theta value at level
* below for each gridpoint

"set z 1 "zsize
"define theta="tgrid""
"set z 2 "zsize
"define thetam="tgrid"(z-1)"
"set z 1 "zsize-1
"define thetap="tgrid"(z+1)"

"define tabove=0.5*maskout(theta,theta-"tlev")+0.5*maskout(theta,"tlev"-thetam)"
"define tbelow=0.5*maskout(theta,thetap-"tlev")+0.5*maskout(theta,"tlev"-theta)"

* Isolate field values at bounding pressure levels
* fabove = requested field value above isen surface
* fbelow = requested field value below isen surface

"define fabove=tabove*0+"field
"define fbelow=tbelow*0+"field

"set z 1"

* Turn this 3-D grid of values (mostly undefined) into a 2-D isen layer

* If more than one layer is valid (rare), take the mean of all the
* valid levels. Not the best way to deal with the multi-layer issue,
* but works well, rarely if ever impacts output, and is quick.
* Ideally, only the upper most level would be used.  However, this
* is not easily done using current GrADS intrinsic functions.

"define fabove=mean(fabove,z=1,z="zsize")"
"define fbelow=mean(fbelow,z=1,z="zsize")"
"define tabove=mean(tabove,z=1,z="zsize")"
"define tbelow=mean(tbelow,z=1,z="zsize")"

* Finally, interpolate linearly in theta and create isen surface.
* Linear interpolation in theta works b/c it scales as height,
* or log-P, from Poisson equation for pot temp.

"set z "zmin " " zmax

"define slope=(fabove-fbelow)/(tabove-tbelow)"
"define b=fbelow-slope*tbelow"
"define "rgrid"=slope*"tlev"+b"

* variable interp now holds isentropic field and its named it returned
* for use by the user.

say "Done.  Newly defined variable "rgrid" has "tlev"K "field"-field."

return(0)
