#
# Geodata
# https://www.bfs.admin.ch/bfs/de/home/dienstleistungen/geostat/geodaten-bundesstatistik/administrative-grenzen/generalisierte-gemeindegrenzen.html
#

.PHONY: geodata
.PRECIOUS: geodata/g1%.shp geodata/g1%.prj geodata/g1%.dbf

geodata: \
	public/topojson/ch-2020.json \
	public/topojson/ch-2019.json \
	public/topojson/ch-2018.json \
	public/topojson/ch-2017.json \
	public/topojson/ch-2016.json \
	public/topojson/ch-2014.json \
	public/topojson/ch-2013.json

# TODO 2015!

# ---

public/topojson/ch-20%.json: geodata/g1g%.shp geodata/g1k%.shp geodata/g1s%.shp geodata/g1g%.prj geodata/g1k%.prj geodata/g1s%.prj geodata/g1g%.dbf geodata/g1k%.dbf geodata/g1s%.dbf
	mkdir -p $(dir $@)
	yarn run mapshaper \
	  -i geodata/g1g$*.shp geodata/g1k$*.shp geodata/g1s$*.shp combine-files string-fields=* encoding=utf8 \
		-clean \
	  -rename-layers municipalities,cantons,lakes \
	  -proj wgs84 \
		-simplify 50% \
	  -o format=topojson drop-table id-field=GMDNR,KTNR $@

# Generate targets based on
#   - types (g=Gemeinde, k=Kanton, l=Landesgrenze, s=See), and
#   - extensions (shp, dbf, prj)
#
# Examples: geodata/g1g19.shp, geodata/g1k18.dbf, etc.
define extract_from_archive
geodata/g1$(1)%.$(2): geodata/src/20%.zip
	unzip -p $$< $$(patsubst geodata/%,ggg_20$$*-LV95/shp/%,$$@) > $$@ \
	|| unzip -p $$< $$(patsubst geodata/%,ggg_20$$*/shp/LV95/%,$$@) > $$@ \
	|| unzip -p $$< $$(patsubst geodata/%,ggg_20$$*/shp/%,$$@) > $$@
endef
$(foreach type,g k l s,$(foreach ext,shp dbf prj,$(eval $(call extract_from_archive,$(type),$(ext)))))

geodata/src/2020.zip:
	mkdir -p $(dir $@)
	curl -o $@ "https://www.bfs.admin.ch/bfsstatic/dam/assets/11947559/master"

geodata/src/2019.zip:
	mkdir -p $(dir $@)
	curl -o $@ "https://www.bfs.admin.ch/bfsstatic/dam/assets/7566557/master"

geodata/src/2018.zip:
	mkdir -p $(dir $@)
	curl -o $@ "https://www.bfs.admin.ch/bfsstatic/dam/assets/5247306/master"

geodata/src/2016.zip:
	mkdir -p $(dir $@)
	curl -o $@ "https://www.bfs.admin.ch/bfsstatic/dam/assets/1902553/master"

geodata/src/2017.zip:
	mkdir -p $(dir $@)
	curl -o $@ "https://www.bfs.admin.ch/bfsstatic/dam/assets/4342877/master"

geodata/src/2015.zip:
	mkdir -p $(dir $@)
	curl -o $@ "https://www.bfs.admin.ch/bfsstatic/dam/assets/330759/master"

geodata/src/2014.zip:
	mkdir -p $(dir $@)
	curl -o $@ "https://www.bfs.admin.ch/bfsstatic/dam/assets/328824/master"

geodata/src/2013.zip:
	mkdir -p $(dir $@)
	curl -o $@ "https://www.bfs.admin.ch/bfsstatic/dam/assets/282011/master"

