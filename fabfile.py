from fabric.api import env
from fabric.contrib.project import rsync_project

env.hosts = ['jsietsma@jsietsma.webfactional.com']
env.path = '~/webapps/johnsietsma'

def sync():
    rsync_project( local_dir="www/_site/", remote_dir=env.path, exclude=".DS_Store", delete=True )

def deploy():
    sync();
