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
import { IStepProps, IViewData, IVizStepProps } from '../types';
import YAML from '../stories/data/yaml';
import { v4 as uuidv4 } from 'uuid';

const Dashboard = () => {
  // If the catalog data won't be changing, consider removing this state
  const [catalogData, setCatalogData] = React.useState<IStepProps[]>([]);

  // viewData contains the Step model exactly as returned by the API
  const [viewData, setViewData] = React.useState<IViewData>({ steps: [], views: [] });

  // vizData is a UI-specific mapping between the Step model and Visualization metadata
  const [vizData, setVizData] = React.useState<{ viz: IVizStepProps, model: IStepProps }[]>([]);

  // yamlData contains the exact YAML returned by the API or specified by the user
  const [yamlData, setYamlData] = React.useState(YAML);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const previousYaml = usePrevious(yamlData);

  const [activeTabKey, setActiveTabKey] = React.useState();

  const onTabSelected = (event, tabIndex) => {
    setActiveTabKey(tabIndex);
    return;
  };

  /**
   * Fetch all Steps for Catalog
   */
  React.useEffect(() => {
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

    getCatalogData().catch((e) => {console.error(e)});
  }, []);

  /**
   * Watch for user changes to YAML,
   * issue request to API for Visualization JSON
   */
  React.useEffect(() => {
    if(previousYaml === yamlData) {
      return;
    }

    const getVizData = async (incomingData) => {
      setIsError(false);
      setIsLoading(true);

      try {
        const resp = await request.post({
          endpoint: '/viewdefinition',
          contentType: 'text/yaml',
          body: incomingData
        });

        const data: IViewData = await resp.json();
        prepareVizDataSteps(data.steps);
        setViewData(data);
      } catch (err) {
        console.error(err);
        setIsError(true);
      }

      setIsLoading(false);
    };

    getVizData(yamlData).catch((e) => {console.error(e)});
  }, [previousYaml, yamlData]);

  const deleteIntegrationStep = (stepsIndex: any) => {
    // Remove Step from viewData.steps
    const newSteps = viewData.steps.filter((step, idx) => idx !== stepsIndex);

    const getVizData = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        const resp = await request.post({
          endpoint: '/deployment/yaml',
          contentType: 'application/json',
          body: {name: 'Updated integration', steps: newSteps}
        });

        const data = await resp.text();
        console.log(JSON.stringify(data));
        setYamlData(data);
      } catch (err) {
        console.error(err);
        setIsError(true);
      }

      setIsLoading(false);
    };

    getVizData().catch((e) => {console.error(e)});
  };

  /**
   * On detected changes to YAML state, issue POST to external endpoint
   * Returns JSON to be displayed in the visualizer
   */
  const handleChanges = (incomingData: string) => {
    // Wait a bit before setting data
    setTimeout(() => {
      // Check that the data has changed, otherwise return
      if(previousYaml === incomingData) {
        return;
      }
      setYamlData(incomingData);
    },750);
  };

  /**
   * Creates a mapping for the Visualization by
   * separating the Step Model from a new Viz object,
   * which contains UI-specific metadata (e.g. position).
   * Data is stored in the VizData hook.
   * @param steps
   */
  const prepareVizDataSteps = (steps: IStepProps[]) => {
    const incrementAmt = 100;
    const stepsAsElements: any[] = [];

    steps.map((step, index) => {
      // TODO: extract this into something that Visualization can use too
      let inputStep = {
        model: {...step},
        viz: {
          data: { label: step.name },
          id: uuidv4(),
          position: { x: 300, y: window.innerHeight / 2 },
          temporary: false
        }
      };

      // Grab the previous step to use for determining position and drawing edges
      const previousStep = stepsAsElements[index - 1];

      /**
       * Determine first & last steps
       * Label as input/output, respectively
       */
      switch (index) {
        case 0:
          // First item in `steps` array
          inputStep.viz.position.x = 100;
          break;
        case steps.length - 1:
        default:
          // Last item & middle steps in `steps` array
          // Extract into common area for last & middle steps
          inputStep.viz.position.x = previousStep.viz.position?.x + incrementAmt;
          break;
      }

      stepsAsElements.push(inputStep);

      return;
    });

    setVizData(stepsAsElements);
  };

  return (
    <>
      <Grid>
        <GridItem span={activeTabKey === 1 ? 3 : 4}>
          <Tabs activeKey={activeTabKey} isFilled={true} onSelect={onTabSelected}>
            <Tab eventKey={0} title={<TabTitleText>Editor</TabTitleText>}>
              <YAMLEditor yamlData={yamlData} handleChanges={handleChanges} />
            </Tab>
            <Tab eventKey={1} title={<TabTitleText>Catalog</TabTitleText>}>
              <Catalog steps={catalogData} />
            </Tab>
          </Tabs>
        </GridItem>
        <GridItem span={activeTabKey === 1 ? 9 : 8}>
          <Visualization deleteIntegrationStep={deleteIntegrationStep} isError={isError} isLoading={isLoading} steps={vizData} views={viewData.views} />
        </GridItem>
      </Grid>
    </>
  );
};

export { Dashboard };
