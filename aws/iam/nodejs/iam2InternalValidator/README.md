IAM2InternalValidator
====================

Cron Job that runs every night at xx:xx in Node.

## Short synopsis
This cron job runs once per day.  It loops through the AWS IAM users on a provided account, appends the domain name suffix to the username and checks against an internal user validation api to determine whether to keep the user and either skips the username or removes it depending on the results. It will also validate against an external store which contains system accounts that have no dashboard access. It will log every removal and log the removals to statsd.

## In more detail, here is what each piece does:

### index.js:
This validates that all the required parameters are passed in and fails if any are missing.  It creates the log and statsd connections.
It instantiates the IAMProcessor object and calls the process function on that object.

### iamprocessor.js
The main flow of the application. It uses a waterfall appraoch using async.  