import * as React from 'react';
import Editor from '@monaco-editor/react';
import { useRef } from 'react';

const YAMLEditor = ({ data }) => {
  React.useEffect(() => {
    console.log('Hello!');
  }, []);

  const editorRef = useRef(null);
  //const [YAML, setYAML] = React.useState('// edit your kamelet here');
  //const [YAML, setYAML] = React.useState(JSON.stringify(response));
  const [YAML, setYAML] = React.useState(data);

  function handleEditorChange(value, event) {
    // here is the current value
    console.log("here is the current model value:", value);
    setYAML(value);
  }

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  function handleEditorValidation(markers) {
    // model markers
    markers.forEach(marker => console.log('onValidate:', marker.message));
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
        defaultValue={YAML}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        onValidate={handleEditorValidation}
      />
    </>
  );
};

export { YAMLEditor };
