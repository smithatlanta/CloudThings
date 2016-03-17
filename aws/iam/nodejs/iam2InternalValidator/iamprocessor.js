'use strict';
var async 	= require('async'),
		common 	= require('./common');


function process(log, nconf, statsd, iam, dryRun) {
	log.debug("----------- STARTING -----------");
	var start = new Date();			

	// Love Hate relationship with Node here 
	async.waterfall([
		function(callback){
			common.getUsers(log, nconf, iam, function(err, iamUsers){
				if(err){
			 		var msg = "Error in getUsers: " + err;
			 		log.error(msg);
					return callback(msg);
				}

				callback(null, iamUsers);
			});
		},
		function(iamUsers, callback){
			if(iamUsers.Users.length === 0){
			 		var msg = "No users found";
			 		log.error(msg);
					return callback(msg);
			}

			common.processUsers(log, nconf, iam, iamUsers, dryRun, function(err){
				if(err){
			 		var msg = "Error in processUsers: " + err;
			 		log.error(msg);
					callback(msg);
				}
				callback(undefined);
			});
		}
	],
	function (err, result) {
		if(err){
	 		var message = "Final Error: " + err;
	 		log.debug(message);
		}

		log.debug("----------- ENDING -----------");

		var totalTimeTaken = new Date() - start;
		statsd.timing("IAM2InternalValidator.TotalTime",totalTimeTaken);

	});
}

module.exports = {
	process: process
};
