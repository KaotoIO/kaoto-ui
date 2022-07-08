import { fetchCatalogSteps } from '../api';
import { IStepProps, IStepQueryParams } from '../types';
import {
  AlertVariant,
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
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useEffect, useState } from 'react';

export interface IMiniCatalog {
  handleSelectStep?: (selectedStep: any) => void;
  queryParams?: IStepQueryParams;
  steps?: IStepProps[];
}

export const MiniCatalog = (props: IMiniCatalog) => {
  const [catalogData, setCatalogData] = useState<IStepProps[]>(props.steps ?? []);
  const [query, setQuery] = useState(``);

  const { addAlert } = useAlert() || {};

  /**
   * Sort & fetch all Steps for the Catalog
   */
  useEffect(() => {
    if (!props.steps) {
      fetchCatalogSteps(props.queryParams)
        .then((value) => {
          if (value) {
            value.sort((a: IStepProps, b: IStepProps) => a.name.localeCompare(b.name));
            setCatalogData(value);
          }
        })
        .catch((e) => {
          console.error(e);
          addAlert &&
            addAlert({
              title: 'Something went wrong',
              variant: AlertVariant.danger,
              description: 'There was a problem updating the integration. Please try again later.',
            });
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
    <section data-testid={'miniCatalog'} className={'nodrag'}>
      <Toolbar id={'toolbar'} style={{ background: 'transparent' }}>
        <ToolbarContent>
          {
            <ToolbarItem className={'miniCatalog__search'}>
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
                className={'miniCatalog__stepItem'}
              >
                <Grid md={6} className={'miniCatalog__stepItem__grid'}>
                  <GridItem span={3}>
                    <Bullseye>
                      <img
                        src={step.icon}
                        className={'miniCatalog__stepImage'}
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
