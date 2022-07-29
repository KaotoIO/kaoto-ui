import { BullseyeProps, SpinnerProps } from '@patternfly/react-core';
export declare type MASLoadingProps = {
    bullseyeProps?: Omit<BullseyeProps, 'children'>;
    spinnerProps?: SpinnerProps;
};
export declare const MASLoading: ({ bullseyeProps, spinnerProps }: MASLoadingProps) => JSX.Element;
