import { fetchCatalogSteps } from '../api';
import { truncateString } from '../utils';
import { IStepProps, IStepQueryParams } from '@kaoto';
import {
  AlertVariant,
  Bullseye,
  Button,
  Gallery,
  Grid,
  GridItem,
  InputGroup,
  SearchInput,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useEffect, useRef, useState } from 'react';

export interface IMiniCatalog {
  handleSelectStep?: (selectedStep: any) => void;
  queryParams?: IStepQueryParams;
  steps?: IStepProps[];
}

export const MiniCatalog = (props: IMiniCatalog) => {
  const [catalogData, setCatalogData] = useState<IStepProps[]>(props.steps ?? []);
  const [query, setQuery] = useState(``);
  const typesAllowedArray = props.queryParams?.type?.split(',');
  const [isSelected, setIsSelected] = useState(typesAllowedArray ? typesAllowedArray[0] : 'MIDDLE');

  const { addAlert } = useAlert() || {};
  const searchInputRef = useRef<HTMLInputElement>(null);
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
    searchInputRef.current?.focus();
  }, []);

  const changeSearch = (e: string) => {
    setQuery(e);
  };

  const handleItemClick = (_newIsSelected: any, event: any) => {
    setIsSelected(event.currentTarget.id);
  };

  function search(items: IStepProps[]) {
    return items.filter((item) => {
      if (isSelected === item.type) {
        return item.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
      } else {
        return false;
      }
    });
  }

  function handleSelectStep(selectedStep: IStepProps) {
    if (props.handleSelectStep) {
      props.handleSelectStep(selectedStep);
    }
  }

  return (
    <section data-testid={'miniCatalog'} className={'nodrag'}>
      <Toolbar id={'toolbar'} style={{ background: 'transparent' }}>
        <ToolbarContent>
          {
            <>
              <ToolbarItem className={'miniCatalog__search'} style={{ width: '100%' }}>
                <InputGroup>
                  <SearchInput
                    name={'stepSearch'}
                    id={'stepSearch'}
                    type={'search'}
                    placeholder={'search for a step...'}
                    data-testid={'miniCatalog__search--input'}
                    aria-label={'search for a step'}
                    value={query}
                    onChange={changeSearch}
                    ref={searchInputRef}
                  />
                </InputGroup>
              </ToolbarItem>
              <ToolbarItem style={{ width: '100%' }}>
                <ToggleGroup aria-label={'Icon variant toggle group'} style={{ width: '100%' }}>
                  <ToggleGroupItem
                    text={'start'}
                    aria-label={'sources button'}
                    buttonId={'START'}
                    isDisabled={!typesAllowedArray?.includes('START')}
                    isSelected={isSelected === 'START'}
                    onChange={handleItemClick}
                  />
                  <ToggleGroupItem
                    icon={'actions'}
                    aria-label={'actions button'}
                    buttonId={'MIDDLE'}
                    isDisabled={!typesAllowedArray?.includes('MIDDLE')}
                    isSelected={isSelected === 'MIDDLE'}
                    onChange={handleItemClick}
                  />
                  <ToggleGroupItem
                    text={'end'}
                    aria-label={'sinks button'}
                    buttonId={'END'}
                    isDisabled={!typesAllowedArray?.includes('END')}
                    isSelected={isSelected === 'END'}
                    onChange={handleItemClick}
                  />
                </ToggleGroup>
              </ToolbarItem>
            </>
          }
        </ToolbarContent>
      </Toolbar>
      <Gallery hasGutter={false} style={{ maxHeight: '200px', overflow: 'scroll' }}>
        {catalogData &&
          search(catalogData).map((step, idx) => {
            return (
              <Button
                key={idx}
                variant={'tertiary'}
                onClick={() => {
                  handleSelectStep(step);
                }}
                className={'miniCatalog__stepItem'}
                data-testid={`miniCatalog__stepItem--${step.name}`}
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
                  <GridItem span={9}>{truncateString(step.name, 25)}</GridItem>
                </Grid>
              </Button>
            );
          })}
      </Gallery>
    </section>
  );
};
