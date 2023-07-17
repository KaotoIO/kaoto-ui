const React = require('react');

exports.CodeEditor = CodeEditor;
exports.CodeEditorControl = CodeEditorControl;
exports.Language = {
  json: 'json',
};

function CodeEditor(props) {
  return React.createElement('textarea', {
    defaultValue: props.code,
  });
}

function CodeEditorControl() {
  return React.createElement('button');
}
