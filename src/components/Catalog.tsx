import { fetchCatalogSteps } from '../api';
import { IStepProps } from '../types';
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
  HelperText,
  HelperTextItem,
  InputGroup,
  Label,
  PageSection,
  SearchInput,
  TextContent,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { InfoIcon } from '@patternfly/react-icons';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useEffect, useState } from 'react';

export interface ICatalog {
  isCatalogExpanded?: boolean;
  onClosePanelClick: (e: any) => void;
  queryParams?: {
    // e.g. 'KameletBinding'
    dsl?: string;
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

export const Catalog = (props: ICatalog) => {
  // If the catalog data won't be changing, consider removing this state
  const [catalogData, setCatalogData] = useState<IStepProps[]>(props.steps ?? []);
  const [isSelected, setIsSelected] = useState('START');
  const [query, setQuery] = useState(``);

  const { addAlert } = useAlert() || {};

  const fetchSteps = () => {
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
            description: 'There was a problem fetching the catalog steps. Please try again later.',
          });
      });
  };

  /**
   * Sort & fetch all Steps for the Catalog
   */
  useEffect(() => {
    if (!props.steps) {
      fetchSteps();
    }
  }, []);

  // If the user changes the DSL, update
  // the catalog with relevant steps
  useEffect(() => {
    fetchSteps();
  }, [props.queryParams?.dsl]);

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
    <PageSection data-testid={'stepCatalog'}>
      <TextContent>
        <HelperText>
          <HelperTextItem icon={<InfoIcon />}>Drag a step onto a circle</HelperTextItem>
        </HelperText>
      </TextContent>
      <Toolbar
        id={'toolbar'}
        style={{ background: 'transparent' }}
        className={'stepCatalog-toolbar'}
      >
        <ToolbarContent style={{ padding: 0 }}>
          {
            <>
              <ToolbarItem>
                <InputGroup>
                  <SearchInput
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
      <Gallery hasGutter={true} style={{ maxHeight: '615px', overflow: 'auto', padding: '0 10px' }}>
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
    </PageSection>
  );
};
