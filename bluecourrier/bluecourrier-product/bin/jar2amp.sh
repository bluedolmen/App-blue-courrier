#!/bin/bash

#############################################################
# @author: Brice Pajot (bpajot@bluexml.com)
# @date: 2015-05-29
# @version: 1.0
# 
#############################################################

CURRENT_DIR=$(dirname $(readlink -f $0))

JAR=${JAR:-jar}
UNZIP=${UNZIP:-unzip}
JARSIGNER=${JARSIGNER:-jarsigner}

JAR_FILE=$1
OUTPUT=

WORKING_DIR= # default to /tmp
JOB_DIR=
DEBUG=0
STDOUT=/dev/stdout
KEEP_JOB_DIR=0
MODULE_PROPERTIES=
MODULE_ID=
MODULE_TITLE=
MODULE_DESCR=
MODULE_REPO_MIN=0
MODULE_REPO_MAX=999

function usage() {
	echo "Usage: $(basename $0) [options] amp-file"
	echo "where options:"
	echo "  --help, -h                     : display this help"
	echo "  -workdir WORKDIR               : directory where intermediate computation material will be stored" 
	echo "  --output OUTPUT-FILE, -o       : define the output-file name and path"
	echo "  -d, --debug                    : activate debug mode"
	echo "  -kjd, --keep-job-dir           : keep the job-directory after processing"
	echo "  --module-def MODULE-FILE, -md  : the module.properties file used to package the module"
	echo "  --id,-id ID                    : the id of the module, when the module.properties is not provided"
	echo "  --description DESCR            : the description of the module, when the module.properties is not provided"
	echo "  --title TITLE                  : the title of the module, when the module.properties is not provided"
	echo "  --repo-version VERSION         : the constrtaint on the repo-version on the form min-max"
}

while [ "${1+defined}" ]; do

	case "$1" in
	
	--help|-h)
		usage
		exit 0
	;;
	
	--workdir|-wd)
		shift
		WORKING_DIR=$1
		if [ ! -d ${WORKING_DIR} ]; then
			echo "The working directory ${WORKING_DIR} is not a valid (existing) directory"
			exit
		fi
	;;
	
	--output|-o)
		shift
		OUTPUT=$1
	;;
	
	--debug|-d)
		DEBUG=1
	;;
	
	--keep-job-dir|-kjd)
		KEEP_JOB_DIR=1
	;;

	--module-def|-md)
		shift
		MODULE_PROPERTIES=$(readlink -f $1)
	;;

	--id|-id)
		shift
		MODULE_ID=$1
	;;

	--description)
		shift
		MODULE_DESCRIPTION=$1
	;;

	--title)
		shift
		MODULE_TITLE=$1
	;;

	--repo-version)
		shift
		MODULE_REPO_VERSION=$1
		MODULE_REPO_MIN=$(echo ${MODULE_REPO_VERSION} | cut -f 1 -d '-')
		MODULE_REPO_MAX=$(echo ${MODULE_REPO_VERSION} | cut -f 2 -d '-')
	;;

	*)
		DOCUMENT=$1
	;;
	
	esac	
	
	shift
	
done

#############################################################
# UTILITY FUNCTIONS
# 
#############################################################

function printc() {
	
	output=$(eval 'echo "$1"')
	echo -ne "${output}" >> ${2:-${STDOUT}}
	
}

function log() {

	if [ ${DEBUG:-0} -lt 1 ]; then return; fi
	printc "$*"
	
}

function exit_on_failure() {
	
	status=$?
	if [ ${status} != 0 ]; then
		printc "Failure of operation: $1\n" /dev/stderr
		exit ${2:--1}
	fi
	
}

function exit_with_failure() {
	
	printc "${1:-"Failure"}\n" /dev/stderr
	exit ${2:--1}
	
}

function check_executable() {
	
	if [ ! $(which "$1" -s) ]; then
		return 1
	fi

}

function cleanup() {
	
	if [ 1 -eq ${KEEP_JOB_DIR} ]; then return; fi
	
	log "Cleaning-up job-directory ${JOB_DIR}\n"
	rm -rf ${JOB_DIR}
	
}

#############################################################
# MAIN
#############################################################

function check_precondition() {
	if [ "x${DOCUMENT}" == "x" -o ! -e "${DOCUMENT}" ]; then
		echo "[Error] An existing jar file must be provided!"
		usage
		exit -1
	fi
	if [ "${MODULE_PROPERTIES}" == "" -a "${MODULE_ID}" == "" ]; then
		echo "[Error] One of the -md or -id option must be used!"
		usage
		exit -1
	fi
}

JOB_DIR=
function create_job_dir() {
	trap 'cleanup; exit' SIGHUP SIGINT SIGQUIT SIGTERM

	JOB_DIR=$(mktemp -d -t amp2jarXXXXXXX --suffix=.job --tmpdir=${WORKING_DIR:-/tmp})
	test -x ${JOB_DIR} || exit_with_failure "Cannot create the job directory"
	log "Created job-directory ${JOB_DIR}\n"
}

function main() {
	
	local input_file="$(readlink -f "$1")"
	local output_file="${2:-${input_file%.*}.amp}"
	
	pushd ${JOB_DIR} > /dev/null

	mkdir lib
	cp ${input_file} lib/

	if [ -e "${MODULE_PROPERTIES}" ]; then
		cp ${MODULE_PROPERTIES} .
	else
		MODULE_PROPERTIES="$(readlink -f .)/module.properties"
		MODULE_TITLE=${MODULE_TITLE:-${MODULE_ID}}
		MODULE_DESCRIPTION=${MODULE_DESCRIPTON:-${MODULE_TITLE}}
		touch ${MODULE_PROPERTIES}
		echo "module.id=${MODULE_ID}" >> ${MODULE_PROPERTIES}
		echo "module.title=${MODULE_TITLE}" >> ${MODULE_PROPERTIES}
		echo "module.description=${MODULE_DESCRIPTION}" >> ${MODULE_PROPERTIES}
		echo "module.repo.version.min=${MODULE_REPO_MIN}" >> ${MODULE_PROPERTIES}
		echo "module.repo.version.max=${MODULE_REPO_MAX}" >> ${MODULE_PROPERTIES}
	fi

	${JAR} cMf ${output_file} * # may use zip but jar is probably widely installed in java building environments
	
	popd > /dev/null
	
}


check_precondition

DOCUMENT=${DOCUMENT%.*}.jar

create_job_dir
main ${DOCUMENT} ${OUTPUT}

cleanup

#############################################################
# END
#############################################################
