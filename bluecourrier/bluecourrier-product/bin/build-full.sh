#!/bin/bash

CURRENT_DIR=${CURRENT_DIR:-"$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"}
SVNREV="$(svn_rev "${WORKSPACE_DIR}")"
MVN_OPTS="${MVN_OPTS} -Dbuild.svnrev=${SVNREV}"

#DELIVERY_DIR should be defined

#########################################################
# PROJECT BUILDS
#########################################################

# The root-dir contains the parent-pom which needs to be installed 
# -N means non-recursive
if [ -e "${ROOT_DIR}/pom.xml" ]; then
	cd ${ROOT_DIR}
	${MAVEN} -N clean install
fi

PROJECTS=("${DEPENDENCY_PROJECTS[@]}" "${REPO_PROJECTS[@]}" "${SHARE_PROJECTS[@]}")

for project in "${PROJECTS[@]}"; do

	test ! -d ${project} && continue
	cd "${project}"
	# TODO: be less intrusive by using clean package when it is sufficient
	${MAVEN} ${MVN_OPTS} clean install || exit_with_failure "Error while building $(basename "${project}")"

done

#########################################################
# AMPS PROCESSING
# + ALFRESCO WEBAPP BUILD
#########################################################
# Gather AMP files in the same place
AMPS_DIR=${ROOT_DIR}/target/amps
echo ${AMPS_DIR}
mkdir -p "${AMPS_DIR}"
for project in "${REPO_PROJECTS[@]}"; do
	cp "${project}"/target/*.amp "${AMPS_DIR}" || exit_with_failure "Cannot find amp files in $(basename "${project}")"
done

TARGET=${ROOT_DIR}/target/webapps
mkdir -p ${TARGET}
TARGET_WEBAPP="${TARGET}/alfresco"
unzip ${ALFRESCO_BASE_WAR} -d ${TARGET_WEBAPP}
for amp_file in "${AMPS_DIR}"/*.amp; do
	${APPLY_AMP} "${amp_file}" "${TARGET_WEBAPP}"
done

#########################################################
# SHARE WEBAPP BUILD
#########################################################

TARGET_WEBAPP="${TARGET}/share"
SHARE_LIB_TARGET="${TARGET_WEBAPP}/WEB-INF/lib"
unzip ${SHARE_BASE_WAR} -d ${TARGET_WEBAPP}
for project in "${SHARE_PROJECTS[@]}"; do
	cp "${project}"/target/*.jar "${SHARE_LIB_TARGET}" || exit_with_failure "Cannot find jar files in $(basename "${project}")"
done

#########################################################
# EXTJS WEBAPP BUILD
#########################################################

TARGET_WEBAPP="${TARGET}/extjs"

unzip ${WORKSPACE_DIR}/extjs-integration/extjs-lib-4.2/src/main/resources/extjs-4.2.1.zip -d ${TARGET}
cp -r ${WORKSPACE_DIR}/extjs-integration/extjs-lib-4.2/src/main/resources/ux ${TARGET_WEBAPP}/src/

#########################################################
# PACKAGING
#########################################################

cd ${TARGET}/.. # parent of webapps
VERSION="$(${XPATH} -q -e '/project/version/text()' ${ROOT_DIR}/pom.xml)"
archive_file="webapps-${PRODUCT_NAME}-${VERSION:-${TODAY}}${SVNREV:+-}${SVNREV}.tar.gz"

# Write build-properties into the provided file
if [ -f "${BUILD_PROPERTIES}" ]; then
	cat >> "${BUILD_PROPERTIES}" << EOF
application.revision=${SVNREV}
application.build-date=${TODAY}
EOF
fi

# Build the archive
tar cvfz "${archive_file}" webapps


