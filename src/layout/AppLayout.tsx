// @ts-ignore
import logo from '../assets/images/logo-kaoto.png';
import WaitingPage from '../components/WaitingPage';
import { Page, PageHeader, SkipToContent } from '@patternfly/react-core';
import { ReactNode, useState } from 'react';
import { useHistory } from 'react-router-dom';

interface IAppLayout {
  children: ReactNode;
}
const AppLayout = ({ children }: IAppLayout) => {
  const [backendAvailable, setBackendAvailable] = useState(false);
  function LogoImg() {
    const history = useHistory();
    function handleClick() {
      history.push('/');
    }
    return <img src={logo} onClick={handleClick} alt="Kaoto Logo" style={{ maxWidth: '50%' }} />;
  }

  const Header = <PageHeader logo={<LogoImg />} />;

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
    <Page mainContainerId={pageId} header={Header} skipToContent={PageSkipToContent}>
      {backendAvailable ? children : <WaitingPage setBackendAvailable={setBackendAvailable} />}
    </Page>
  );
};

export { AppLayout };
