import { Button } from '@patternfly/react-core';

interface IBranchBuilder {
  handleAddBranch: () => void;
}

const BranchBuilder = ({ handleAddBranch }: IBranchBuilder) => {
  return (
    <>
      <Button 
        variant={'primary'}
        onClick={handleAddBranch}
        data-testid={'addBranch__button'}
        >
        Add a Branch
      </Button>
    </>
  );
};

export { BranchBuilder };
