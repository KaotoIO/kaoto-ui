import { fetchCapabilities } from '@kaoto/api';
import { sleep } from '@kaoto/utils';
import {
  Grid,
  GridItem,
  Icon,
  Page,
  PageSection,
  Spinner,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useEffect, useState } from 'react';

interface ILoadingScreen {
  setBackendAvailable: (b: boolean) => void;
}
const WaitingPage = ({ setBackendAvailable }: ILoadingScreen) => {
  const [message, setMessage] = useState('Trying to reach the Kaoto API');
  const [fetching, setFetching] = useState(true);

  // Method that tries to connect to capabilities endpoint and evaluate if the API is available
  const tryApiAvailable = (retries: number) => {
    fetchCapabilities()
      .then((resp) => {
        if (resp) {
          setBackendAvailable(true);
        }
      })
      .catch(() => {
        if (retries > 0) {
          sleep(1000).then(() => {
            tryApiAvailable(retries - 1);
          });
        } else {
          setBackendAvailable(false);
          setMessage('Kaoto API is unreachable');
          setFetching(false);
        }
      });
  };

  useEffect(() => {
    // try to fetch api for 120seconds
    tryApiAvailable(120);
  }, []);
  return (
    <Page>
      <PageSection isFilled={true}>
        <Grid
          hasGutter
          style={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GridItem span={12}>
            {!fetching && (
              <Icon size="lg">
                <ExclamationCircleIcon style={{ color: 'red' }} />
              </Icon>
            )}
            {fetching && <Spinner isSVG diameter="60px" aria-label="Backend loading" />}
          </GridItem>
          <GridItem span={12}>
            <TextContent>
              <Text className={'--pf-global--Color--200'} component={TextVariants.h3}>
                {message}
              </Text>
            </TextContent>
          </GridItem>
        </Grid>
      </PageSection>
    </Page>
  );
};

export default WaitingPage;
