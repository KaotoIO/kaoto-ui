import { FlowsListEmptyState } from './FlowsListEmptyState';
import { render } from '@testing-library/react';

describe('FlowsListEmptyState.tsx', () => {
  it('should render the FlowsListEmptyState component', () => {
    const wrapper = render(<FlowsListEmptyState />);

    expect(wrapper.container).toMatchInlineSnapshot(`
      <div>
        <div
          class="pf-c-empty-state"
        >
          <div
            class="pf-c-empty-state__content"
          >
            <svg
              aria-hidden="true"
              class="pf-c-empty-state__icon"
              fill="currentColor"
              height="1em"
              role="img"
              style="vertical-align: -0.125em;"
              viewBox="0 0 512 512"
              width="1em"
            >
              <path
                d="M80 368H16a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16zm0-320H16A16 16 0 0 0 0 64v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16zm0 160H16a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16zm416 176H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z"
              />
            </svg>
            <h4
              class="pf-c-title pf-m-md"
              data-ouia-component-id="OUIA-Generated-Title-1"
              data-ouia-component-type="PF4/Title"
              data-ouia-safe="true"
            >
              There's no routes to show
            </h4>
            <div
              class="pf-c-empty-state__body"
            >
              You could create a new route using the New route button
            </div>
          </div>
        </div>
      </div>
    `);
  });
});
