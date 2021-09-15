//import * as React from 'react';
import { IStepProps } from '../types';
import './catalog.css';

interface ICatalog {
  steps: IStepProps[]
}

const Catalog = (props: ICatalog) => {
  return (
    <>
      {props.steps.map((step, idx) => {
        return (
          <div key={idx} className={'catalogStep'}>
            <span className={'stepName'}>{ step.name }</span>
            <img src={step.icon} className={'galleryImage'}/><br/>
          </div>
        );
      })}
    </>
  );
};

export { Catalog };


