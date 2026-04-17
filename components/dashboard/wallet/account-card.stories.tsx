import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AccountCard } from './account-card';
import type { Account } from '@/lib/data/wallet';

// Zustand stores are module singletons — no provider needed.
// They initialize with default state and work as-is in Storybook.

const meta = {
  title: 'Dashboard/Wallet/AccountCard',
  component: AccountCard,
  parameters: { layout: 'centered' },
  args: { onDeleteRequest: () => {} },
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
  monthlyChange: 1230.5,
};

const savings: Account = {
  id: 'acc-2',
  name: 'Ally Savings',
  institution: 'Ally',
  type: 'savings',
  currency: 'USD',
  balance: 34890.0,
  apy: 4.5,
};

const brokerage: Account = {
  id: 'acc-3',
  name: 'Fidelity Brokerage',
  institution: 'Fidelity',
  type: 'brokerage',
  currency: 'USD',
  balance: 89230.12,
  dailyChange: -345.67,
};

export const Checking: Story = {
  args: { account: checking },
};

export const Savings: Story = {
  args: { account: savings },
};

export const Brokerage: Story = {
  args: { account: brokerage },
};

export const BrokeragePositiveDay: Story = {
  args: { account: { ...brokerage, dailyChange: 512.34 } },
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
