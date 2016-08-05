SHARE_HOME=~/opt/alfresco-3.4.6/share/webapps/share
CONFIG_HOME=src/main/resources

if [ ! -d $CONFIG_HOME ]; then
	echo "Cannot find config home directory $CONFIG_HOME"
	exit -1
fi

for fic in $(find $CONFIG_HOME -type f); do

DIRECTORY=$(dirname $fic)
mkdir -p ${DIRECTORY}
cp $(fic)

done