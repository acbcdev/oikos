import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: { layout: "centered" },
  decorators: [
    (Story) =>
      React.createElement(
        "div",
        { className: "w-72" },
        React.createElement(Story),
      ),
  ],
  argTypes: {
    size: {
      control: "select",
      options: ["default", "lg"],
    },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search"],
    },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Type something..." },
};

export const Large: Story = {
  args: { size: "lg", placeholder: "Type something..." },
};

export const AllSizes: Story = {
  render: () =>
    React.createElement(
      "div",
      { className: "flex flex-col gap-3 w-72" },
      React.createElement(Input, { placeholder: "Default (h-8)" }),
      React.createElement(Input, { size: "lg", placeholder: "Large (h-11)" }),
    ),
};

export const WithValue: Story = {
  args: { defaultValue: "john@example.com", type: "email" },
};

export const Password: Story = {
  args: { type: "password", placeholder: "Enter password" },
};

export const Disabled: Story = {
  args: { placeholder: "Disabled input", disabled: true },
};

export const Invalid: Story = {
  args: {
    defaultValue: "bad-value",
    "aria-invalid": true,
    placeholder: "Invalid input",
  },
};

export const WithLabel: Story = {
  render: () =>
    React.createElement(
      "div",
      { className: "flex flex-col gap-1.5" },
      React.createElement(
        "label",
        { className: "text-sm font-body text-muted-foreground" },
        "Email",
      ),
      React.createElement(Input, {
        type: "email",
        placeholder: "you@example.com",
      }),
    ),
};
