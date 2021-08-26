import * as React from 'react';
import { IStepProps } from '../types';
import { Gallery, GalleryItem, Tabs, Tab, TabTitleText } from '@patternfly/react-core';
import './catalog.css';

interface ICatalog {
  end: IStepProps[],
  middle: IStepProps[],
  start: IStepProps[]
}

const maxWidths = {
  sm: '75px'
};

const Catalog = ({ end, middle, start }: ICatalog) => {
  const [activeTabKey, setActiveTabKey] = React.useState();

  const onTabSelected = (event, tabIndex) => {
    setActiveTabKey(tabIndex);
    return;
  };

  return (
    <Tabs activeKey={activeTabKey} isFilled={true} onSelect={onTabSelected}>
      <Tab eventKey={0} title={<TabTitleText>Start</TabTitleText>}>
        <div className={'tab-one'}>
        <Gallery maxWidths={{...maxWidths}} className={'gallery'}>
          {start.map((step, idx) => {
            return (
              <GalleryItem key={idx} className={'galleryItem'}>
                <img src={step.icon} width={46} /><br/>
                <span className={'stepName'}>{ step.name }</span>
              </GalleryItem>
            );
          })}
        </Gallery>
        </div>
      </Tab>
      <Tab eventKey={1} title={<TabTitleText>Middle</TabTitleText>}>
        <Gallery hasGutter={true} maxWidths={{...maxWidths}} className={'gallery'}>
          {middle.map((step, idx) => {
            return (
              <GalleryItem key={idx} className={'galleryItem'}>
                <img src={step.icon} width={46} /><br/>
                <span className={'stepName'}>{ step.name }</span>
              </GalleryItem>
            );
          })}
        </Gallery>
      </Tab>
      <Tab eventKey={2} title={<TabTitleText>End</TabTitleText>}>
        <Gallery hasGutter={true} maxWidths={{...maxWidths}} className={'gallery'}>
          {end.map((step, idx) => {
            return (
              <GalleryItem key={idx} className={'galleryItem'}>
                <img src={step.icon} width={46} /><br/>
                <span className={'stepName'}>{ step.name }</span>
              </GalleryItem>
            );
          })}
        </Gallery>
      </Tab>
    </Tabs>

  );
};

export { Catalog };
