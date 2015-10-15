#! /usr/bin/env bash

ROOT_DIR=$(pwd)
TARGET_DIR=$(pwd)/target

if [ -d "${TARGET_DIR}" ]; then
	rm -rf ${TARGET_DIR}
fi
mkdir -p ${TARGET_DIR}/artifacts
mkdir -p ${TARGET_DIR}/war

ALFRESCO_VERSION=5.0.d

# Build alfresco-extensions

echo "Building alfresco-extensions project"
cd alfresco-extensions
mvn clean install
cp target/alfresco-extensions-*-classes.jar ${TARGET_DIR}/artifacts
cp target/alfresco-extensions-*.amp ${TARGET_DIR}/artifacts

cd ${ROOT_DIR}
echo "Building bluecourrier project"
cd bluecourrier
mvn clean install
cp bluecourrier-repo/target/bluecourrier-repo-*.amp ${TARGET_DIR}/artifacts
cp bluecourrier-share/target/bluecourrier-share-*.jar ${TARGET_DIR}/artifacts

cd ${ROOT_DIR}
echo "Building extjs-integration-share project"
cd extjs-integration
mvn clean install
cp extjs-integration-share/target/extjs-integration-share-*.jar ${TARGET_DIR}/artifacts

echo "Building extjs zip file"
cd extjs-lib-4.2
if [ -d "target" ]; then
  # Control will enter here if $DIRECTORY exists.
  rm -rf target
fi
mkdir target
cd target
cp ../src/main/resources/extjs-4.2.1.zip extjs.zip
mkdir extjs/src/
cp -r ../src/main/resources/ux extjs/src/
zip -r extjs.zip extjs
cp extjs.zip ${TARGET_DIR}/artifacts


echo "Retrieve alfresco-mmt from maven (version ${ALFRESCO_VERSION}"
cd ${TARGET_DIR}
mvn dependency:get -Dartifact=org.alfresco:alfresco-mmt:${ALFRESCO_VERSION}:jar: -DrepoUrl=https://artifacts.alfresco.com/nexus/content/groups/public/ -Ddest=alfresco-mmt.jar

echo "Retrieve alfresco and share war from maven (version ${ALFRESCO_VERSION}"
cd ${TARGET_DIR}/war
mvn dependency:get -Dartifact=org.alfresco:alfresco:${ALFRESCO_VERSION}:war: -DrepoUrl=https://artifacts.alfresco.com/nexus/content/groups/public/ -Ddest=alfresco.war
mvn dependency:get -Dartifact=org.alfresco:share:${ALFRESCO_VERSION}:war: -DrepoUrl=https://artifacts.alfresco.com/nexus/content/groups/public/ -Ddest=share.war

echo "Building share.war"
mkdir -p share/WEB-INF/lib
cp ${TARGET_DIR}/artifacts/bluecourrier-share-*.jar share/WEB-INF/lib
cp ${TARGET_DIR}/artifacts/extjs-integration-share-*.jar share/WEB-INF/lib
cd share
jar -uf ../share.war WEB-INF/lib/*

echo "Building alfresco.war"
cd ${TARGET_DIR}/war
java -jar ${TARGET_DIR}/alfresco-mmt.jar install ${TARGET_DIR}/artifacts/alfresco-extensions-*.amp alfresco.war -nobackup
cd ${TARGET_DIR}/war
java -jar ${TARGET_DIR}/alfresco-mmt.jar install ${TARGET_DIR}/artifacts/bluecourrier-repo-*.amp alfresco.war -nobackup

cd ${ROOT_DIR}
if [ -d "${TARGET_DIR}/war/share" ]; then
  # Control will enter here if $DIRECTORY exists.
  rm -rf ${TARGET_DIR}/war/share
fi
