#!/bin/sh

set -e

image=$1
directory=$(dirname $0)/..

convert -resize 32 ${image} ${directory}/favicon.png
convert -resize 64 ${image} ${directory}/favicon.ico

convert -resize 57 ${image} ${directory}/images/apple-touch-icon-precomposed.png
convert -resize 72 ${image} ${directory}/images/apple-touch-icon-72x72-precomposed.png
convert -resize 114 ${image} ${directory}/images/apple-touch-icon-114x114-precomposed.png
convert -resize 144 ${image} ${directory}/images/apple-touch-icon-144x144-precomposed.png
convert -resize 200 ${image} ${directory}/images/default-thumb.png
convert -resize 256 ${image} ${directory}/images/icon.png
