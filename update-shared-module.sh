#!/usr/bin/env bash
echo "Refreshing Shared Module with Changes"
rm -rf package-lock.json
rm -rf node_modules/ch-mobile-shared
rm -fr $TMPDIR/metro*
npm i