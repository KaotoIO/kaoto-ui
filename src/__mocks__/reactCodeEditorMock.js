const React = require('react');
exports.CodeEditor = CodeEditor;
exports.Language = {
  json: 'json',
};
function CodeEditor(props) {
  return /*#__PURE__*/ React.createElement('textarea', {
    defaultValue: props.code,
  });
}
