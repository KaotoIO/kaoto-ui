import * as React from 'react';
import Editor from '@monaco-editor/react';
import { useRef } from 'react';

const YAMLEditor = ( initial ) => {
  const editorRef = useRef(null);
  const [YAML, setYAML] = React.useState(initial.yaml || '');

  /**
   * Hook to send YAML to external endpoint
   * Returns JSON to be displayed in the visualizer
   */
  function useFetchData() {
    const [status, setStatus] = React.useState('idle');
    const [jsonData, setJsonData] = React.useState({json: ''});

    React.useEffect(() => {
      setStatus('loading');
      fetch('http://localhost:8080/viewdefinition?' + new URLSearchParams({
        yaml: initial.yaml
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
      })
      .catch(() => {
        setStatus('error');
      });
    }, []);
    return {
      jsonData,
      status,
    };
  }

  function handleEditorChange(value, event) {
    console.log("Current model value:", value);
    setYAML(value);
  }

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  function handleEditorValidation(markers) {
    // Model Markers
    markers.forEach(marker => console.log('onValidate:', marker.message));
  }

  function showValue() {
    //alert(editorRef.current!.getValue());
  }

  const { jsonData } = useFetchData();

  console.log('Response to be used in visualizer: ' + JSON.stringify(jsonData.json));

  return (
    <>
      <button onClick={showValue}>Show value</button>
      <Editor
        height="90vh"
        defaultLanguage="JSON"
        defaultValue={YAML || initial.yaml}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        onValidate={handleEditorValidation}
      />
    </>
  );
};

export { YAMLEditor };
