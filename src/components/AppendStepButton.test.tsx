import { kameletSourceStepStub } from '../__mocks__/steps';
import { AlertProvider } from '../layout';
import { AppendStepButton } from './AppendStepButton';
import { StepsService } from '@kaoto/services';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

describe('AppendStepButton.tsx', () => {
  let supportsBranchingSpy: jest.SpyInstance;
  const noopFn = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    supportsBranchingSpy = jest.spyOn(StepsService, 'supportsBranching').mockReturnValue(true);
  });

  afterEach(() => {
    supportsBranchingSpy.mockRestore();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('component renders', () => {
    render(
      <AlertProvider>
        <AppendStepButton
          handleAddBranch={noopFn}
          handleSelectStep={noopFn}
          layout={'LR'}
          showStepsTab={true}
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
          layout={'LR'}
          showStepsTab={true}
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
          layout={'LR'}
          showStepsTab={true}
          step={{
            ...kameletSourceStepStub,
            maxBranches: 1,
            branches: [{ branchUuid: 'random-uuid', identifier: 'branch-1', steps: [] }],
          }}
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
      const tooltip = screen.getByText(/Max number of branches reached/);
      expect(tooltip).toBeInTheDocument();
    });
  });

  test('should disable branches tab when supportsBranching={false}', async () => {
    supportsBranchingSpy = jest.spyOn(StepsService, 'supportsBranching').mockReturnValue(false);

    render(
      <AlertProvider>
        <AppendStepButton
          handleAddBranch={noopFn}
          handleSelectStep={noopFn}
          layout={'LR'}
          showStepsTab={true}
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
      const tooltip = screen.getByText(/step doesn't support branching/);
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
          layout={'LR'}
          showStepsTab={true}
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
      const tooltip = screen.getByText(/Please click on the step to configure branches for it./);
      expect(tooltip).toBeInTheDocument();
    });

    spy.mockReset();
  });

  test('should disable the plus button when showStepsTab={false} and supportsBranching={false}', async () => {
    const spy = jest.spyOn(StepsService, 'hasCustomStepExtension').mockReturnValue(true);
    supportsBranchingSpy = jest.spyOn(StepsService, 'supportsBranching').mockReturnValue(false);

    render(
      <AlertProvider>
        <AppendStepButton
          handleAddBranch={noopFn}
          handleSelectStep={noopFn}
          layout={'LR'}
          showStepsTab={false}
          step={kameletSourceStepStub}
        />
      </AlertProvider>
    );

    const plusIcon = screen.getByTestId('stepNode__appendStep-btn');
    expect(plusIcon).toBeDisabled();

    act(() => {
      fireEvent.mouseEnter(plusIcon);
      jest.runAllTimers();
    });

    await waitFor(() => {
      const tooltip = screen.getByText(/Please click on the step to configure branches for it./);
      expect(tooltip).toBeInTheDocument();
    });

    spy.mockReset();
  });
});
