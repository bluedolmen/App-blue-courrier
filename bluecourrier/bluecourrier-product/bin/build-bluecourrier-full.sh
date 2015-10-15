#!/bin/bash

CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "${CURRENT_DIR}/common.sh.lib"

PRODUCT_NAME=bluecourrier
BRANCH=4.2

ALFRESCO_EXTENSIONS_LOCATION=${ALFRESCO_EXTENSIONS_LOCATION:-${WORKSPACE_DIR}/alfresco-extensions}
EXTJS_INTEGRATION_SHARE=${EXTJS_INTEGRATION:-${WORKSPACE_DIR}/extjs-integration/extjs-integration-share}

DEPENDENCY_PROJECTS=()
REPO_PROJECTS=("${ALFRESCO_EXTENSIONS_LOCATION}" "${ROOT_DIR}/bluecourrier-repo")
SHARE_PROJECTS=("${EXTJS_INTEGRATION_SHARE}" "${ROOT_DIR}/bluecourrier-share")

DELIVERY_DIR="/var/www/pipin/html/devel/projects/${PRODUCT_NAME}/${BRANCH}"

source "${CURRENT_DIR}/build-full.sh"

