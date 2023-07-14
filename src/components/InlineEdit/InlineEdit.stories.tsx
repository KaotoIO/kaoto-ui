import { InlineEdit } from './InlineEdit';
import { minLengthValidator } from './min-length-validator';
import { Card, CardBody, CardFooter, CardTitle } from '@patternfly/react-core';
import { useArgs } from '@storybook/preview-api';
import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps, useState } from 'react';

export default {
  title: 'InlineEdit/InlineEdit',
  component: InlineEdit,
  decorators: [
    (Story) => (
      <div style={{ margin: '3em' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {},
} as Meta<typeof InlineEdit>;

const T1: StoryFn<typeof InlineEdit> = (args) => {
  const [localValue, setLocalValue] = useState(args.value);

  return (
    <Card>
      <CardTitle>Inline Edit</CardTitle>
      <CardBody>
        <InlineEdit
          {...args}
          value={args.value ?? localValue}
          onChange={args.onChange ?? setLocalValue}
        />
      </CardBody>
      <CardFooter></CardFooter>
    </Card>
  );
};
export const Default = T1.bind({});
Default.args = {
  value: 'This is an editable text',
};

const T2: StoryFn<typeof InlineEdit> = (_) => {
  const [{ value }, updateArgs] = useArgs<ComponentProps<typeof InlineEdit>>();

  return (
    <Card>
      <CardTitle>Inline Edit</CardTitle>
      <CardBody>
        <InlineEdit
          value={value}
          onChange={(value) => {
            updateArgs({ value });
          }}
          onClick={() => {
            alert('Clicked');
          }}
        />
      </CardBody>
      <CardFooter></CardFooter>
    </Card>
  );
};
export const Clickable = T2.bind({});
Clickable.args = {
  value: 'This is an editable text',
};

const T3: StoryFn<typeof InlineEdit> = (args) => {
  const [_, updateArgs] = useArgs<ComponentProps<typeof InlineEdit>>();

  return (
    <Card>
      <CardTitle>Inline Edit</CardTitle>
      <CardBody>
        <p>The text should be at least 5 characters long</p>
        <InlineEdit
          {...args}
          onChange={(value) => {
            updateArgs({ value });
          }}
        />
      </CardBody>
      <CardFooter></CardFooter>
    </Card>
  );
};
export const Validator = T3.bind({});
Validator.args = {
  value: 'This is a text',
  validator: minLengthValidator,
};
