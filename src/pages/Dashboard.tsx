import {
  Grid,
  GridItem,
  Tab,
  Tabs,
  TabTitleText
} from '@patternfly/react-core';
import { Catalog } from '../components/Catalog';
import { Visualization } from '../components/Visualization';
import { YAMLEditor } from '../components/YAMLEditor';
import usePrevious from '../utils/usePrevious';
import request from '../utils/request';
import * as React from 'react';
import { IStepProps, IViewData } from '../types';
import YAML from '../stories/data/yaml';

/**
 * Temporarily providing initial YAML data
 */
const exampleData = YAML;

const Dashboard = () => {
  const [catalogData, setCatalogData] = React.useState<IStepProps[]>([]);
  const [stepData, setStepData] = React.useState<IStepProps[]>([]);
  const [yamlData, setYamlData] = React.useState(exampleData);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const previousYaml = usePrevious(yamlData);

  const [activeTabKey, setActiveTabKey] = React.useState();

  const onTabSelected = (event, tabIndex) => {
    setActiveTabKey(tabIndex);
    return;
  };

  React.useEffect(() => {
    if(previousYaml === yamlData) {
      console.log('Previous YAML is the same as current YAML. Do not make API request. Returning...');
      return;
    }

    const getVizData = async (incomingData) => {
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
        setStepData(data.steps ?? []);
      } catch (err) {
        console.error(err);
        setIsError(true);
      }

      setIsLoading(false);
    };

    const getCatalogData = async () => {
      try {
        const resp = await request.get({
          endpoint: '/step'
        });

        const data = await resp.json();
        setCatalogData(data);
      } catch (err) {
        console.error(err);
      }
    };

    getVizData(yamlData).catch((e) => {console.error(e)});
    getCatalogData().catch((e) => {console.error(e)});
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
        <GridItem span={activeTabKey === 1 ? 3 : 4}>
          <Tabs activeKey={activeTabKey} isFilled={true} onSelect={onTabSelected}>
            <Tab eventKey={0} title={<TabTitleText>Editor</TabTitleText>}>
              <YAMLEditor yamlData={ yamlData } handleChanges={handleChanges} />
            </Tab>
            <Tab eventKey={1} title={<TabTitleText>Catalog</TabTitleText>}>
              <Catalog steps={catalogData} />
            </Tab>
          </Tabs>
        </GridItem>
        <GridItem span={activeTabKey === 1 ? 9 : 8}>
          <Visualization isError={isError} isLoading={isLoading} steps={stepData}/>
        </GridItem>
      </Grid>
    </>
  );
};

export { Dashboard };
