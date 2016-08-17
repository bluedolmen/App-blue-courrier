#!/bin/bash
springloadedfile=~/.m2/repository/org/springframework/springloaded/1.2.6.RELEASE/springloaded-1.2.6.RELEASE.jar

if [ ! -f $springloadedfile ]; then
	mvn validate -Psetup
fi

#MAVEN_OPTS="${MAVEN_OPTS} -javaagent:$springloadedfile -noverify -Xms1G -Xmx3G"
MAVEN_OPTS="-Dlicense=community ${MAVEN_OPTS}";
MAVEN_DEBUG_OPTS=${MAVEN_OPTS}

echo "MAVEN_OPTS is set to '$MAVEN_OPTS'";

mvn ${MAVEN_OPTS} clean install -Prun
#mvnDebug ${MAVEN_OPTS} clean install -Prun
