import { JsonSchemaConfigurator } from '@kaoto/components';
import { act, fireEvent, render } from '@testing-library/react';
import { AlertProvider } from '../layout';
import { debeziumMongoDBStep } from '../stubs';
import { VisualizationStepViews } from './VisualizationStepViews';

jest.mock('@kaoto/components', () => {
  const actual = jest.requireActual('@kaoto/components');

  const JsonSchemaConfiguratorMock: typeof JsonSchemaConfigurator = (props) => (<>
    <p>JsonSchemaConfigurator mock</p>
    <button data-testid="triggerOnChangeModel" onClick={() => { props.onChangeModel(props.schema.properties, true); } }>
      Click to trigger onChangeModel
    </button>
  </>);

  return {
    ...actual,
    JsonSchemaConfigurator: JsonSchemaConfiguratorMock,
  }
});

describe('VisualizationStepViews', () => {
  const step = { ...debeziumMongoDBStep, icon: '' };
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('component renders', () => {
    const wrapper = render(
      <AlertProvider>
        <VisualizationStepViews
          isPanelExpanded={true}
          onClosePanelClick={jest.fn()}
          saveConfig={jest.fn()}
          step={step}
        />
      </AlertProvider>
    );

    const element = wrapper.queryByTestId('detailsTab');
    expect(element).toBeInTheDocument();
  });

  test('saveConfig should be used when the model changes', async () => {
    const saveConfigSpy = jest.fn();

    const wrapper = render(
      <AlertProvider>
        <VisualizationStepViews
          isPanelExpanded={true}
          onClosePanelClick={jest.fn()}
          saveConfig={saveConfigSpy}
          step={step}
        />
      </AlertProvider>
    );

    const changeModelTrigger = await wrapper.findByTestId('triggerOnChangeModel');
    act(() => {
      fireEvent.click(changeModelTrigger);
      jest.runAllTimers();
    });

    expect(saveConfigSpy).toHaveBeenCalled();
  });

  test('saveConfig should be debounced', async () => {
    const saveConfigSpy = jest.fn();

    const wrapper = render(
      <AlertProvider>
        <VisualizationStepViews
          isPanelExpanded={true}
          onClosePanelClick={jest.fn()}
          saveConfig={saveConfigSpy}
          step={step}
        />
      </AlertProvider>
    );

    const changeModelTrigger = await wrapper.findByTestId('triggerOnChangeModel');
    act(() => {
      fireEvent.click(changeModelTrigger);
      fireEvent.click(changeModelTrigger);
      fireEvent.click(changeModelTrigger);
      fireEvent.click(changeModelTrigger);
      fireEvent.click(changeModelTrigger);

      expect(saveConfigSpy).not.toHaveBeenCalled();

      jest.advanceTimersByTime(400);
      expect(saveConfigSpy).not.toHaveBeenCalled();

      jest.runAllTimers();
      expect(saveConfigSpy).toHaveBeenCalledTimes(1);
    });

    act(() => {
      fireEvent.click(changeModelTrigger);

      jest.advanceTimersByTime(1_000);
      expect(saveConfigSpy).toHaveBeenCalledTimes(2);
    });
  });

});
