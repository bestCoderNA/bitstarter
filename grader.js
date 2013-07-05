#! /usr/bin/env node
var fs = require('fs');
var $ = jQuery;
var sys = require('util');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://secure-brushlands-5525.herokuapp.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
	if (!fs.existsSync(instr)) {
	    console.log("%s does not exist. Exiting.", instr);
		process.exit(1);
	}
	return instr;
};

var assertUrlValid = function(inurl) {
    var instr = inurl.toString();
    rest.get(instr).on('complete', function(result) {
	    if (result instanceof Error) {
		    sys.puts('Error: ' + result.message);
		} else {
		    return instr;
		}
	});
}

var cheerioHtmlFile = function(htmlfile) {
    if (!fs.existsSync(htmlfile)) {
	    return cheerio.load(fs.readFileSync(htmlfile));
	} else {
	    rest.get(htmlfile).on('complete', function(result) {
	        if (result instanceof Error) {
		        sys.puts('Error: ' + result.message);
		    } else {
		        return cheerio.load(result);
		    }
	    });
	}
};

var cheerioUrl = function(htmlfile) {
    rest.get(htmlfile).on('complete', function(result) {
	    if (result instanceof Error) {
		    sys.puts('Error: ' + result.message);
		} else {
		    return cheerio.load(result);
		}
	});
}
var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for (var ii in checks) {
	    var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
};

if (require.main == module) {
     program
	     .option('-c, --checks ', 'Path to checks.json', assertFileExists, CHECKSFILE_DEFAULT)
		 .option('-f, --file ', 'Path to index.html', assertFileExists, HTMLFILE_DEFAULT)
		 .option('-u, --url ', 'Path to herokuapp.com', assertUrlValid, URL_DEFAULT)
		 .parse(process.argv); 
	 var checkJson = checkHtmlFile(program.file || program.url, program.checks);
	 var outJson = JSON.stringify(checkJson, null, 4);
	 console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
