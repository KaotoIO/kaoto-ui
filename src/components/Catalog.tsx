import * as React from 'react';

import {
  Button,
  ButtonVariant,
  InputGroup,
  TextInput,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  Gallery,
  Grid,
  GridItem,
  Label,
  PageSection,
} from '@patternfly/react-core';
import { IStepProps } from '../types';
import './Catalog.css';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import UndoIcon from '@patternfly/react-icons/dist/esm/icons/undo-icon';
import CopyIcon from '@patternfly/react-icons/dist/esm/icons/copy-icon';
import ShareSquareIcon from '@patternfly/react-icons/dist/esm/icons/share-square-icon';

interface ICatalog {
  steps: IStepProps[]
}

const Catalog = (props: ICatalog) => {
  const [isSelected, setIsSelected] = React.useState({
    start: false,
    middle: false,
    end: false
  });
  const [query, setQuery] = React.useState(``);

  let steps: IStepProps[] = props.steps;

  const changeSearch = (e: any) => {
    setQuery(e);
  };

  const handleItemClick = (isSelected: any, event: any) => {
    const id = event.currentTarget.id;
    setIsSelected({...isSelected, [id]: isSelected});
  };
  
  function search(items) {
    return items.filter((item) => {
        return (
          item.name.toLowerCase().indexOf(query.toLowerCase()) > -1
        );
    });
  }

  return (
    <PageSection style={{backgroundColor: '#F9F9F9'}}>
      <Toolbar id={'toolbar'}>
        <ToolbarContent>{(
          <>
            <ToolbarItem>
              <InputGroup>
                <TextInput name={'stepSearch'}
                           id={'stepSearch'}
                           type={'search'}
                           aria-label={'search for a step'}
                           value={query}
                           onChange={changeSearch}/>
                <Button variant={ButtonVariant.control} aria-label={'search button for search input'}>
                  <SearchIcon/>
                </Button>
              </InputGroup>
            </ToolbarItem>
            <ToolbarItem variant={'separator'}/>
            <ToolbarItem>
              <ToggleGroup aria-label={'Icon variant toggle group'}>
                <ToggleGroupItem icon={<CopyIcon/>}
                                 aria-label={'copy icon button'}
                                 buttonId={'start'}
                                 isSelected={isSelected.start}
                                 onChange={handleItemClick}/>
                <ToggleGroupItem icon={<UndoIcon/>}
                                 aria-label={'undo icon button'}
                                 buttonId={'middle'}
                                 isSelected={isSelected.middle}
                                 onChange={handleItemClick}/>
                <ToggleGroupItem icon={<ShareSquareIcon/>}
                                 aria-label={'share square icon button'}
                                 buttonId={'end'}
                                 isSelected={isSelected.end}
                                 onChange={handleItemClick}/>
              </ToggleGroup>
            </ToolbarItem>
          </>
        )}</ToolbarContent>
      </Toolbar>
      <Gallery hasGutter={true}>
      {steps && search(steps).map((step, idx) => {
        return (
          <Card key={idx} className={'step'} isCompact={true} isHoverable={true}>
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
                  {step.description}
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

