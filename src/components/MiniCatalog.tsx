import request from '../api/request';
import { IStepProps } from '../types';
import {
  Bullseye,
  Grid,
  GridItem,
  InputGroup,
  List,
  ListItem,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { useEffect, useState } from 'react';

export interface IMiniCatalog {
  steps?: IStepProps[];
}

export const MiniCatalog = (props: IMiniCatalog) => {
  const [catalogData, setCatalogData] = useState<IStepProps[]>(props.steps ?? []);
  const [query, setQuery] = useState(``);

  /**
   * Sort & fetch all Steps for the Catalog
   */
  useEffect(() => {
    if (!props.steps) {
      const getCatalogData = async () => {
        try {
          const resp = await request.get({
            endpoint: '/step',
          });

          const data = await resp.json();
          data.sort((a: IStepProps, b: IStepProps) => a.name.localeCompare(b.name));
          setCatalogData(data);
        } catch (err) {
          console.error(err);
        }
      };

      getCatalogData().catch((e) => {
        console.error(e);
      });
    }
  }, []);

  const changeSearch = (e: any) => {
    setQuery(e);
  };

  function search(items: any[]) {
    return items.filter((item) => item.name.toLowerCase().indexOf(query.toLowerCase()) > -1);
  }

  return (
    <>
      <Toolbar id={'toolbar'} style={{ background: 'transparent' }}>
        <ToolbarContent>
          {
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
          }
        </ToolbarContent>
      </Toolbar>
      <List isPlain={true} style={{ maxHeight: '650px', overflow: 'auto' }}>
        {catalogData &&
          search(catalogData)
            .slice(0, 5)
            .map((step, idx) => {
              return (
                <ListItem
                  key={idx}
                  className={'miniCatalog--step'}
                  icon={<img src={step.icon} className={'catalog--stepImage'} alt={'Step Image'} />}
                >
                  {step.name}
                  {/*}
                  <Grid md={6}>
                    <GridItem span={3}>
                      <Bullseye>
                        <img src={step.icon} className={'catalog--stepImage'} alt={'Step Image'} />
                      </Bullseye>
                    </GridItem>
                    <GridItem span={9}>
                      <span>{step.name}</span>
                    </GridItem>
                  </Grid>
                  {*/}
                </ListItem>
              );
            })}
      </List>
    </>
  );
};
