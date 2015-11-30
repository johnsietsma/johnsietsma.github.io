#!/usr/bin/env bash

add-apt-repository ppa:brightbox/ruby-ng # For ruby2.1
apt-get update

# Make sure we're on ruby 2
apt-get -y install ruby-switch
ruby-switch --set ruby2.1
apt-get -y install ruby2.1 ruby2.1-dev # required for Jekyll

gem install 'github-pages'

# node.js
apt-get -y install nodejs
