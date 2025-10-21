node tools/build-extension.js "$1"
cd build/temp || exit
zip -r "OverQuill-$1.zip" . -x '.*' -x '**/__MACOSX' -x '**/.*'
mv "OverQuill-$1.zip" "../"
cd ../ || exit
if [ -d "temp" ]; then rm -Rf "temp"; fi
cd ../ || exit
echo "Successfully created build for $1"



