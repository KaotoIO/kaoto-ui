import * as React from 'react';
import Editor from '@monaco-editor/react';
import { useRef } from 'react';

const YAMLEditor = () => {
  React.useEffect(() => {
    // eslint-disable-next-line no-undef
    console.log('Hello!');
  }, []);

  const editorRef = useRef(null);

  function handleEditorChange(value, event) {
    // here is the current value
    console.log("here is the current model value:", value);
  }

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  function handleEditorValidation(markers) {
    // model markers
    // markers.forEach(marker => console.log('onValidate:', marker.message));
  }

  function showValue() {
    //alert(editorRef.current!.getValue());
  }

  return (
    <>
      <button onClick={showValue}>Show value</button>
      <Editor
        height="90vh"
        defaultLanguage="YAML"
        defaultValue="// edit your kamelet here"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        onValidate={handleEditorValidation}
      />
    </>
  );
};

export { YAMLEditor };
