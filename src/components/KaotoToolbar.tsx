import {
  InputGroup,
  PageSection,
  PageSectionVariants,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { useState } from 'react';

export const KaotoToolbar = () => {
  const [query, setQuery] = useState(``);

  const changeSearch = (e: any) => {
    setQuery(e);
  };

  return (
    <PageSection variant={PageSectionVariants.darker} data-testid={'KaotoToolbar'}>
      <Toolbar id={'toolbar'} style={{ background: 'transparent' }}>
        <ToolbarContent>
          <ToolbarItem className={'KaotoToolbar--search'}>
            <InputGroup>
              <TextInput
                name={'toolbarSearch'}
                id={'toolbarSearch'}
                type={'search'}
                placeholder={'search for something...'}
                aria-label={'search for something'}
                value={query}
                onChange={changeSearch}
              />
            </InputGroup>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    </PageSection>
  );
};
