import Editor from '@monaco-editor/react';
import { useRef } from 'react';

interface IYAMLEditor {
  handleChanges: (newYaml: string) => void;
  yamlData?: string;
}

const YAMLEditor = ( {yamlData, handleChanges }: IYAMLEditor ) => {
  const editorRef = useRef(null);

  function handleEditorChange(value, event) {
    handleChanges(value);
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
      <Editor
        height="90vh"
        defaultLanguage="yaml"
        defaultValue={yamlData}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        onValidate={handleEditorValidation}
        theme={'vs-dark'}
      />
    </>
  );
};

export { YAMLEditor };
