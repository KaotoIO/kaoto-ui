import { IStepProps, IStepPropsBranch, IViewProps } from '@kaoto/types';
import { StepsService, VisualizationService } from '@kaoto/services';
import { kameletSourceStepStub } from '../stubs/steps';
import { useShowBranchTab } from './show-branch-tab.hook';
import { render } from '@testing-library/react';

describe('useShowBranchTab', () => {
  let hasCustomStepExtensionSpy: jest.SpyInstance;
  let supportsBranchingSpy: jest.SpyInstance;
  let showBranchesTabSpy: jest.SpyInstance;

  beforeEach(() => {
    hasCustomStepExtensionSpy = jest.spyOn(StepsService, 'hasCustomStepExtension');
    supportsBranchingSpy = jest.spyOn(StepsService, 'supportsBranching');
    showBranchesTabSpy = jest.spyOn(VisualizationService, 'showBranchesTab');
  });

  afterEach(() => {
    hasCustomStepExtensionSpy.mockClear();
    supportsBranchingSpy.mockClear();
    showBranchesTabSpy.mockClear();
  });

  it('should disable branch tab for a step that has a CustomStepExtension', async () => {
    hasCustomStepExtensionSpy.mockReturnValue(true);
    supportsBranchingSpy.mockReturnValue(true);
    showBranchesTabSpy.mockReturnValue(true);

    const wrapper = render(<TestComponent step={kameletSourceStepStub} views={[]} />);
    const element = await wrapper.findByTestId('test-element');

    expect(element).toHaveAttribute('data-disable-branches-tab', 'true');
    expect(element).toHaveAttribute('data-disable-branches-tab-msg', 'Please click on the step to configure branches for it.');
  });

  it('should disable branch tab for a step that does not support branching', async () => {
    hasCustomStepExtensionSpy.mockReturnValue(false);
    supportsBranchingSpy.mockReturnValue(false);
    showBranchesTabSpy.mockReturnValue(true);

    const wrapper = render(<TestComponent step={kameletSourceStepStub} views={[]} />);
    const element = await wrapper.findByTestId('test-element');

    expect(element).toHaveAttribute('data-disable-branches-tab', 'true');
    expect(element).toHaveAttribute('data-disable-branches-tab-msg', 'This step doesn\'t support branching');
  });

  it('should disable branch tab for a step that has the maximum branches available', async () => {
    hasCustomStepExtensionSpy.mockReturnValue(false);
    supportsBranchingSpy.mockReturnValue(true);
    showBranchesTabSpy.mockReturnValue(false);

    const branches: IStepPropsBranch[] = [{ branchUuid: 'random-uuid', identifier: 'unique-id', steps: [] }];

    const wrapper = render(<TestComponent step={{ ...kameletSourceStepStub, branches }} views={[]} />);
    const element = await wrapper.findByTestId('test-element');

    expect(element).toHaveAttribute('data-disable-branches-tab', 'true');
    expect(element).toHaveAttribute('data-disable-branches-tab-msg', 'Max number of branches reached');
  });
});

function TestComponent(props: { step: IStepProps, views: IViewProps[] }) {
  const { disableBranchesTab, disableBranchesTabMsg } = useShowBranchTab(props.step, props.views);

  return (
    <p
      data-testid="test-element"
      data-disable-branches-tab={disableBranchesTab}
      data-disable-branches-tab-msg={disableBranchesTabMsg}
    >
      This demo component will hold all the values from the useShowBranchTab hook
    </p>
  );
}
