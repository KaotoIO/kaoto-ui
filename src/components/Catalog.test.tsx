import { AlertProvider } from '../layout';
import { Catalog } from './Catalog';
import { jest } from '@jest/globals';
import { fetchCatalogSteps } from '@kaoto/api';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@kaoto/api');
const mockedValue = [
  {
    name: 'end-step',
    type: 'END',
    id: 'aggregate',
    kind: 'EIP',
    icon: 'icon',
    title: 'Aggregate',
    description:
      'The Aggregator from the EIP patterns allows you to combine a number of messages together into a single message.',
    group: 'Knative',
    minBranches: 0,
    maxBranches: 0,
    UUID: null,
  },
  {
    name: 'claim-check',
    type: 'MIDDLE',
    id: 'claim-check',
    kind: 'EIP',
    icon: 'icon',
    title: 'Claim Check',
    description:
      'The Claim Check from the EIP patterns allows you to replace message content with a claim check (a unique key), which can be used to retrieve the message content at a later time.',
    group: 'Knative',
    minBranches: 0,
    maxBranches: 0,
    UUID: null,
  },
  {
    name: 'start-step',
    type: 'START',
    id: 'start',
    kind: 'Start-step-kind',
    icon: 'icon',
    title: 'Start-step',
    description: 'Kubernetes resource whose URL can be retrieved by reading its status.address.url',
    group: 'start-step-group',
    minBranches: 0,
    maxBranches: 0,
    UUID: null,
  },
  {
    name: 'unmarshal',
    type: 'MIDDLE',
    id: 'unmarshal',
    kind: 'EIP',
    icon: 'icon',
    title: 'Unmarshal',
    description:
      'Transforms data in some binary or textual format (such as received over the network) into a Java object; or some other representation according to the data format being used.',
    group: 'Knative',
    minBranches: 0,
    maxBranches: 0,
    UUID: null,
  },
];

let method: jest.Mock<typeof fetchCatalogSteps>;
describe('Catalog.tsx', () => {
  const user = userEvent.setup();
  beforeAll(() => {
    method = (fetchCatalogSteps as jest.Mock<typeof fetchCatalogSteps>).mockResolvedValue(
      mockedValue
    );
  });

  test('component renders correctly', async () => {
    render(
      <AlertProvider>
        <Catalog handleClose={jest.fn()} />
      </AlertProvider>
    );
    //test if mocked method have been called
    expect(method).toHaveBeenCalled();
    //find the start-step
    let element = await screen.findByText('start-step');
    expect(element).toBeInTheDocument();

    element = await screen.findByText('actions');
    expect(element).toBeInTheDocument();
    user.click(element);

    element = await screen.findByText('claim-check');
    expect(element).toBeInTheDocument();

    element = await screen.findByText('end');
    expect(element).toBeInTheDocument();
    user.click(element);

    element = await screen.findByText('end-step');
    expect(element).toBeInTheDocument();
  });

  test('Search input works correctly', async () => {
    const user = userEvent.setup();
    render(
      <AlertProvider>
        <Catalog handleClose={jest.fn()} />
      </AlertProvider>
    );

    expect(method).toHaveBeenCalled();

    let element = await screen.findByText('actions');
    expect(element).toBeInTheDocument();
    await user.click(element);

    await user.click(screen.getByPlaceholderText('search for a step...'));
    await user.keyboard('unmar');

    expect(screen.queryByText('claim-check')).not.toBeInTheDocument();
    expect(screen.getByText('unmarshal')).toBeInTheDocument();
  });

  test('Alert is fired when there is an error with fetching', async () => {
    jest.spyOn(console, 'error').mockImplementationOnce(() => {
      return;
    });
    method = (fetchCatalogSteps as jest.Mock<typeof fetchCatalogSteps>).mockImplementation(() =>
      Promise.reject('fail')
    );
    render(
      <AlertProvider>
        <Catalog handleClose={jest.fn()} />
      </AlertProvider>
    );

    expect(method).toHaveBeenCalled();
    expect(
      await screen.findByText(
        'There was a problem fetching the catalog steps. Please try again later.'
      )
    ).toBeInTheDocument();
  });
});
