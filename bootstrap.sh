#!/usr/bin/env bash

apt-get update

# node.js
apt-get -y install nodejs

apt-get -y install npm

# bower.io
npm install -g bower

# less
npm install -g less

# install all dev deps
npm install

# install Jekyll
gem install jekyll

gem install less
