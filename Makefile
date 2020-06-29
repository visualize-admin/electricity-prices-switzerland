#
# Geodata
# https://www.bfs.admin.ch/bfs/de/home/dienstleistungen/geostat/geodaten-bundesstatistik/administrative-grenzen/generalisierte-gemeindegrenzen.html
#

.PHONY: geodata

geodata: \
	public/topojson/2020/ch-country.json \
	public/topojson/2020/ch-cantons.json \
	public/topojson/2020/ch-lakes.json \
	public/topojson/2020/ch-municipalities.json \
	public/topojson/2019/ch-country.json \
	public/topojson/2019/ch-cantons.json \
	public/topojson/2019/ch-lakes.json \
	public/topojson/2019/ch-municipalities.json \
	public/topojson/2018/ch-country.json \
	public/topojson/2018/ch-cantons.json \
	public/topojson/2018/ch-lakes.json \
	public/topojson/2018/ch-municipalities.json

# ---

public/topojson/20%/ch-country.json: geodata/g1l%.shp geodata/g1l%.dbf geodata/g1l%.prj
	mkdir -p $(dir $@)
	yarn run mapshaper $< \
	  -proj wgs84 \
	  -filter-fields CODE_ISO \
	  -rename-layers country \
	  -o format=topojson id-field=CODE_ISO $@

public/topojson/20%/ch-cantons.json: geodata/g1k%.shp geodata/g1k%.dbf geodata/g1k%.prj
	mkdir -p $(dir $@)
	yarn run mapshaper $< \
	  -proj wgs84 \
	  -filter-fields KTNR \
	  -rename-layers cantons \
	  -o format=topojson id-field=KTNR $@

public/topojson/20%/ch-lakes.json: geodata/g1s%.shp geodata/g1s%.dbf geodata/g1s%.prj
	mkdir -p $(dir $@)
	yarn run mapshaper $< \
	  -proj wgs84 \
	  -filter-fields \
	  -rename-layers lakes \
	  -o format=topojson $@

public/topojson/20%/ch-municipalities.json: geodata/g1g%.shp geodata/g1g%.dbf geodata/g1g%.prj
	mkdir -p $(dir $@)
	yarn run mapshaper $< \
	  -proj wgs84 \
	  -filter-fields GMDNR,KTNR \
	  -rename-fields parentId=KTNR \
	  -rename-layers municipalities \
	  -o format=topojson id-field=GMDNR $@

# Generate targets based on
#   - types (g=Gemeinde, k=Kanton, l=Landesgrenze, s=See), and
#   - extensions (shp, dbf, prj)
#
# Examples: geodata/g1g19.shp, geodata/g1k18.dbf, etc.
define extract_from_archive
geodata/g1$(1)%.$(2): geodata/src/20%.zip
	unzip -p $$< $$(patsubst geodata/%,ggg_20$$*-LV95/shp/%,$$@) > $$@
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

