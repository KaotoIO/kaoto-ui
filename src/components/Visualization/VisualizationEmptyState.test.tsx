import { VisualizationEmptyState } from './VisualizationEmptyState';
import { IVisibleFlowsInformation } from '@kaoto/types';
import { render } from '@testing-library/react';

describe('VisualizationEmptyState.tsx', () => {
  const visibleFlowsInformation: IVisibleFlowsInformation = {
    singleFlowId: 'flow-id',
    visibleFlowsCount: 1,
    totalFlowsCount: 10,
    isCanvasEmpty: false,
  };

  describe('when there are no routes', () => {
    const flowsInfoNoRoutes: IVisibleFlowsInformation = {
      ...visibleFlowsInformation,
      totalFlowsCount: 0,
    };

    it('should render the CubesIcon whenever there are no routes', () => {
      const wrapper = render(
        <VisualizationEmptyState visibleFlowsInformation={flowsInfoNoRoutes} />,
      );

      const icon = wrapper.getByTestId('cubes-icon');

      expect(icon).toBeInTheDocument();
    });

    it('should state that there are no routes', () => {
      const wrapper = render(
        <VisualizationEmptyState visibleFlowsInformation={flowsInfoNoRoutes} />,
      );

      const noRoutesTitle = wrapper.getByText('There are no routes defined');
      const noRoutesSuggestion = wrapper.getByText(
        'You can create a new route using the New route button',
      );

      expect(noRoutesTitle).toBeInTheDocument();
      expect(noRoutesSuggestion).toBeInTheDocument();
    });
  });

  describe('when there are routes but they are not visible', () => {
    const flowsInfoNoVisibleRoutes: IVisibleFlowsInformation = {
      ...visibleFlowsInformation,
      visibleFlowsCount: 0,
    };

    it('should render the EyeSlashIcon whenever there are no routes', () => {
      const wrapper = render(
        <VisualizationEmptyState visibleFlowsInformation={flowsInfoNoVisibleRoutes} />,
      );

      const icon = wrapper.getByTestId('eye-slash-icon');

      expect(icon).toBeInTheDocument();
    });

    it('should state that there are no visible routes', () => {
      const wrapper = render(
        <VisualizationEmptyState visibleFlowsInformation={flowsInfoNoVisibleRoutes} />,
      );

      const noRoutesTitle = wrapper.getByText('There are no visible routes');
      const noRoutesSuggestion = wrapper.getByText(
        'You can toggle the visibility of a route by using Routes list',
      );

      expect(noRoutesTitle).toBeInTheDocument();
      expect(noRoutesSuggestion).toBeInTheDocument();
    });
  });
});
