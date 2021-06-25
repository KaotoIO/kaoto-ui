import * as React from 'react';
import { render } from 'react-dom';

const YAMLEditor = () => {
  React.useEffect(() => {
    console.log('Hello!');
  }, []);

  return (<p>Edit your YAML file here.</p>);
}

export { YAMLEditor };
