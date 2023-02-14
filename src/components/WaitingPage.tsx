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

interface ILoadingScreen {
  fetching: boolean;
  message: string;
}
export const WaitingPage = ({ fetching, message }: ILoadingScreen) => {
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
