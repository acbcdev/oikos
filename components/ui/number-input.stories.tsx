import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NumberInput } from './number-input';

const meta = {
  title: 'UI/NumberInput',
  component: NumberInput,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => React.createElement('div', { className: 'w-64' }, React.createElement(Story)),
  ],
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'lg'],
    },
    disabled: { control: 'boolean' },
    prefix: { control: 'text' },
    step: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
  },
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled({ size, prefix, step, min, max, disabled, placeholder }: React.ComponentProps<typeof NumberInput>) {
  const [value, setValue] = useState('');
  return (
    <NumberInput
      size={size}
      prefix={prefix}
      step={step}
      min={min}
      max={max}
      disabled={disabled}
      placeholder={placeholder}
      value={value}
      onValueChange={setValue}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

export const Default: Story = {
  render: (args) => React.createElement(Controlled, { ...args, placeholder: '0' }),
};

export const Large: Story = {
  render: (args) => React.createElement(Controlled, { ...args, size: 'lg', placeholder: '0' }),
};

export const AllSizes: Story = {
  render: () => {
    const [v1, setV1] = useState('');
    const [v2, setV2] = useState('');
    return React.createElement(
      'div',
      { className: 'flex flex-col gap-3 w-64' },
      React.createElement(NumberInput, {
        placeholder: 'Default (h-8)',
        value: v1,
        onValueChange: setV1,
        onChange: (e) => setV1(e.target.value),
      }),
      React.createElement(NumberInput, {
        size: 'lg',
        placeholder: 'Large (h-11)',
        value: v2,
        onValueChange: setV2,
        onChange: (e) => setV2(e.target.value),
      }),
    );
  },
};

export const WithCurrencyPrefix: Story = {
  render: (args) => React.createElement(Controlled, { ...args, prefix: '$', placeholder: '0.00', step: 0.01 }),
};

export const WithPercentPrefix: Story = {
  render: (args) => React.createElement(Controlled, { ...args, prefix: '%', step: 0.1, min: 0, max: 100 }),
};

export const AtMaxBoundary: Story = {
  render: () =>
    React.createElement(NumberInput, {
      value: '100',
      min: 0,
      max: 100,
      prefix: '%',
      onValueChange: () => {},
      onChange: () => {},
    }),
};

export const Disabled: Story = {
  render: () =>
    React.createElement(NumberInput, {
      value: '42',
      disabled: true,
      prefix: '$',
      onValueChange: () => {},
      onChange: () => {},
    }),
};
