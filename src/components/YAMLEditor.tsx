import * as React from 'react';
import Editor from '@monaco-editor/react';
import { useRef } from 'react';

const YAMLEditor = ( initial ) => {
  const editorRef = useRef(null);
  const [status, setStatus] = React.useState('idle');
  const [jsonData, setJsonData] = React.useState({json: ''});
  const [YAML, setYAML] = React.useState(initial.yaml || '');

  /**
   * On detected changes to YAML state, issue POST to external endpoint
   * Returns JSON to be displayed in the visualizer
   * TODO: Move to wrapper/provider
   */
  React.useEffect(() => {
    console.log('YAML has changed. Issuing an API request..');

    setStatus('loading');
    if(YAML == null) return;
    fetch('http://localhost:8080/viewdefinition?' + new URLSearchParams({
      yaml: YAML
    }), {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'text/yaml'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    })
     .then((res) => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res;
    })
    .then((res) => res.json())
    .then((data) => {
      setStatus('success');
      setJsonData(data);
      console.log('Response to be used in visualizer: ' + JSON.stringify(jsonData.json));
    })
    .catch((err) => {
      console.log('Something went wrong..', err);
      setStatus('error');
    });
  }, [jsonData, YAML]);

  function handleEditorChange(value, event) {
    //console.log("Current model value:", value);
    setYAML(value);
  }

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  function handleEditorValidation(markers) {
    // Model Markers
    markers.forEach(marker => console.log('onValidate:', marker.message));
  }

  return (
    <>
      <p>Status: {status}</p>
      <Editor
        height="90vh"
        defaultLanguage="YAML"
        defaultValue={initial.yaml}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        onValidate={handleEditorValidation}
      />
    </>
  );
};

export { YAMLEditor };
