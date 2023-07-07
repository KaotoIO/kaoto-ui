import {
  Drawer,
  DrawerColorVariant,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import { CSSProperties, ReactNode, useRef } from 'react';

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

export const KaotoDrawer = ({
  children,
  className,
  colorVariant,
  dataTestId,
  defaultSize,
  handleOnExpand,
  hasNoBorder,
  id,
  isExpanded,
  isResizable,
  maxSize,
  minSize,
  panelContent,
  position,
  style,
  ...rest
}: IKaotoDrawer) => {
  const consoleDrawerRef = useRef<HTMLSpanElement | null>(null);

  const onExpand = () => {
    consoleDrawerRef.current && consoleDrawerRef.current.focus();
    if (handleOnExpand) handleOnExpand();
  };

  const panelContentWrapper = (
    <DrawerPanelContent
      colorVariant={colorVariant}
      className={className}
      data-testid={dataTestId}
      defaultSize={defaultSize}
      hasNoBorder={hasNoBorder}
      isResizable={isResizable}
      maxSize={maxSize}
      minSize={minSize}
    >
      {panelContent}
    </DrawerPanelContent>
  );

  return (
    <Drawer
      id={id}
      isExpanded={isExpanded}
      onExpand={onExpand}
      position={position}
      style={style}
      {...rest}
    >
      <DrawerContent panelContent={panelContentWrapper} className={'panelCustom'}>
        <DrawerContentBody>{children}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};
