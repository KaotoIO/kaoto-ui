import './Catalog.css';
import { fetchCatalogSteps } from '@kaoto/api';
import { useSettingsStore, useStepCatalogStore } from '@kaoto/store';
import { IStepProps } from '@kaoto/types';
import { shorten, truncateString } from '@kaoto/utils';
import {
  AlertVariant,
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  Gallery,
  GalleryItem,
  Grid,
  GridItem,
  InputGroup,
  Label,
  SearchInput,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useEffect, useRef, useState } from 'react';

export const Catalog = ({ handleClose }: { handleClose: () => void }) => {
  const stepCatalog = useStepCatalogStore();
  const [isSelected, setIsSelected] = useState('START');
  const [query, setQuery] = useState(``);
  const dsl = useSettingsStore((state) => state.settings.dsl.name);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { addAlert } = useAlert() || {};

  /**
   * Sort & fetch all Steps for the Catalog
   * Checks for changes to the settings for DSL
   */
  useEffect(() => {
    if (stepCatalog.stepCatalog.length) return;
    fetchCatalogSteps({
      dsl,
    })
      .then((value) => {
        if (value) {
          value.sort((a: IStepProps, b: IStepProps) => a.name.localeCompare(b.name));
          stepCatalog.setStepCatalog(value);
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
  }, [dsl]);

  const changeSearch = (e: string) => {
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
        return item.name.toLowerCase().indexOf(query.trim().toLowerCase()) > -1;
      } else {
        return false;
      }
    });
  }

  return (
    <div data-testid={'stepCatalog'} className={'catalog'}>
      <DrawerHead>
        <h3 className={'pf-c-title pf-m-2xl'}>Step Catalog&nbsp;&nbsp;</h3>
        <span>Try dragging a step onto a circle in the canvas</span>
        <DrawerActions>
          <DrawerCloseButton onClick={handleClose} />
        </DrawerActions>
      </DrawerHead>

      <Toolbar id={'toolbar'} className={'catalog__toolbar'}>
        <ToolbarContent className={'catalog__toolbarContent'}>
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
                    onChange={(_e, s) => changeSearch(s)}
                    onClear={() => setQuery('')}
                    ref={searchInputRef}
                  />
                </InputGroup>
              </ToolbarItem>
              <ToolbarItem>
                <ToggleGroup aria-label={'Icon variant toggle group'}>
                  <ToggleGroupItem
                    text={'start'}
                    data-testid={`catalog-step-start`}
                    aria-label={'sources button'}
                    buttonId={'START'}
                    isSelected={isSelected === 'START'}
                    onChange={handleItemClick}
                  />
                  <ToggleGroupItem
                    icon={'actions'}
                    data-testid={`catalog-step-actions`}
                    aria-label={'actions button'}
                    buttonId={'MIDDLE'}
                    isSelected={isSelected === 'MIDDLE'}
                    onChange={handleItemClick}
                  />
                  <ToggleGroupItem
                    text={'end'}
                    data-testid={`catalog-step-end`}
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
        style={{ flex: '1 1', overflow: 'auto', padding: '0 10px', alignContent: 'flex-start' }}
      >
        {search(stepCatalog.stepCatalog).map((step, idx) => {
          return (
            <GalleryItem key={idx}>
              <Card
                className={'catalog__step'}
                data-testid={`catalog-step-${step.name}`}
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
            </GalleryItem>
          );
        })}
      </Gallery>
    </div>
  );
};
