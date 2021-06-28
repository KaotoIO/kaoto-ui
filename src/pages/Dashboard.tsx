import { PageSection, Title } from '@patternfly/react-core';
import { YAMLEditor } from '../components/YAMLEditor';

const Dashboard = () => {
  return (
    <PageSection>
      <Title headingLevel="h1" size="lg">
        Zimara
      </Title>
      <p>Testing something..</p>
      <YAMLEditor />
    </PageSection>
  );
};

export { Dashboard };
