const path = require('path');
const fs = require('fs');
const tsconfig = require('../tsconfig.lib.json');

const dirPath = path.join(__dirname, '../dist/lib');

const tsPathAlias = Object.entries(tsconfig.compilerOptions.paths).map(([key, [value]]) => ({
  matchString: key,
  replaceString: value.slice(2).replace('src', dirPath)
}));

const getJsFileList = (dirName) => {
  let files = [];
  const items = fs.readdirSync(dirName, { withFileTypes: true,  });

  for (const item of items) {
    if (item.isDirectory()) {
      files = [...files, ...getJsFileList(`${dirName}/${item.name}`)];
    } else if (path.extname(item.name) === '.js') {
      files.push(`${dirName}/${item.name}`);
    }
  }

  return files;
};

const files = getJsFileList(dirPath);

files.forEach((filePath) => {
  const originalFileContents = fs.readFileSync(filePath).toString();
  let newFileContents = originalFileContents;
  tsPathAlias.forEach(({ matchString, replaceString }) => {
    const relativePath = path.posix.relative(path.dirname(filePath), replaceString) || './';
    newFileContents = newFileContents.replace(new RegExp(matchString, 'gm'), relativePath);
  });
  if (newFileContents !== originalFileContents) {
    fs.writeFileSync(filePath, newFileContents);
  }
});
