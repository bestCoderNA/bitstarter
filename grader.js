#!/usr/bin/env node

var fs = require('fs');
var sys = require('util');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://secure-brushlands-5525.herokuapp.com";
var buf;

var assertFileExists = function(infile) {
    var instr = infile.toString();
	if (!fs.existsSync(instr)) {
	    console.log("%s does not exist. Exiting.", instr);
		process.exit(1);
	}
	return instr;
};

var assertUrlValid = function(inurl) {
    var tmpurl = inurl.toString();
    rest.get(tmpurl).on('complete', function(result) {
	    if (result instanceof Error) {
		    sys.puts('Error: ' + result.message);
			process.exit(1);
		}
		buf = new Buffer(result);
	});
    return tmpurl;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioUrlAddr = function(tmpbuf) {
    return cheerio.load(tmpbuf);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, url, checksfile) {
    if (htmlfile != null) {
        $ = cheerioHtmlFile(htmlfile); 
	} else {
		$ = cheerioUrlAddr(buf);		
	}
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for (var ii in checks) {
	    var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
};

var clone = function(fn) {
    return fn.bind({});
};

if (require.main == module) {
     program
	     .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
		 .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
		 .option('-u, --url <url_address>', 'Path to herokuapp.com', clone(assertUrlValid), URL_DEFAULT)
		 .parse(process.argv); 
	 var checkJson = checkHtmlFile(program.file, program.url, program.checks);
	 var outJson = JSON.stringify(checkJson, null, 4);
	 console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}