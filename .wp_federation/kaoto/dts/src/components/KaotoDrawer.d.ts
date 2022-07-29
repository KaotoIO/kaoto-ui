import { DrawerColorVariant } from '@patternfly/react-core';
import { CSSProperties, ReactNode } from 'react';
export interface IKaotoDrawer {
    children: ReactNode;
    colorVariant?: DrawerColorVariant | 'light-200' | 'default';
    className?: string;
    dataTestId?: string;
    defaultSize?: string;
    handleOnExpand?: () => void;
    hasNoBorder?: boolean;
    id?: string;
    isExpanded: boolean;
    isResizable?: boolean;
    maxSize?: string;
    minSize?: string;
    panelContent: ReactNode;
    position: 'left' | 'right' | 'bottom';
    style?: CSSProperties;
}
export declare const KaotoDrawer: ({ children, className, colorVariant, dataTestId, defaultSize, handleOnExpand, hasNoBorder, id, isExpanded, isResizable, maxSize, minSize, panelContent, position, style, }: IKaotoDrawer) => JSX.Element;
