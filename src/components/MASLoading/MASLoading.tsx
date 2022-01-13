import { Bullseye, BullseyeProps, Spinner, SpinnerProps } from '@patternfly/react-core';

export type MASLoadingProps = {
  bullseyeProps?: Omit<BullseyeProps, 'children'>;
  spinnerProps?: SpinnerProps;
};

export const MASLoading = ({ bullseyeProps, spinnerProps }: MASLoadingProps) => (
  <Bullseye {...bullseyeProps}>
    <Spinner {...spinnerProps} />
  </Bullseye>
);
