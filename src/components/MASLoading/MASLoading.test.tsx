import React from 'react';
import { render, screen } from '@testing-library/react';
import { MASLoading } from './MASLoading';

describe('<MASLoading/>', () => {
  it('should render default MASLoading', () => {
    //arrange
    render(<MASLoading />);

    //assert
    screen.getByRole('progressbar');
  });

  it('should render MASLoading with bullseyeProps props', () => {
    //arrange
    const { container } = render(
      <MASLoading
        bullseyeProps={{ className: 'test-class', component: 'span' }}
      />
    );

    //assert
    screen.getByRole('progressbar');
    expect(container.getElementsByClassName('test-class').length).toBe(1);
  });

  it('should render MASLoading with bullseyeProps and spinnerProps props', () => {
    //arrange
    const { container } = render(
      <MASLoading
        bullseyeProps={{ className: 'test-class', component: 'span' }}
        spinnerProps={{ className: 'spinner-class', size: 'sm' }}
      />
    );

    //assert
    screen.getByRole('progressbar');
    expect(container.getElementsByClassName('test-class').length).toBe(1);
    expect(container.getElementsByClassName('spinner-class').length).toBe(1);
    //check spinner size i.e. 'sm'
    expect(container.getElementsByClassName('pf-m-sm').length).toBe(1);
  });
});
