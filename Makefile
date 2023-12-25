identifier := $(shell cat build/app.json | jq -r '.identifier')

source_file := app.js
snapshot_file := build/files/code/${identifier}
tools_dir := $(if $(WATCH_SDK_PATH),$(WATCH_SDK_PATH),../../)
package_file := ${identifier}.wapp
package_path := build/${package_file}

adb_target := 192.168.1.99:35733
adb_target_dir := /sdcard/${package_file}

.PHONY: all build compile pack push connect install clean

all: build install
build: compile pack copy

compile:
	mkdir -p build/files/code build/files/config
	jerry-snapshot generate -f '' ${source_file} -o ${snapshot_file}

pack:
	python3 ${tools_dir}tools/pack.py -i build/ -o ${package_path}

copy:
	cp ${package_path} ../../wapp/

connect:
	adb connect ${adb_target}

install:
	adb shell am broadcast \
    -a "nodomain.freeyourgadget.gadgetbridge.Q_UPLOAD_FILE" \
    --es EXTRA_HANDLE APP_CODE \
    --es EXTRA_PATH "${adb_target_dir}" \
	--ez EXTRA_GENERATE_FILE_HEADER false

clean:
	rm -f build/files/code/*
	rm -f build/*.wapp
