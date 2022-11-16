#!/bin/bash

git reset --hard 
git pull

echo "Enter version of Kaoto to release:"
echo "Example: 1.0.0"
read -r version

echo "Updating to version $version"
sed -i 's/\"version\".*/\"version\"\: \"'$version'\",/g' package.json
git add .
git commit -m "Updating to version $version"
git tag v$version

echo "Now we are going to test the new version."

yarn install
yarn build
yarn test --coverage

echo "Enter new development version:"
echo "('-dev' will be added automatically)"
echo "Example: 1.0.1"
read -r version2

echo "Updating to version $version2-dev"
sed -i 's/\"version\".*/\"version\"\: \"'$version2'-dev\",/g' package.json
git add .
git commit -m "Updating to version $version2-dev"

echo ""
echo "Check the git log and if you like what you see, just do"
echo "'git push' and 'git push --tags'."
echo "This will trigger the release creation."
echo ""
echo "Then go to https://github.com/KaotoIO/kaoto-ui/releases/ to review"
echo "the text of the release and publish it. "
echo ""
echo "Congratulations! Your job here is done."
