import { SourceCodeEditor } from './SourceCodeEditor';
import { CodeEditorMode } from '@kaoto/types';
import { Alert, AlertActionCloseButton, Modal, ModalVariant } from '@patternfly/react-core';
import { useState } from 'react';

type ISourceCodeEditorModalProps = {
  close: () => void;
  isOpen: boolean;
};
export const SourceCodeEditorModal = (props: ISourceCodeEditorModalProps) => {
  const [alertVisible, setAlertVisible] = useState(true);
  return (
    <Modal
      variant={ModalVariant.medium}
      title="Edit the source code"
      isOpen={props.isOpen}
      onClose={props.close}
    >
      {alertVisible && (
        <Alert
          title="Warning"
          variant="warning"
          actionClose={<AlertActionCloseButton onClose={() => setAlertVisible(false)} />}
        >
          Any invalid code will be replaced after sync. If you don't want to lose your changes
          please make a backup.
        </Alert>
      )}
      <SourceCodeEditor editable={true} mode={CodeEditorMode.FREE_EDIT} />
    </Modal>
  );
};
