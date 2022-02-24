import request from '../api/request';
import { IStepProps } from '../types';
import {
  Bullseye,
  Button,
  Grid,
  GridItem,
  InputGroup,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { useEffect, useState } from 'react';

export interface IMiniCatalog {
  handleSelectStep?: (selectedStep: any) => void;
  steps?: IStepProps[];
}

export const MiniCatalog = (props: IMiniCatalog) => {
  const [catalogData, setCatalogData] = useState<IStepProps[]>(props.steps ?? []);
  const [query, setQuery] = useState(``);

  /**
   * Sort & fetch all Steps for the Catalog
   */
  useEffect(() => {
    if (!props.steps) {
      const getCatalogData = async () => {
        try {
          const resp = await request.get({
            endpoint: '/step',
          });

          const data = await resp.json();
          data.sort((a: IStepProps, b: IStepProps) => a.name.localeCompare(b.name));
          setCatalogData(data);
        } catch (err) {
          console.error(err);
        }
      };

      getCatalogData().catch((e) => {
        console.error(e);
      });
    }
  }, []);

  const changeSearch = (e: any) => {
    setQuery(e);
  };

  function search(items: any[]) {
    return items.filter((item) => item.name.toLowerCase().indexOf(query.toLowerCase()) > -1);
  }

  function handleSelectStep(selectedStep: any) {
    if (props.handleSelectStep) {
      props.handleSelectStep(selectedStep);
    }
  }

  return (
    <section data-testid={'miniCatalog'}>
      <Toolbar id={'toolbar'} style={{ background: 'transparent' }}>
        <ToolbarContent>
          {
            <ToolbarItem className={'miniCatalog--search'}>
              <InputGroup>
                <TextInput
                  name={'stepSearch'}
                  id={'stepSearch'}
                  type={'search'}
                  placeholder={'search for a step...'}
                  aria-label={'search for a step'}
                  value={query}
                  onChange={changeSearch}
                />
              </InputGroup>
            </ToolbarItem>
          }
        </ToolbarContent>
      </Toolbar>
      {catalogData &&
        search(catalogData)
          .slice(0, 5)
          .map((step, idx) => {
            return (
              <Button
                key={idx}
                variant={'tertiary'}
                onClick={() => {
                  handleSelectStep(step);
                }}
                className={'miniCatalog--stepItem'}
              >
                <Grid md={6} className={'miniCatalog--stepItem__grid'}>
                  <GridItem span={3}>
                    <Bullseye>
                      <img
                        src={step.icon}
                        className={'miniCatalog--stepImage'}
                        alt={'Step Image'}
                      />
                    </Bullseye>
                  </GridItem>
                  <GridItem span={9}>{step.name}</GridItem>
                </Grid>
              </Button>
            );
          })}
    </section>
  );
};
