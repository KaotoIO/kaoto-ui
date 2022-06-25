// @ts-ignore
import logo from '../assets/images/logo-kaoto.png';
import { HeaderTools } from './HeaderTools';
import { Page, PageHeader, SkipToContent } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { useHistory } from 'react-router-dom';

interface IAppLayout {
  children: ReactNode;
}

const AppLayout = ({ children }: IAppLayout) => {
  function LogoImg() {
    const history = useHistory();
    function handleClick() {
      history.push('/');
    }
    return <img src={logo} onClick={handleClick} alt="Kaoto Logo" style={{ maxWidth: '50%' }} />;
  }

  const Header = <PageHeader logo={<LogoImg />} headerTools={<HeaderTools />} />;

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
      {children}
    </Page>
  );
};

export { AppLayout };
