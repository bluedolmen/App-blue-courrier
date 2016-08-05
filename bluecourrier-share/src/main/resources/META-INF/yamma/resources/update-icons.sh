#!/bin/bash
./set-icons.sh
pushd .
cd css
../generate-css.sh ../icons > icons.css
popd .

