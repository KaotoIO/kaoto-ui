import * as React from 'react';

import {
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  Gallery,
  Grid,
  GridItem,
  InputGroup,
  Label,
  PageSection,
  TextInput,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { IStepProps } from '../types';
import './Catalog.css';
import CogIcon from '@patternfly/react-icons/dist/esm/icons/cog-icon';

interface ICatalog {
  steps: IStepProps[]
}

// Shorten a string to less than maxLen characters without truncating words.
function shorten(str, maxLen, separator = ' ') {
  if (str.length <= maxLen) return str;
  return str.substr(0, str.lastIndexOf(separator, maxLen)) + '..';
}

const Catalog = (props: ICatalog) => {
  const [isSelected, setIsSelected] = React.useState('START');
  const [query, setQuery] = React.useState(``);

  let steps: IStepProps[] = props.steps;

  const changeSearch = (e: any) => {
    setQuery(e);
  };

  const handleItemClick = (newIsSelected: any, event: any) => {
    setIsSelected(event.currentTarget.id);
  };

  function search(items) {
    /**
     * Returns a list of items that meet
     * meet the condition of the `type`
     * matching the `isSelected` value,
     * followed by the `name` containing
     * the characters in the search query
     */
    return items.filter((item) => {
      if(isSelected === item.type) {
        return item.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
      } else {
        return false;
      }
    });
  }

  return (
    <PageSection style={{ backgroundColor: '#F9F9F9' }}>
      <Toolbar id={'toolbar'} style={{ background: 'transparent' }}>
        <ToolbarContent>{(
          <>
            <ToolbarItem>
              <InputGroup>
                <TextInput name={'stepSearch'}
                           id={'stepSearch'}
                           type={'search'}
                           placeholder={'search for a step...'}
                           aria-label={'search for a step'}
                           value={query}
                           onChange={changeSearch}/>
              </InputGroup>
            </ToolbarItem>
            <ToolbarItem variant={'separator'}/>
            <ToolbarItem>
              <ToggleGroup aria-label={'Icon variant toggle group'}>
                <ToggleGroupItem text={'start'}
                                 aria-label={'copy icon button'}
                                 buttonId={'START'}
                                 isSelected={isSelected === 'START'}
                                 onChange={handleItemClick}/>
                <ToggleGroupItem icon={<CogIcon/>}
                                 aria-label={'undo icon button'}
                                 buttonId={'MIDDLE'}
                                 isSelected={isSelected === 'MIDDLE'}
                                 onChange={handleItemClick}/>
                <ToggleGroupItem text={'end'}
                                 aria-label={'share square icon button'}
                                 buttonId={'END'}
                                 isSelected={isSelected === 'END'}
                                 onChange={handleItemClick}/>
              </ToggleGroup>
            </ToolbarItem>
          </>
        )}</ToolbarContent>
      </Toolbar>
      <Gallery hasGutter={true} style={{maxHeight: '650px', overflow: 'auto'}}>
        {steps && search(steps).map((step, idx) => {
          return (
            <Card key={idx}
                  className={'step'}
                  isCompact={true}
                  isHoverable={true}
                  draggable="true"
                  onDragStart={(e: any) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify(step));
                  }}>
              <Grid md={6}>
                <GridItem span={2}>
                  <Bullseye>
                    <img src={step.icon} className={'stepImage'} alt={'Step Image'}/>
                  </Bullseye>
                </GridItem>
                <GridItem span={7}>
                  <CardTitle>
                    <span>{step.name}</span>
                  </CardTitle>
                  <CardBody>
                    {shorten(step.description, 60)}
                  </CardBody>
                </GridItem>
                <GridItem span={3}>
                  <Label color={'blue'} className={'stepLabel'}>SOURCE</Label>
                </GridItem>
              </Grid>
            </Card>
          );
        })}
      </Gallery>
    </PageSection>
  );
};

export { Catalog };

