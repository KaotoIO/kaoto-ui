import { fetchCatalogSteps } from '../api';
import { IStepProps } from '../types';
import './Catalog.css';
import {
  AlertVariant,
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  DrawerActions,
  DrawerCloseButton,
  DrawerColorVariant,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Gallery,
  Grid,
  GridItem,
  InputGroup,
  Label,
  TextInput,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useEffect, useState } from 'react';

export interface ICatalog {
  isCatalogExpanded: boolean;
  onClosePanelClick: (e: any) => void;
  queryParams?: {
    // e.g. 'KameletBinding'
    integrationType?: string;
    // e.g. 'Kamelet'
    kind?: string;
    // e.g. 'START', 'END', 'MIDDLE'
    type?: string;
  };
  steps?: IStepProps[];
}

// Shorten a string to less than maxLen characters without truncating words.
function shorten(str: string, maxLen: number, separator = ' ') {
  if (str.length <= maxLen) return str;
  return str.substr(0, str.lastIndexOf(separator, maxLen)) + '..';
}

const Catalog = (props: ICatalog) => {
  // If the catalog data won't be changing, consider removing this state
  const [catalogData, setCatalogData] = useState<IStepProps[]>(props.steps ?? []);
  const [isSelected, setIsSelected] = useState('START');
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
              description:
                'There was a problem fetching the catalog steps. Please try again later.',
            });
        });
    }
  }, []);

  const changeSearch = (e: any) => {
    setQuery(e);
  };

  const handleItemClick = (_newIsSelected: any, event: any) => {
    setIsSelected(event.currentTarget.id);
  };

  function search(items: any[]) {
    /**
     * Returns a list of items that meet
     * meet the condition of the `type`
     * matching the `isSelected` value,
     * followed by the `name` containing
     * the characters in the search query
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
    <DrawerPanelContent
      minSize={'525px'}
      colorVariant={DrawerColorVariant.light200}
      data-testid={'stepCatalog'}
    >
      <DrawerHead>
        <h3 className={'pf-c-title pf-m-2xl'} tabIndex={props.isCatalogExpanded ? 0 : -1}>
          Step Catalog
        </h3>
        <DrawerActions>
          <DrawerCloseButton onClick={props.onClosePanelClick} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <Toolbar id={'toolbar'} style={{ background: 'transparent' }}>
          <ToolbarContent>
            {
              <>
                <ToolbarItem>
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
                <ToolbarItem variant={'separator'} />
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
        <Gallery hasGutter={true} style={{ maxHeight: '650px', overflow: 'auto' }}>
          {catalogData &&
            search(catalogData).map((step, idx) => {
              return (
                <Card
                  key={idx}
                  className={'catalog--step'}
                  isCompact={true}
                  isHoverable={true}
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
                        <img src={step.icon} className={'catalog--stepImage'} alt={'Step Image'} />
                      </Bullseye>
                    </GridItem>
                    <GridItem span={7}>
                      <CardTitle>
                        <span>{step.name}</span>
                      </CardTitle>
                      <CardBody>{shorten(step.description, 60)}</CardBody>
                    </GridItem>
                    <GridItem span={3}>
                      <Label color={'blue'} className={'catalog--stepLabel'}>
                        SOURCE
                      </Label>
                    </GridItem>
                  </Grid>
                </Card>
              );
            })}
        </Gallery>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export { Catalog };
