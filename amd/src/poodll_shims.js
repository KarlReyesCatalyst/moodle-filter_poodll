/* jshint ignore:start */
define([], function() {
	window.requirejs.config({
		paths: {
			"lzflash": M.cfg.wwwroot + '/filter/poodll/flash/embed-compressed'
		},
		shim: {
			'lzflash' : {exports: 'lz'}
		}
	});//end of window.requirejs.config
});