import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AccountCard } from './account-card';
import type { Account } from '@/lib/data/wallet';

const meta = {
  title: 'Dashboard/Wallet/AccountCard',
  component: AccountCard,
  parameters: { layout: 'centered' },
  args: { onDeleteRequest: () => {}, isSelected: false, toggleAccount: () => {} },
  decorators: [
    (Story) => React.createElement('div', { className: 'w-72' }, React.createElement(Story)),
  ],
} satisfies Meta<typeof AccountCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const checking: Account = {
  id: 'acc-1',
  name: 'Chase Checking',
  institution: 'Chase',
  type: 'checking',
  currency: 'USD',
  balance: 12450.75,
};

const savings: Account = {
  id: 'acc-2',
  name: 'Ally Savings',
  institution: 'Ally',
  type: 'savings',
  currency: 'USD',
  balance: 34890.0,
};

const investment: Account = {
  id: 'acc-3',
  name: 'Fidelity Investment',
  institution: 'Fidelity',
  type: 'investment',
  currency: 'USD',
  balance: 89230.12,
};

export const Checking: Story = {
  args: { account: checking },
};

export const Savings: Story = {
  args: { account: savings },
};

export const Investment: Story = {
  args: { account: investment },
};

export const Minimal: Story = {
  args: {
    account: {
      id: 'acc-4',
      name: 'Basic',
      institution: 'Bank',
      type: 'checking',
      currency: 'USD',
      balance: 0,
    },
  },
};
