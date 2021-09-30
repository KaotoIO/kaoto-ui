import Editor from '@monaco-editor/react';
import { useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface IYAMLEditor {
  handleChanges: (newYaml: string) => void;
  yamlData?: string;
}

const YAMLEditor = ( {yamlData, handleChanges }: IYAMLEditor ) => {
  const editorRef = useRef(null);

  function handleEditorChange(value, event) {
    debounced(value);
  }

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  function handleEditorValidation(markers) {
    // Model Markers
    markers.forEach(marker => console.log('onValidate: ', marker.message));
  }

  const debounced = useDebouncedCallback(
    (value: string) => {
      handleChanges(value);
    },
    800
  );

  return (
    <>
      <Editor
        height="90vh"
        defaultLanguage="yaml"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        onValidate={handleEditorValidation}
        theme={'vs-dark'}
        value={yamlData}
      />
    </>
  );
};

export { YAMLEditor };
