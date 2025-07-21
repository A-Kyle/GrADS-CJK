#!/bin/bash
exts=".cpg .dbf .prj .README.html .shp .shx .VERSION.txt"

ipref="ne_10m_admin_0_boundary_lines_land"
opref="boundary_lines_land"
for e in $exts ; do
  mv ${ipref}${e} ${opref}${e}
done

ipref="ne_10m_admin_0_countries_lakes"
opref="countries_lakes"
for e in $exts ; do
  mv ${ipref}${e} ${opref}${e}
done

ipref="ne_10m_admin_0_countries"
opref="countries"
for e in $exts ; do
  mv ${ipref}${e} ${opref}${e}
done

ipref="ne_10m_admin_1_states_provinces_lakes"
opref="states_provinces_lakes"
for e in $exts ; do
  mv ${ipref}${e} ${opref}${e}
done

ipref="ne_10m_admin_1_states_provinces"
opref="states_provinces"
for e in $exts ; do
  mv ${ipref}${e} ${opref}${e}
done

ipref="ne_10m_admin_2_counties_lakes"
opref="counties_lakes"
for e in $exts ; do
  mv ${ipref}${e} ${opref}${e}
done

ipref="ne_10m_admin_2_counties"
opref="counties"
for e in $exts ; do
  mv ${ipref}${e} ${opref}${e}
done

ipref="ne_10m_populated_places"
opref="populated_places"
for e in $exts ; do
  mv ${ipref}${e} ${opref}${e}
done

ipref="ne_10m_roads_north_america"
opref="roads_north_america"
for e in $exts ; do
  mv ${ipref}${e} ${opref}${e}
done

exit
