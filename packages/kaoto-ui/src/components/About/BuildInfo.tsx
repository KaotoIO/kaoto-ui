import { TextListItem } from '@patternfly/react-core';
import { useMemo } from 'react';

export const BuildInfo = () => {
  const buildInfo = useMemo(() => {
    try {
      return BUILD_INFO;
    } catch (error) {
      return undefined;
    }
  }, []);

  return !buildInfo ? null : (
    <>
      <TextListItem component="dt">Build info</TextListItem>
      <TextListItem component="dt">Package name</TextListItem>
      <TextListItem component="dd" data-testid="about-package-name">
        {buildInfo.NAME}
      </TextListItem>
      <TextListItem component="dt">Git version</TextListItem>
      <TextListItem component="dd" data-testid="about-git-version">
        {buildInfo.VERSION}
      </TextListItem>
      <TextListItem component="dt">Git commit hash</TextListItem>
      <TextListItem component="dd" data-testid="about-git-commit-hash">
        {buildInfo.COMMITHASH}
      </TextListItem>
      <TextListItem component="dt">Git branch</TextListItem>
      <TextListItem component="dd" data-testid="about-git-brach">
        {buildInfo.BRANCH}
      </TextListItem>
      <TextListItem component="dt">Git last commit date</TextListItem>
      <TextListItem component="dd" data-testid="about-git-last-commit-date">
        {buildInfo.LASTCOMMITDATETIME}
      </TextListItem>
    </>
  );
};
