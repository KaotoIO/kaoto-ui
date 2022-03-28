import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import { useState } from 'react';

export interface ISettingsModal {
  handleSaveSettings: (newState: any) => void;
  settings: {
    dsl?: string;
  };
}

export const SettingsModal = ({ settings, handleSaveSettings }: ISettingsModal) => {
  const [dsl, setDsl] = useState(settings.dsl ?? '');
  const [dslMenuIsExpanded, setDslMenuIsExpanded] = useState(false);

  return (
    <div className={'settings-modal'}>
      <Select
        variant={SelectVariant.single}
        aria-label="Select Input"
        isOpen={dslMenuIsExpanded}
        onToggle={(isExpanded) => {
          setDslMenuIsExpanded(isExpanded);
        }}
        onSelect={(_event, selected) => {
          // console.log('selected event ', _event);
          // console.log('selected ', selected);
          // @ts-ignore
          setDsl(selected);
          setDslMenuIsExpanded(false);
          handleSaveSettings({ dsl: selected });
        }}
        selections={dsl}
      >
        <SelectOption key={0} value={'Select a Type'} isPlaceholder={true} />
        <SelectOption key={1} value={'Kamelet'} />
        <SelectOption key={2} value={'KameletBinding'} />
        <SelectOption key={3} value={'Camel Route'} />
      </Select>
    </div>
  );
};
