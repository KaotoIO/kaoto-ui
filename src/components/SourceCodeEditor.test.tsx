import { SourceCodeEditor } from './SourceCodeEditor';
import { RequestService } from '@kaoto/api';
import { useSettingsStore } from '@kaoto/store';
import { Language } from '@patternfly/react-code-editor';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

/** This is being mocked in __mocks__/monaco-yaml.js*/
import { setDiagnosticsOptions } from 'monaco-yaml';
import { act } from 'react-dom/test-utils';

describe('SourceCodeEditor.tsx', () => {
  beforeEach(() => {
    RequestService.setApiURL('http://localhost:8081');
  });

  afterEach(() => {
    RequestService.setApiURL('');
  });

  it('component renders correctly', () => {
    render(<SourceCodeEditor language={Language.yaml} />);
    const emptyStateBrowseBtn = screen.getByRole('textbox');
    expect(emptyStateBrowseBtn).toBeInTheDocument();
  });

  it('should update the schemaUri upon loading the component', async () => {
    await act(async () => {
      render(<SourceCodeEditor language={Language.yaml} />);
    });

    expect(setDiagnosticsOptions).toHaveBeenCalledTimes(1);
  });

  it('should update the schemaUri upon switching DSLs', async () => {
    await act(async () => {
      render(<SourceCodeEditor language={Language.yaml} />);
    });

    act(() => {
      useSettingsStore.getState().setSettings({
        ...useSettingsStore.getState().settings,
        dsl: {
          ...useSettingsStore.getState().settings.dsl,
          validationSchema: '/test.json',
        },
      });
    });

    expect(setDiagnosticsOptions).toHaveBeenCalledTimes(2);
    expect(setDiagnosticsOptions).toHaveBeenCalledWith({
      enableSchemaRequest: true,
      hover: false,
      completion: true,
      validate: true,
      format: true,
      schemas: [
        {
          uri: 'http://localhost:8081/test.json',
          fileMatch: ['*'],
        },
      ],
    });
  });
});
