#!/usr/bin/env bash

add-apt-repository ppa:brightbox/ruby-ng
apt-get update

apt-get -y install build-essential # to build 'therubyracer' gem
apt-get -y install zlibc zlib1g-dev zlib1g # Dep of bundler/nokogiri

# Make sure we're on ruby 2
apt-get -y install ruby-switch
ruby-switch --set ruby2.1
apt-get -y install ruby2.1 ruby2.1-dev # required for Jekyll

gem install bundler # Install all the gems in Gemfile

# run the bundle install in user mode
pushd /vagrant
sudo -u vagrant bundle install
popd

# node.js
apt-get -y install nodejs
