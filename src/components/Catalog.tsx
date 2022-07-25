import { fetchCatalogSteps, useDeploymentStore, useSettingsStore } from '../api';
import { IStepProps } from '../types';
import { truncateString, usePrevious } from '../utils';
import './Catalog.css';
import {
  AlertVariant,
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  Gallery,
  Grid,
  GridItem,
  Hint,
  HintBody,
  InputGroup,
  Label,
  SearchInput,
  TextContent,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useEffect, useRef, useState } from 'react';

// Shorten a string to less than maxLen characters without truncating words.
function shorten(str: string, maxLen: number, separator = ' ') {
  if (!str) return;
  if (str.length <= maxLen) return str;
  return str.substr(0, str.lastIndexOf(separator, maxLen)) + '..';
}

export const Catalog = () => {
  // If the catalog data won't be changing, consider removing this state
  // const [catalogData, setCatalogData] = useState<IStepProps[]>([]);
  const [catalogData, setCatalogData] = useState<IStepProps[]>([]);
  const [isSelected, setIsSelected] = useState('START');
  const [query, setQuery] = useState(``);
  const { settings } = useSettingsStore();
  const previousDSL = usePrevious(settings.dsl);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { deployment } = useDeploymentStore();

  const { addAlert } = useAlert() || {};

  /**
   * Sort & fetch all Steps for the Catalog
   * Checks for changes to the settings for DSL
   */
  useEffect(() => {
    if (previousDSL === settings.dsl) return;
    fetchCatalogSteps({
      dsl: settings.dsl,
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
            description: 'There was a problem fetching the catalog steps. Please try again later.',
          });
      });
    searchInputRef.current?.focus();
  }, [settings.dsl]);

  useEffect(() => {
    // verify that we actually need this, as the API
    // isn't returning deployed kamelets in time anyway
    fetchCatalogSteps(
      {
        dsl: settings.dsl,
      },
      'no-cache'
    )
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
            description: 'There was a problem fetching the catalog steps. Please try again later.',
          });
      });
  }, [deployment]);

  const changeSearch = (e: any) => {
    setQuery(e);
  };

  const handleItemClick = (_newIsSelected: any, event: any) => {
    setIsSelected(event.currentTarget.id);
  };

  function search(items: any[]) {
    /**
     * Returns a list of items that meet the condition
     * of the `type` matching the `isSelected` value,
     * followed by the `name` containing the characters
     * in the search query
     */
    return items.filter((item) => {
      if (isSelected === item.type) {
        return item.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
      } else {
        return false;
      }
    });
  }

  return (
    <div data-testid={'stepCatalog'}>
      <div style={{ padding: '10px', marginTop: '0.7em' }}>
        <TextContent>
          <Hint className={'catalog__hint'}>
            <HintBody>
              <InfoCircleIcon />
              &nbsp;&nbsp;You can drag a step onto a circle in the visualization
            </HintBody>
          </Hint>
        </TextContent>
      </div>
      <Toolbar
        id={'toolbar'}
        style={{
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '0',
        }}
      >
        <ToolbarContent style={{ padding: '5px' }}>
          {
            <>
              <ToolbarItem style={{ padding: '0', marginRight: '0' }}>
                <InputGroup>
                  <SearchInput
                    name={'stepSearch'}
                    id={'stepSearch'}
                    type={'search'}
                    placeholder={'search for a step...'}
                    aria-label={'search for a step'}
                    value={query}
                    onChange={changeSearch}
                    ref={searchInputRef}
                  />
                </InputGroup>
              </ToolbarItem>
              <ToolbarItem>
                <ToggleGroup aria-label={'Icon variant toggle group'}>
                  <ToggleGroupItem
                    text={'start'}
                    aria-label={'sources button'}
                    buttonId={'START'}
                    isSelected={isSelected === 'START'}
                    onChange={handleItemClick}
                  />
                  <ToggleGroupItem
                    icon={'actions'}
                    aria-label={'actions button'}
                    buttonId={'MIDDLE'}
                    isSelected={isSelected === 'MIDDLE'}
                    onChange={handleItemClick}
                  />
                  <ToggleGroupItem
                    text={'end'}
                    aria-label={'sinks button'}
                    buttonId={'END'}
                    isSelected={isSelected === 'END'}
                    onChange={handleItemClick}
                  />
                </ToggleGroup>
              </ToolbarItem>
            </>
          }
        </ToolbarContent>
      </Toolbar>
      <Gallery
        hasGutter={true}
        style={{ maxHeight: 'calc(100vh - 375px)', overflow: 'auto', padding: '0 10px' }}
      >
        {catalogData &&
          search(catalogData).map((step, idx) => {
            return (
              <Card
                key={idx}
                className={'catalog__step'}
                isCompact={true}
                isSelectable={true}
                draggable={'true'}
                onDragStart={(e: any) => {
                  e.dataTransfer.setData('application/reactflow', 'step');
                  e.dataTransfer.setData('text/plain', JSON.stringify(step));

                  e.dataTransfer.effectAllowed = 'move';
                }}
              >
                <Grid md={6}>
                  <GridItem span={2}>
                    <Bullseye>
                      <img
                        src={step.icon}
                        className={'catalog__stepImage'}
                        alt={'Step Image'}
                        data-testid={'catalog__stepImage'}
                      />
                    </Bullseye>
                  </GridItem>
                  <GridItem span={7}>
                    <CardTitle>
                      <span>{step.name}</span>
                    </CardTitle>
                    <CardBody>{shorten(step?.description, 60)}</CardBody>
                  </GridItem>
                  <GridItem span={3}>
                    <Label
                      color={'blue'}
                      data-testid={'catalog__stepLabel'}
                      style={{ marginTop: '0.8em' }}
                    >
                      {truncateString(step.kind, 8)}
                    </Label>
                  </GridItem>
                </Grid>
              </Card>
            );
          })}
      </Gallery>
    </div>
  );
};
