import {
  PageSection,
  PageSectionVariants,
  Select,
  SelectOption,
  SelectVariant,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { useState } from 'react';

export const KaotoToolbar = () => {
  const [dslMenuIsExpanded, setDslMenuIsExpanded] = useState(false);
  const [dsl, setDsl] = useState('');

  return (
    <PageSection
      variant={PageSectionVariants.darker}
      className={'kaotoToolbar'}
      data-testid={'KaotoToolbar'}
      padding={{ default: 'noPadding' }}
    >
      <Toolbar id={'toolbar'} style={{ background: 'transparent' }}>
        <ToolbarContent>
          <ToolbarItem /*alignment={{ default: 'alignRight' }}*/>
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
              }}
              selections={dsl}
            >
              <SelectOption key={0} value={'Select a Type'} isPlaceholder={true} />
              <SelectOption key={1} value={'Kamelet'} />
              <SelectOption key={2} value={'KameletBinding'} />
              <SelectOption key={3} value={'Camel Route'} />
            </Select>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    </PageSection>
  );
};
