import { IExpanded } from '../pages/Dashboard';
import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelContent,
} from '@patternfly/react-core';
import { forwardRef, LegacyRef } from 'react';

interface IConsole {
  // CRD, or string, of deployment
  deployment?: string;
  expanded: IExpanded;
  handleCloseConsole: () => void;
}

const Console = forwardRef(
  (props: IConsole, consoleDrawerRef: LegacyRef<HTMLSpanElement> | undefined) => {
    return (
      <DrawerPanelContent>
        <DrawerHead>
          <span tabIndex={props.expanded.console ? 0 : -1} ref={consoleDrawerRef}>
            drawer-panel
          </span>
          <DrawerActions>
            <DrawerCloseButton onClick={props.handleCloseConsole} />
          </DrawerActions>
        </DrawerHead>
      </DrawerPanelContent>
    );
  }
);

export { Console };
