#!/usr/bin/env bash
if [ -a /etc/profile.d/local.sh ]
    then
        source  /etc/profile.d/local.sh
fi

export APP_NAME=IAM2InternalValidator
pushd /home/ubuntu/
mkdir logs

pushd /home/ubuntu/$APP_NAME
sudo cp config/supervisord.conf /etc/supervisor/supervisord.conf
sudo cp config/supervisor.conf /etc/supervisor/conf.d/supervisor.conf

sudo npm install

pushd config/$LOCALENV

sudo cp ./yikyakqueuephoto.conf /etc/supervisor/conf.d/yikyakqueuephoto.conf

echo "AWS CloudWatch Logging config"
sudo cp -f awslogs/awslogs.conf /var/awslogs/etc/awslogs.conf
sudo chown root:root /var/awslogs/etc/awslogs.conf
sudo chmod 600 /var/awslogs/etc/awslogs.conf
sudo service awslogs restart

sudo service supervisor restart
popd
