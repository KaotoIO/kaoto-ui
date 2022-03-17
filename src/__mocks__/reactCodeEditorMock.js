const codeEditorMock = jest.genMockFromModule('@patternfly/react-code-editor');

module.exports = codeEditorMock;

// const { React } = require('react');

// exports.CodeEditor = CodeEditor;

exports.Language = {
  yaml: 'yaml',
};

// function CodeEditor(props) {
//   return /*#__PURE__*/ React.createElement('textarea', {
//     defaultValue: props.code,
//   });
// }
