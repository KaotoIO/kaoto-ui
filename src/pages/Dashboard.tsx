import {
  Grid,
  GridItem,
} from '@patternfly/react-core';
//import { VizReactFlow } from '../components/VizReactFlow';
import { VizKonva } from '../components/VizKonva';
import { YAMLEditor } from '../components/YAMLEditor';
import usePrevious from '../utils/usePrevious';
import request from '../utils/request';
// import sortSteps from '../utils/sortSteps';
import * as React from 'react';
import { IStepProps, IViewData } from '../types';
import YAML from '../stories/data/yaml';

/**
 * Temporarily providing initial YAML data
 */
const exampleData = YAML;

const Dashboard = () => {
  const [stepData, setStepData] = React.useState<IStepProps[]>([]);
  const [yamlData, setYamlData] = React.useState(exampleData);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const previousYaml = usePrevious(yamlData);

  React.useEffect(() => {
    if(previousYaml === yamlData) {
      console.log('Previous YAML is the same as current YAML. Do not make API request. Returning...');
      return;
    }

    const getData = async (incomingData) => {
      setIsError(false);
      setIsLoading(true);

      try {
        const resp = await request.post({
          endpoint: '/viewdefinition?' + new URLSearchParams({
            yaml: incomingData
          }),
          contentType: 'text/yaml'
        });

        const data: IViewData = await resp.json();
        setStepData(data[0].steps ?? []);
      } catch (err) {
        console.error(err);
        setIsError(true);
      }

      setIsLoading(false);
    }

    getData(yamlData).catch((e) => {console.error(e)});
  }, [previousYaml, yamlData]);

  /**
   * On detected changes to YAML state, issue POST to external endpoint
   * Returns JSON to be displayed in the visualizer
   */
  const handleChanges = (incomingData: string) => {
    // Wait a bit before setting data
    setTimeout(() => {
      // Check that the data has changed
      if(previousYaml === incomingData) {
        console.log('Previous YAML is the same as incoming user changes. Do not set YAML. Returning..');
        return;
      }
      setYamlData(incomingData);
    },750);
  };

  return (
    <>
      <Grid>
        <GridItem span={6}>
          <YAMLEditor yamlData={ yamlData } handleChanges={handleChanges} />
        </GridItem>
        <GridItem span={6}>
          <VizKonva isError={isError} isLoading={isLoading} steps={stepData}/>
        </GridItem>
      </Grid>
    </>
  );
};

export { Dashboard };
