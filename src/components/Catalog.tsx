import { useState } from 'react';
import {
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
import { IStepProps } from '../types';
import './Catalog.css';

interface ICatalog {
  isCatalogExpanded: boolean;
  onClosePanelClick: (e: any) => void;
  steps: IStepProps[];
}

// Shorten a string to less than maxLen characters without truncating words.
function shorten(str: string, maxLen: number, separator = ' ') {
  if (str.length <= maxLen) return str;
  return str.substr(0, str.lastIndexOf(separator, maxLen)) + '..';
}

const Catalog = (props: ICatalog) => {
  const [isSelected, setIsSelected] = useState('START');
  const [query, setQuery] = useState(``);

  const steps: IStepProps[] = props.steps;

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
    <DrawerPanelContent minSize={'525px'} colorVariant={DrawerColorVariant.light200}>
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
          {steps &&
            search(steps).map((step, idx) => {
              return (
                <Card
                  key={idx}
                  className={'step'}
                  isCompact={true}
                  isHoverable={true}
                  draggable={'true'}
                  onDragStart={(e: any) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify(step));
                  }}
                >
                  <Grid md={6}>
                    <GridItem span={2}>
                      <Bullseye>
                        <img src={step.icon} className={'stepImage'} alt={'Step Image'} />
                      </Bullseye>
                    </GridItem>
                    <GridItem span={7}>
                      <CardTitle>
                        <span>{step.name}</span>
                      </CardTitle>
                      <CardBody>{shorten(step.description, 60)}</CardBody>
                    </GridItem>
                    <GridItem span={3}>
                      <Label color={'blue'} className={'stepLabel'}>
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
