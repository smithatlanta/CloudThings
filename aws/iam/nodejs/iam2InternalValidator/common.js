'use strict';
var async   = require('async'),
    request = require('request');


// IAM wrappers

function createIAMUser(log, nconf, iam, userName, callback){
  log.debug("Creating user: " + userName);
  var params = {
    UserName: userName
  };

  iam.createUser(params, function(err, data) {
    if (err){
      log.debug(err);
      return callback(err);
    }
    callback(undefined);
  });                
}

function deleteIAMUser(log, nconf, iam, userName, dryRun, callback){
  if(dryRun){
    console.log("You would delete user: " + userName);
    return callback(undefined);
  }


  log.debug("Deleting user: " + userName);
  var params = {
    UserName: userName
  };

  iam.deleteUser(params, function(err, data) {
    if (err){
      log.debug(err);
      return callback(err);
    }
    callback(undefined);
  });                
}

function addIAMUserToGroup(log, nconf, iam, userName, groupName, callback){
  log.debug("Adding user: " + userName + " to group: " + groupName);
  var params = {
    UserName: userName,
    GroupName: groupName    
  };

  iam.addUserToGroup(params, function(err, data) {
    if (err){
      log.debug(err);
      return callback(err);
    }
    callback(undefined);
  });                
}

function removeIAMUserFromGroup(log, nconf, iam, userName, groupName, callback){
  log.debug("Removing user: " + userName + " from group: " + groupName);
  var params = {
    UserName: userName,
    GroupName: groupName    
  };

  iam.removeUserFromGroup(params, function(err, data) {
    if (err){
      log.debug(err);
      return callback(err);
    }
    callback(undefined);
  });                
}

function createIAMAccessKey(log, nconf, iam, userName, callback){
  log.debug("Creating access key for user " + userName);
  var params = {
    UserName: userName
  };

  iam.createAccessKey(params, function(err, data) {
    if (err){
      log.debug(err);
      return callback(err);
    }
    callback(undefined);
  });                
}

function deleteIAMAccessKey(log, nconf, iam, userName, accessKeyId, callback){
  log.debug("Removing access key: " + accessKeyId + " from user: " + userName);
  var params = {
    AccessKeyId: accessKeyId,
    UserName: userName
  };
  iam.deleteAccessKey(params, function(err, data) {
    if (err){
      log.debug(err);
      return callback(err);
    }
    callback(undefined);
  });
}

function createIAMGroup(log, nconf, iam, groupName, callback){
  log.debug("Creating group: " + groupName);
  var params = {
    GroupName: groupName
  };
  iam.createGroup(params, function(err, data) {
    if (err){
      log.debug(err);
      return callback(err);
    }
    
    callback(undefined, data);
  });
}

function deleteIAMGroup(log, nconf, iam, groupName, callback){
  log.debug("Deleting group: " + groupName);
  var params = {
    GroupName: groupName
  };
  iam.deleteGroup(params, function(err, data) {
    if (err){
      log.debug(err);
      return callback(err, undefined);
    }
    
    callback(undefined, data);
  });
}

function getIAMUsers(log, nconf, iam, callback){
  log.debug("Getting IAM users");
  var params = {
    PathPrefix: '/'
  };
  iam.listUsers(params, function(err, data) {
    log.debug("Found: " + data.Users.length + " users.");
    if (err){
      log.debug(err);
      return callback(err, undefined);
    }
    
    callback(undefined, data);
  });
}

function deleteAccessKeysForIAMUser(log, nconf, iam, userName, dryRun, callback){
  log.debug("Starting Access Key removal for " + userName);
  var params = {
    UserName: userName
  };
  
  // get the access keys for the user that need to be deleted
  iam.listAccessKeys(params, function(err, iamKeys) {
    if (err){
      log.debug(err);
      return callback(err);
    }

    log.debug("Found: " + iamKeys.AccessKeyMetadata.length + " keys");

    // loop thru the iam access keys for the user and remove them from the keys
    async.eachSeries(iamKeys.AccessKeyMetadata, function(iamKey, cb) {
      if(dryRun){
        console.log("You would remove user: " + userName + " from accessKeyId: " + iamKey.AccessKeyId);
        return cb();
      }
      else{
        deleteIAMAccessKey(log, nconf, iam, userName, iamKey.AccessKeyId, function(err, result){
          cb();
        });        
      }
    }, function(err){
      // after all groups have been processed we end up here
      if (err){
        log.debug(err);
        return callback(err);
      }
      callback(undefined);
    });
  });
}

function deleteGroupsForIAMUser(log, nconf, iam, userName, dryRun, callback){
  log.debug("Starting Group removal for " + userName);
  var params = {
    UserName: userName
  };
  
  // get the groups for the user that need to be deleted
  iam.listGroupsForUser(params, function(err, iamGroups) {
    if (err){
      log.debug(err);
      return callback(err);
    }

    log.debug("Found: " + iamGroups.Groups.length + " groups");

    // loop thru the iam groups for the user and remove them from the group
    async.eachSeries(iamGroups.Groups, function(iamGroup, cb) {
      if(dryRun){
        console.log("You would remove user: " + userName + " from groupName: " + iamGroup.GroupName);        
        return cb();
      }
      removeIAMUserFromGroup(log, nconf, iam, userName, iamGroup.GroupName, function(err, result){
        cb();
      });
    }, function(err){
      // after all groups have been processed we end up here
      if (err){
        log.debug(err);
        return callback(err);
      }
      callback(undefined);
    });
  });
}

// Functions to bulk add and remove users

function setupUser(log, nconf, iam, userName, groupName, callback){
  async.series([
    function(cb){
      createIAMUser(log, nconf, iam, userName, function(err){
        if(err){
          log.debug(err);
          return callback(err);
        }
        cb(null);
      });
    },
    function(cb){
      addIAMUserToGroup(log, nconf, iam, userName, groupName, function(err){
        if(err){
          log.debug(err);
          return callback(err);
        }
        cb(null);        
      });      
    },
    function(cb){
      createIAMAccessKey(log, nconf, iam, userName, function(err){
        if(err){
          log.debug(err);
          return callback(err);
        }
        cb(null);
      });
    }
  ],
  // optional callback
  function(err, results){
      callback(err);
  });
}

function setupUsers(log, nconf, iam, userNames, groupName, callback){
  async.eachSeries(userNames, function(userName, cb) {
    setupUser(log, nconf, iam, userName, groupName, function(err){
      cb();
    });
  }, function(err){
    // after all groups have been processed we end up here
    if (err){
      log.debug(err);
      return callback(err);
    }
    callback(undefined);
  });
}

function deleteUser(log, nconf, iam, userName, dryRun, callback){
  async.series([
    function(cb){
      deleteAccessKeysForIAMUser(log, nconf, iam, userName, dryRun, function(err){
        if(err){
          log.debug(err);
          return callback(err);
        }
        cb(null);
      });
    },
    function(cb){
      deleteGroupsForIAMUser(log, nconf, iam, userName, dryRun, function(err){
        if(err){
          log.debug(err);
          return callback(err);
        }
        cb(null);        
      });      
    },
    function(cb){
      deleteIAMUser(log, nconf, iam, userName, dryRun, function(err){
        if(err){
          log.debug(err);
          return callback(err);
        }
        cb(null);
      });
    }
  ],
  // optional callback
  function(err, results){
      callback(err);
  });
}

// Internal Verification

// calls out to an api that returns either true or false as to whether a user is valid in some external system
function verifyUser(log, nconf, userName, callback){
  log.debug("Verifying user: " + userName);
  callback(false);
}

// loops through a list of known system account names and skips them if they contain it
function verifySystemUser(log, nconf, userName, callback){
  log.debug("Verifying user against system users: " + userName);
  var systemAccounts = nconf.get('SYSTEMACCOUNTS');
  for(var x = 0; x < systemAccounts.length; x++){
    if(userName.indexOf(systemAccounts[x]) !== -1){
      log.debug("Skipping " + userName + " because of " + systemAccounts[x] + " account rule.");
      return callback(true);
    }    
  }

  callback(false);
}

// Externally available functions

function getUsers(log, nconf, iam, callback){
  getIAMUsers(log, nconf, iam, function(err, results){
    callback(err, results);
  });
}

function processUsers(log, nconf, iam, iamUsers, dryRun, callback){
  // loop thru the iam users, verify, and maybe delete
  async.eachSeries(iamUsers.Users, function(iamUser, cb) {
    // Perform operation on file here.
    verifyUser(log, nconf, iamUser.UserName, function(resultVerify){
      if(resultVerify === true){
        cb();
      }
      else {
        verifySystemUser(log, nconf, iamUser.UserName, function(resultSystemVerify){
          if(resultSystemVerify === true){
            cb();
          }
          else{
            deleteUser(log, nconf, iam, iamUser.UserName, dryRun, function(resultDelete){
              cb();
            });
          }
        });
      }
    });
  }, function(err){
    // if any of the file processing produced an error, err would equal that error
    if (err){
      log.debug(err);
      return callback(err);
    }
    
    callback(undefined);
  });
}


module.exports = {
  getUsers: getUsers,
  processUsers: processUsers,
};

module.exports._private = {
  setupUsers: setupUsers,
  setupUser: setupUser,
  deleteUser: deleteUser,
  deleteAccessKeysForIAMUser: deleteAccessKeysForIAMUser,
  deleteGroupsForIAMUser: deleteGroupsForIAMUser,
  createIAMUser: createIAMUser,
  deleteIAMUser: deleteIAMUser,
  addIAMUserToGroup: addIAMUserToGroup,
  removeIAMUserFromGroup: removeIAMUserFromGroup,
  createIAMAccessKey: createIAMAccessKey,
  deleteIAMAccessKey: deleteIAMAccessKey,
  createIAMGroup: createIAMGroup,
  deleteIAMGroup: deleteIAMGroup,
  getIAMUsers: getIAMUsers,
  verifyUser: verifyUser,
  verifySystemUser: verifySystemUser
};