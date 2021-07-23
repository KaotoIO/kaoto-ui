import * as React from 'react';
import Editor from '@monaco-editor/react';
import { useRef } from 'react';

const YAMLEditor = ( props ) => {
  React.useEffect(() => {
    console.log('Hello!');
  }, []);

  const editorRef = useRef(null);
  //const [YAML, setYAML] = React.useState('// edit your kamelet here');
  //const [YAML, setYAML] = React.useState(JSON.stringify(response));
  //const [YAML, setYAML] = React.useState(old);

  function handleEditorChange(value, event) {
    // here is the current value
    console.log("here is the current model value:", value);
    //setYAML(value);
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

  // Example hook to retrieve data from an external endpoint
  function useFetchData() {
    const [status, setStatus] = React.useState('idle');
    const [data, setData] = React.useState({json: ''});

    React.useEffect(() => {
      setStatus('loading');
      fetch('http://localhost:8080/viewdefinition?' + new URLSearchParams({
        yaml: props.yaml
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
        setData(data);
      })
      .catch(() => {
        setStatus('error');
      });
    }, []);
    return {
      status,
      data,
    };
  }

  const { data } = useFetchData();

  const { json } = data;

  return (
    <>
      <button onClick={showValue}>Show value</button>
      <Editor
        height="90vh"
        defaultLanguage="JSON"
        defaultValue={json}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        onValidate={handleEditorValidation}
      />
    </>
  );
};

export { YAMLEditor };
