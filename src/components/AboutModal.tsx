import { AboutModal as PatternFlyAboutModal, TextContent, TextList, TextListItem } from '@patternfly/react-core';
import logo from '../assets/images/logo-kaoto-dark.png';
import { useSettingsStore } from '../store';

export interface IAboutModal {
  handleCloseModal: () => void;
  isModalOpen: boolean;
}

export const AboutModal = ({ handleCloseModal, isModalOpen }: IAboutModal) => {
  const backendVersion = useSettingsStore((state) => state.backendVersion);

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
          <TextListItem component="dd">{KAOTO_VERSION}</TextListItem>
          <TextListItem component="dt">Backend Version</TextListItem>
          <TextListItem component="dd">{backendVersion}</TextListItem>
        </TextList>
      </TextContent>
    </PatternFlyAboutModal>
  );
};
