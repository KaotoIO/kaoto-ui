import * as React from 'react';
import { IStepProps } from '../types';
import { Tabs, Tab, TabTitleText } from '@patternfly/react-core';
import './catalog.css';

interface ICatalog {
  end: IStepProps[],
  middle: IStepProps[],
  start: IStepProps[]
}

const Catalog = ({ end, middle, start }: ICatalog) => {
  const [activeTabKey, setActiveTabKey] = React.useState();

  const onTabSelected = (event, tabIndex) => {
    setActiveTabKey(tabIndex);
    return;
  };

  return (
    <Tabs activeKey={activeTabKey} isBox={true} onSelect={onTabSelected}>
      <Tab eventKey={0} title={<TabTitleText>Start</TabTitleText>}>
        <div className={'tabContent'}>
          {start.map((step, idx) => {
            return (
              <div key={idx} className={'galleryItem'}>
                <img src={step.icon} className={'galleryImage'}/><br/>
                <span className={'stepName'}>{ step.name }</span>
              </div>
            );
          })}
        </div>
      </Tab>
      <Tab eventKey={1} title={<TabTitleText>Middle</TabTitleText>}>
        <div className={'tabContent'}>
          {middle.map((step, idx) => {
            return (
              <div key={idx} className={'galleryItem'}>
                <img src={step.icon} className={'galleryImage'}/><br/>
                <span className={'stepName'}>{ step.name }</span>
              </div>
            );
          })}
        </div>
      </Tab>
      <Tab eventKey={2} title={<TabTitleText>End</TabTitleText>}>
        <div className={'tabContent'}>
          {end.map((step, idx) => {
            return (
              <div key={idx} className={'galleryItem'}>
                <img src={step.icon} className={'galleryImage'}/><br/>
                <span className={'stepName'}>{ step.name }</span>
              </div>
            );
          })}
        </div>
      </Tab>
    </Tabs>

  );
};

export { Catalog };
