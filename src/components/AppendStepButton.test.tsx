import { StepsService } from '@kaoto/services';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { kameletSourceStepStub } from '../__mocks__/steps';
import { AlertProvider } from '../layout';
import { AppendStepButton } from './AppendStepButton';

describe('AppendStepButton.tsx', () => {
  const noopFn = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('component renders', () => {
    render(
      <AlertProvider>
        <AppendStepButton
          handleAddBranch={noopFn}
          handleSelectStep={noopFn}
          showBranchesTab={true}
          showStepsTab={true}
          supportsBranching={true}
          step={kameletSourceStepStub}
        />
      </AlertProvider>
    );

    const element = screen.queryByTestId('stepNode__appendStep-btn');
    expect(element).toBeInTheDocument();
  });

  test('should display MiniCatalog when clicking on the plus icon', async () => {
    render(
      <AlertProvider>
        <AppendStepButton
          handleAddBranch={noopFn}
          handleSelectStep={noopFn}
          showBranchesTab={true}
          showStepsTab={true}
          supportsBranching={true}
          step={kameletSourceStepStub}
        />
      </AlertProvider>
    );

    const element = screen.getByTestId('stepNode__appendStep-btn');
    fireEvent.click(element);

    await waitFor(() => {
      const miniCatalog = screen.getByTestId('miniCatalog');
      expect(miniCatalog).toBeInTheDocument();
    });
  });

  test('should disable branches tab when reaching the max branches qty', async () => {
    render(
      <AlertProvider>
        <AppendStepButton
          handleAddBranch={noopFn}
          handleSelectStep={noopFn}
          showBranchesTab={false}
          showStepsTab={true}
          supportsBranching={true}
          step={{ ...kameletSourceStepStub, maxBranches: 1, branches: [{ branchUuid: 'random-uuid', identifier: 'branch-1', steps: [] }] }}
        />
      </AlertProvider>
    );

    const plusIcon = screen.getByTestId('stepNode__appendStep-btn');
    fireEvent.click(plusIcon);

    await waitFor(() => {
      screen.getByTestId('miniCatalog__branches');
    });

    const branchTab = screen.getByTestId('miniCatalog__branches');

    act(() => {
      fireEvent.mouseEnter(branchTab);
      jest.runAllTimers();
    });

    await waitFor(() => {
      const tooltip = screen.getByText(/Max number of branches reached/,);
      expect(tooltip).toBeInTheDocument();
    });
  });

  test('should disable branches tab when showBranchesTab={false} and supportsBranching={false}', async () => {
    render(
      <AlertProvider>
        <AppendStepButton
          handleAddBranch={noopFn}
          handleSelectStep={noopFn}
          showBranchesTab={false}
          showStepsTab={true}
          supportsBranching={false}
          step={kameletSourceStepStub}
        />
      </AlertProvider>
    );

    const plusIcon = screen.getByTestId('stepNode__appendStep-btn');
    fireEvent.click(plusIcon);

    await waitFor(() => {
      screen.getByTestId('miniCatalog__branches');
    });

    const branchTab = screen.getByTestId('miniCatalog__branches');

    act(() => {
      fireEvent.mouseEnter(branchTab);
      jest.runAllTimers();
    });

    await waitFor(() => {
      const tooltip = screen.getByText(/step doesn't support branching/,);
      expect(tooltip).toBeInTheDocument();
    });
  });

  test('should disable branches tab when the step has a CustomStepExtension', async () => {
    const spy = jest.spyOn(StepsService, 'hasCustomStepExtension').mockReturnValue(true);

    render(
      <AlertProvider>
        <AppendStepButton
          handleAddBranch={noopFn}
          handleSelectStep={noopFn}
          showBranchesTab={true}
          showStepsTab={true}
          supportsBranching={true}
          step={kameletSourceStepStub}
        />
      </AlertProvider>
    );

    const plusIcon = screen.getByTestId('stepNode__appendStep-btn');
    fireEvent.click(plusIcon);

    await waitFor(() => {
      screen.getByTestId('miniCatalog__branches');
    });

    const branchTab = screen.getByTestId('miniCatalog__branches');

    act(() => {
      fireEvent.mouseEnter(branchTab);
      jest.runAllTimers();
    });

    await waitFor(() => {
      const tooltip = screen.getByText(/Please click on the step to configure branches for it./,);
      expect(tooltip).toBeInTheDocument();
    });

    spy.mockReset();
  });

});
