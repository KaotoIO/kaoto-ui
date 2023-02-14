import { Button } from '@patternfly/react-core';

interface IBranchBuilder {
  handleAddBranch: () => void;
}

const BranchBuilder = ({ handleAddBranch }: IBranchBuilder) => {
  return (
    <>
      <Button variant={'primary'} onClick={handleAddBranch}>
        Add a Branch
      </Button>
    </>
  );
};

export { BranchBuilder };
