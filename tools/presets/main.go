package main

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

const mainPreset = `[preset.0]

name="main"
platform="Web"
runnable=true
advanced_options=false
dedicated_server=false
custom_features=""
export_filter="resources"
export_files=PackedStringArray("res://main.tscn", "res://director/compose_atlas_image_part.gd", "res://director/compose_atlas_texture2d.gd", "res://director/director.gd", "res://director/flipped_image.gd", "res://director/inker.gd", "res://director/ink_image.gd", "res://director/ink_texture2d.gd", "res://director/nine_patch_composed_texture.gd", "res://director/three_slice_composed_texture.gd", "res://fuse_client/connection_manager.gd", "res://fuse_client/error_manager_class.gd", "res://fuse_client/fuse_client.gd", "res://fuse_client/fuse_client.tscn", "res://fuse_client/http_request_pool.gd", "res://fuse_client/message_bus.gd", "res://fuse_client/resource_pack_loader.gd", "res://fuse_client/resource_pack_manager.gd", "res://fuse_client/special_services.gd", "res://fuse_client/variable_container.gd", "res://logo.png")
include_filter="*.txt"
exclude_filter=""
export_path="../web/client/index.html"
patches=PackedStringArray()
encryption_include_filters=""
encryption_exclude_filters=""
seed=0
encrypt_pck=false
encrypt_directory=false
script_export_mode=2

[preset.0.options]

custom_template/debug=""
custom_template/release=""
variant/extensions_support=false
variant/thread_support=false
vram_texture_compression/for_desktop=false
vram_texture_compression/for_mobile=false
html/export_icon=true
html/custom_html_shell=""
html/head_include="<script>
var PARAMS = {
sw1: \"client.allow.cross.domain=1;client.notify.cross.domain=0\",
sw2: \"connection.info.host=127.0.0.1;connection.info.port=1234\",
sw6: \"client.connection.failed.url=$path/clientutils.php?key=connection_failed;external.variables.txt=./external_variables.txt\",
};
</script>"
html/canvas_resize_policy=1
html/focus_canvas_on_start=true
html/experimental_virtual_keyboard=false
progressive_web_app/enabled=true
progressive_web_app/ensure_cross_origin_isolation_headers=true
progressive_web_app/offline_page=""
progressive_web_app/display=1
progressive_web_app/orientation=0
progressive_web_app/icon_144x144=""
progressive_web_app/icon_180x180=""
progressive_web_app/icon_512x512=""
progressive_web_app/background_color=Color(0, 0, 0, 1)
threads/emscripten_pool_size=8
threads/godot_pool_size=4
`

const figurepreviewPresetTemplate = `
[preset.1]

name="figurepreview"
platform="Web"
runnable=false
advanced_options=false
dedicated_server=false
custom_features=""
export_filter="all_resources"
export_files=PackedStringArray()
include_filter="%s"
exclude_filter=""
export_path="../web/figurepreview/index.html"
patches=PackedStringArray()
encryption_include_filters=""
encryption_exclude_filters=""
seed=0
encrypt_pck=false
encrypt_directory=false
script_export_mode=2

[preset.1.options]

custom_template/debug=""
custom_template/release=""
variant/extensions_support=false
variant/thread_support=false
vram_texture_compression/for_desktop=true
vram_texture_compression/for_mobile=false
html/export_icon=true
html/custom_html_shell=""
html/head_include="<script>
var PARAMS = {};
</script>"
html/canvas_resize_policy=1
html/focus_canvas_on_start=true
html/experimental_virtual_keyboard=false
progressive_web_app/enabled=false
progressive_web_app/ensure_cross_origin_isolation_headers=true
progressive_web_app/offline_page=""
progressive_web_app/display=1
progressive_web_app/orientation=0
progressive_web_app/icon_144x144=""
progressive_web_app/icon_180x180=""
progressive_web_app/icon_512x512=""
progressive_web_app/background_color=Color(0, 0, 0, 1)
threads/emscripten_pool_size=8
threads/godot_pool_size=4
`

const pckPresetTemplate = `
[preset.%d]

name="%s"
platform="Web"
runnable=false
advanced_options=false
dedicated_server=false
custom_features=""
export_filter="all_resources"
export_files=PackedStringArray()
include_filter="%s/*"
exclude_filter=""
export_path="../web/client/%s.pck"
patches=PackedStringArray()
encryption_include_filters=""
encryption_exclude_filters=""
seed=0
encrypt_pck=false
encrypt_directory=false
script_export_mode=2

[preset.%d.options]

custom_template/debug=""
custom_template/release=""
variant/extensions_support=false
variant/thread_support=false
vram_texture_compression/for_desktop=true
vram_texture_compression/for_mobile=false
html/export_icon=true
html/custom_html_shell=""
html/head_include=""
html/canvas_resize_policy=2
html/focus_canvas_on_start=true
html/experimental_virtual_keyboard=false
progressive_web_app/enabled=false
progressive_web_app/ensure_cross_origin_isolation_headers=true
progressive_web_app/offline_page=""
progressive_web_app/display=1
progressive_web_app/orientation=0
progressive_web_app/icon_144x144=""
progressive_web_app/icon_180x180=""
progressive_web_app/icon_512x512=""
progressive_web_app/background_color=Color(0, 0, 0, 1)
threads/emscripten_pool_size=8
threads/godot_pool_size=4
`

func main() {
	dirs, err := filepath.Glob("client/hh_*")
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}
	sort.Strings(dirs)

	// Build figurepreview include filter: figurepreview/*, director/*, hh_human/*, hh_human_*/*
	var fpIncludes []string
	fpIncludes = append(fpIncludes, "figurepreview/*", "director/*", "fuse_client/http_request_pool.gd")
	for _, dir := range dirs {
		name := filepath.Base(dir)
		if strings.HasPrefix(name, "hh_human") {
			fpIncludes = append(fpIncludes, name+"/*")
		}
	}

	var sb strings.Builder
	sb.WriteString(mainPreset)
	sb.WriteString(fmt.Sprintf(figurepreviewPresetTemplate, strings.Join(fpIncludes, ", ")))

	idx := 2
	for _, dir := range dirs {
		name := filepath.Base(dir)
		sb.WriteString(fmt.Sprintf(pckPresetTemplate, idx, name, name, name, idx))
		idx++
	}

	if err := os.WriteFile("client/export_presets.cfg", []byte(sb.String()), 0644); err != nil {
		fmt.Fprintf(os.Stderr, "error writing file: %v\n", err)
		os.Exit(1)
	}

	pckCount := idx - 2
	fmt.Printf("Generated %d presets (1 main + 1 figurepreview + %d pck)\n", idx, pckCount)
}
