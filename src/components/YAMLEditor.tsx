import * as React from 'react';
import Editor from '@monaco-editor/react';
import { useRef } from "react";

const YAMLEditor = () => {
  React.useEffect(() => {
    console.log('Hello!');
  }, []);

  const editorRef = useRef(null);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  function showValue() {
    // @ts-ignore
    alert(editorRef.current!.getValue());
  }

  return (
    <>
      <button onClick={showValue}>Show value</button>
    <Editor
      height="90vh"
      defaultLanguage="YAML"
      defaultValue="// edit your kamelet here"
      onMount={handleEditorDidMount}
    />
      </>
  );
}

export { YAMLEditor };
