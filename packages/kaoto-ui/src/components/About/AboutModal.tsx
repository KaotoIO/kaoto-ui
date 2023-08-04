import logo from '../../assets/images/logo-kaoto-dark.png';
import { BuildInfo } from './BuildInfo';
import { useSettingsStore } from '@kaoto/store';
import {
  AboutModal as PatternFlyAboutModal,
  TextContent,
  TextList,
  TextListItem,
} from '@patternfly/react-core';

export interface IAboutModal {
  handleCloseModal: () => void;
  isModalOpen: boolean;
}

export const AboutModal = ({ handleCloseModal, isModalOpen }: IAboutModal) => {
  const backendVersion = useSettingsStore((state) => state.settings.backendVersion);

  return (
    <PatternFlyAboutModal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      brandImageSrc={logo}
      brandImageAlt="Kaoto Logo"
      data-testid="about-modal"
    >
      <TextContent>
        <TextList component="dl">
          <TextListItem component="dt">Frontend Version</TextListItem>
          <TextListItem component="dd" data-testid="about-frontend-version">
            {KAOTO_VERSION}
          </TextListItem>
          <TextListItem component="dt">Backend Version</TextListItem>
          <TextListItem component="dd" data-testid="about-backend-version">
            {backendVersion}
          </TextListItem>

          <BuildInfo />
        </TextList>
      </TextContent>
    </PatternFlyAboutModal>
  );
};
