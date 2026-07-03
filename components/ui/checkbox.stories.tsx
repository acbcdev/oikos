import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox } from "./checkbox";

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox /> Unchecked
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox defaultChecked /> Checked
      </label>
      <label className="flex items-center gap-2 text-sm opacity-50">
        <Checkbox disabled /> Disabled
      </label>
    </div>
  ),
};
