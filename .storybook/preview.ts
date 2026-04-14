import React from 'react';
import type { Preview } from '@storybook/nextjs-vite';
import '../app/globals.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0B0F19' }],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  decorators: [
    (Story) => {
      document.documentElement.classList.add('dark');
      document.documentElement.style.setProperty('--font-space-grotesk', 'system-ui, sans-serif');
      document.documentElement.style.setProperty('--font-outfit', 'system-ui, sans-serif');
      document.body.style.fontFamily = 'var(--font-outfit), system-ui, sans-serif';
      return React.createElement(Story);
    },
  ],
};

export default preview;
