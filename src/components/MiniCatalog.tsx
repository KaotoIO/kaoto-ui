import { fetchCatalogSteps } from '@kaoto/api';
import { StepsService } from '@kaoto/services';
import { useSettingsStore } from '@kaoto/store';
import { IStepProps, IStepQueryParams } from '@kaoto/types';
import { truncateString } from '@kaoto/utils';
import {
  AlertVariant,
  Bullseye,
  Button,
  Gallery,
  Grid,
  GridItem,
  InputGroup,
  SearchInput,
  Tabs,
  Tab,
  TabTitleText,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { createRef, ReactNode, useEffect, useRef, useState } from 'react';

export interface IMiniCatalog {
  children?: ReactNode;
  handleSelectStep?: (selectedStep: any) => void;
  queryParams?: IStepQueryParams;
  step?: IStepProps;
  steps?: IStepProps[];
}

export const MiniCatalog = (props: IMiniCatalog) => {
  const [catalogData, setCatalogData] = useState<IStepProps[]>(props.steps ?? []);
  const [query, setQuery] = useState(``);
  const [activeTabKey, setActiveTabKey] = useState();
  const dsl = useSettingsStore((state) => state.settings.dsl.name);
  const typesAllowedArray = props.queryParams?.type?.split(',');
  const [isSelected, setIsSelected] = useState(typesAllowedArray ? typesAllowedArray[0] : 'MIDDLE');
  const tooltipRef = createRef();

  const { addAlert } = useAlert() || {};
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleTabClick = (_e: any, tabIndex: any) => {
    setActiveTabKey(tabIndex);
  };

  /**
   * Sort & fetch all Steps for the Catalog
   */
  useEffect(() => {
    if (!props.steps) {
      fetchCatalogSteps({
        ...props.queryParams,
        dsl,
      })
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
  }, [dsl]);

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
      <Tabs activeKey={activeTabKey} onSelect={handleTabClick} isBox={false}>
        <Tab eventKey={0} title={<TabTitleText>Steps</TabTitleText>}>
          <Toolbar id={'toolbar'} style={{ background: 'transparent' }}>
            <ToolbarContent>
              {
                <>
                  <ToolbarItem>
                    <InputGroup>
                      <SearchInput
                        name={'stepSearch'}
                        id={'stepSearch'}
                        type={'search'}
                        placeholder={'search for a step...'}
                        data-testid={'miniCatalog__search--input'}
                        aria-label={'search for a step'}
                        value={query}
                        onChange={(_e, s) => changeSearch(s)}
                        ref={searchInputRef}
                      />
                    </InputGroup>
                  </ToolbarItem>
                  <ToolbarItem>
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
          <Gallery hasGutter={false} className={'miniCatalog__gallery'}>
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
        </Tab>
        <Tab
          eventKey={1}
          title={<TabTitleText>Branches</TabTitleText>}
          isAriaDisabled={!StepsService.supportsBranching(props.step)}
          ref={tooltipRef}
        >
          {!StepsService.supportsBranching(props.step) && (
            <Tooltip
              content="This step does not support branching."
              reference={tooltipRef}
              position="right"
            />
          )}
          <div style={{ padding: '50px' }}>{props.children}</div>
        </Tab>
      </Tabs>
    </section>
  );
};
