import { PageSection } from '@patternfly/react-core';
import { YAMLEditor } from '../components/YAMLEditor';

const Dashboard = () => {
  return (
    <PageSection>
      <YAMLEditor />
    </PageSection>
  );
};

export { Dashboard };
