#!/bin/bash

function generateRule {
basename=$(basename $1 ".png")

cat << EOF
.icon-${basename} {
    background-image: url($1) !important;
}
EOF

}


dirlocation=.
if [ $# -ge 1 ]; then
	dirlocation=$1
fi

for fic in $(find "$dirlocation" -iname "*.png"); do
	generateRule $fic
done

