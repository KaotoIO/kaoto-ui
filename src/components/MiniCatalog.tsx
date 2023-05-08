import { fetchCatalogSteps } from '@kaoto/api';
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
  disableBranchesTab?: boolean;
  disableBranchesTabMsg?: string;
  disableStepsTab?: boolean;
  disableStepsTabMsg?: string;
  handleSelectStep?: (selectedStep: any) => void;
  queryParams?: IStepQueryParams;
  step?: IStepProps;
  steps?: IStepProps[];
}

export const MiniCatalog = (props: IMiniCatalog) => {
  const [catalogData, setCatalogData] = useState<IStepProps[]>([]);
  const [query, setQuery] = useState(``);
  const [activeTabKey, setActiveTabKey] = useState(props.disableStepsTab ? 1 : 0);
  const dsl = useSettingsStore((state) => state.settings.dsl.name);
  const typesAllowedArray = props.queryParams?.type?.split(',');
  const [isSelected, setIsSelected] = useState(typesAllowedArray ? typesAllowedArray[0] : 'MIDDLE');
  const branchTooltipRef = createRef();
  const stepTooltipRef = createRef();

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
      <Tabs activeKey={activeTabKey} onSelect={handleTabClick} isBox={false}>
        <Tab
          eventKey={0}
          title={<TabTitleText>Steps</TabTitleText>}
          isAriaDisabled={props.disableStepsTab}
          ref={stepTooltipRef}
        >
          {props.disableStepsTab && props.disableStepsTabMsg && (
            <Tooltip
              content={props.disableStepsTabMsg}
              reference={stepTooltipRef}
              position={'top'}
            />
          )}
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
                        data-testid={`miniCatalog__step-start`}
                        aria-label={'sources button'}
                        buttonId={'START'}
                        isDisabled={!typesAllowedArray?.includes('START')}
                        isSelected={isSelected === 'START'}
                        onChange={handleItemClick}
                      />
                      <ToggleGroupItem
                        icon={'actions'}
                        data-testid={`miniCatalog__step-actions`}
                        aria-label={'actions button'}
                        buttonId={'MIDDLE'}
                        isDisabled={!typesAllowedArray?.includes('MIDDLE')}
                        isSelected={isSelected === 'MIDDLE'}
                        onChange={handleItemClick}
                      />
                      <ToggleGroupItem
                        text={'end'}
                        data-testid={`miniCatalog__step-end`}
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
              search(catalogData).map((step) => {
                return (
                  <Button
                    key={step.id}
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
                            loading="lazy"
                            decoding="async"
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
          isAriaDisabled={props.disableBranchesTab}
          ref={branchTooltipRef}
          data-testid="miniCatalog__branches"
        >
          {props.disableBranchesTab && props.disableBranchesTabMsg && (
            <Tooltip
              content={props.disableBranchesTabMsg}
              reference={branchTooltipRef}
              position="top"
            />
          )}
          <div style={{ padding: '50px' }}>{props.children}</div>
        </Tab>
      </Tabs>
    </section>
  );
};
