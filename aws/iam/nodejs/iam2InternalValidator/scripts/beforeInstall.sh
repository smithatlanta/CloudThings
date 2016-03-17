#!/usr/bin/env bash
# Wait for profile file to exist
while [ ! -f /etc/profile.d/local.sh ]
do
    sleep 1
done
