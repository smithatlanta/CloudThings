'use strict';
var IAMProcessor   			= require('./IAMProcessor'),
	bunyan 								= require('bunyan'),
	nconfenv 							= require('node-env-conf'),
	StatsD 								= require('statsd-client'),
	async 								= require('async'),
	AWS 									= require('aws-sdk');


var dryRun;
var nconf = nconfenv.init();

function validateConfig(configName){
	if(nconf.get(configName) === undefined || nconf.get(configName) === "")
	{
		throw(configName + " is required. You can either add it to the config.json, set an environment var or pass via --");
	}
}

validateConfig("VALIDATEUSERURL");
validateConfig("LOGLEVELSTDOUT");
validateConfig("STATSDHOST");
validateConfig("STATSDPORT");
validateConfig("SYSTEMACCOUNTS");
validateConfig("ENABLESYSTEMACCOUNTCHECK");

process.argv.forEach(function(val, index) {
	if(val.indexOf("help") !== -1){
		console.log("Options:\r\n");
		console.log("--debug - turns on debugging");
		console.log("--dryrun - dry run. no changes made");		
		console.log("--help - this screen");
		process.exit(0);
	}

	if(val.indexOf("debug") !== -1){
		nconf.set("LOGLEVELSTDOUT", "debug");
	}

	if(val.indexOf("dryrun") !== -1){
		dryRun = true;
	}
});

// get the logger, statsd and startup the process
async.parallel({
	log: function(callback){
		var logClient = bunyan.createLogger({name: 'PhotoDetectQueue',
			streams: [
			{
		        stream: process.stdout,
		        level: nconf.get('LOGLEVELSTDOUT')
		    }]
		});
		callback(null, logClient);
	},
	// Set up dynamodb-doc
	iam: function(callback){
		AWS.config.update({
			region: nconf.get('AWS_REGION')
		});

		var iamClient = new AWS.IAM();
		callback(null, iamClient);
	},
  statsd: function(callback){
		var statsdClient = new StatsD({host: nconf.get('STATSDHOST'), port: nconf.get('STATSDPORT'), debug:true});
		callback(null, statsdClient);
	}
},
function(err, results_data) {
	IAMProcessor.process(results_data.log, nconf, results_data.statsd, results_data.iam, dryRun);
});
