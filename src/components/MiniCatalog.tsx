import request from '../api/request';
import { IStepProps } from '../types';
import { Popover, PopoverPosition } from '@patternfly/react-core';
import { useEffect, useState } from 'react';

export interface IMiniCatalog {
  steps?: IStepProps[];
}

export const MiniCatalog = (props: IMiniCatalog) => {
  const [catalogData, setCatalogData] = useState<IStepProps[]>(props.steps ?? []);
  const [isSelected, setIsSelected] = useState('START');
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

  return <></>;
};
