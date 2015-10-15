#!/bin/bash

LOF=$(find .. -iname "*.js" -o -iname "extjs-custom.css")
ICONS_SOURCE_DIR=${HOME}/Images/icons
ICONS_DEST_DIR=icons

if [ ! -d $ICONS_SOURCE_DIR ]; then
  echo "$ICONS_SOURCE_DIR does not exist as a directory"
  exit 1
fi

if [ ! -e $ICONS_DEST_DIR ]; then
  echo "$ICONS_DEST_DIR  does not exist as a directory"
  exit 1
fi

function copy_icon {

  SOURCE_ICON_PATH=$(find ${ICONS_SOURCE_DIR} -name "$1" | head -1)

  if [ ! -e "$SOURCE_ICON_PATH" ]; then
    echo "Cannot find any valid icon for key: $1"
    return
  fi

  if [ ! -e "$ICONS_DEST_DIR/$1" ]; then
    echo "Copying $1"
    cp "$SOURCE_ICON_PATH" "$ICONS_DEST_DIR"
  fi

}

# css icon classes
grep 'icon-' $LOF | while read match; do
  cssclass=$(echo $match | sed 's/.*\(icon-[A-Za-z0-9_-]*\).*/\1/' )
  basefilename=$(echo $cssclass | cut -f 2- -d '-')
  filename=${basefilename}.png
  copy_icon $filename
done

# png-files
egrep '.png' $LOF | while read match; do
  filename=$(echo $match | sed 's/.*[^A-Za-z0-9_-]\([A-Za-z0-9_-]*\.png\).*/\1/' )
  copy_icon $filename
done

# gif-files
egrep '.gif' $LOF | while read match; do
  filename=$(echo $match | sed 's/.*[^A-Za-z0-9_-]\([A-Za-z0-9_-]*\.gif\).*/\1/' )
  copy_icon $filename
done

# getIconDefinition
egrep 'getIconDefinition' $LOF | while read match; do
  basefilename=$(echo $match | tr "'" '%' | tr -d ' ' | sed 's/.*getIconDefinition.%\([A-Za-z0-9_-]*\)%..*/\1/')
  filename=${basefilename}.png
  copy_icon $filename
done
