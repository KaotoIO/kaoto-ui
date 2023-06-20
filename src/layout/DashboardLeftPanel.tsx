import { Catalog, SourceCodeEditor } from '../components';
import { IDataTestID } from '../types';
import { useSettingsStore } from '@kaoto/store';
import { DrawerContentBody } from '@patternfly/react-core';
import { FunctionComponent } from 'react';

interface ILeftPanel extends IDataTestID {
  mode: 'code' | 'catalog';
  onCatalogClose: () => void;
}

export const LeftPanel: FunctionComponent<ILeftPanel> = (props) => {
  const { settings } = useSettingsStore((state) => state);

  return props.mode === 'code' ? (
    <DrawerContentBody hasPadding={false}>
      <SourceCodeEditor mode={settings.editorMode} schemaUri={settings.dsl.validationSchema} />
    </DrawerContentBody>
  ) : (
    <DrawerContentBody style={{ padding: '10px' }}>
      <Catalog handleClose={props.onCatalogClose} />
    </DrawerContentBody>
  );
};
