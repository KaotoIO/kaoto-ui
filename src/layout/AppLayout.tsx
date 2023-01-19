import WaitingPage from '../components/WaitingPage';
import { Page, SkipToContent } from '@patternfly/react-core';
import { ReactNode, useState } from 'react';

interface IAppLayout {
  children: ReactNode;
}
const AppLayout = ({ children }: IAppLayout) => {
  const [backendAvailable, setBackendAvailable] = useState(false);

  const pageId = 'primary-app-container';

  const PageSkipToContent = (
    <SkipToContent
      onClick={(event) => {
        event.preventDefault();
        const primaryContentContainer = document.getElementById(pageId);
        primaryContentContainer && primaryContentContainer.focus();
      }}
      href={`#${pageId}`}
    >
      Skip to Content
    </SkipToContent>
  );
  return (
    <Page mainContainerId={pageId} skipToContent={PageSkipToContent}>
      {backendAvailable ? children : <WaitingPage setBackendAvailable={setBackendAvailable} />}
    </Page>
  );
};

export { AppLayout };
