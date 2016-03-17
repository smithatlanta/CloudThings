'use strict';
var assert      = require('assert'),
  nconf         = require('nconf'),
  common        = require('../common'),
  bunyan        = require('bunyan'),
  AWS           = require('aws-sdk');

describe('User tests', function() {
  var iam;
  var log;

  before(function() {
    nconf.file({ file: 'env/development.json' });

    log = bunyan.createLogger({name: 'IAM2InternalValidator',
      streams: [
      {
        stream: process.stdout,
        level: nconf.get('LOGLEVELSTDOUT')
      }]
    });

    AWS.config.update({
      region: nconf.get('AWS_REGION')
    });

    iam = new AWS.IAM();
  });

  var groupName = "test";
  var userNames = ["test1@turner.com", "test2@turner.com", "test3@turner.com", "test4@turner.com", "test5@turner.com"];

  it('Test system account verify not a system user', function(done) {
  var userName = "test";
    common._private.verifySystemUser(log, nconf, userName, function(result){
      assert(result === false);
      done();        
    });
  });

  it('Test system account verify is a system user', function(done) {
  var userName = "system";
    common._private.verifySystemUser(log, nconf, userName, function(result){
      assert(result === true);
      done();        
    });
  });

  it('Create test group', function(done) {
    common._private.createIAMGroup(log, nconf, iam, groupName, function(err, results){
      assert(err === undefined);
      done();        
    });
  });

  this.timeout(15000);

  it('Create Test Users', function(done) {
    common._private.setupUsers(log, nconf, iam, userNames, groupName, function(err){
      assert(err === undefined);
      done();        
    });
  });

  this.timeout(15000);
   
  it('Test getUsers function', function(done) {
    common.getUsers(log, nconf, iam, function(err, results){
      assert(err === undefined);
      assert(results.Users.length > 0);
      done();        
    });
  });

  this.timeout(15000);

  it('Test processUsers dryRun true function', function(done) {
    common.getUsers(log, nconf, iam, function(err, results){
      common.processUsers(log, nconf, iam, results, true, function(err){
        assert(err === undefined);
        done();        
      });
    });
  });

  this.timeout(15000);

  it('Test processUsers dryRun false function', function(done) {
    common.getUsers(log, nconf, iam, function(err, results){
      common.processUsers(log, nconf, iam, results, false, function(err){
        assert(err === undefined);
        done();        
      });
    });
  });

  this.timeout(15000);

  it('Delete test group', function(done) {
    common._private.deleteIAMGroup(log, nconf, iam, groupName, function(err, results){
      assert(err === undefined);
      done();        
    });
  });

});
