import React from 'react';

import Label from '../Label';

export default {
  title: 'Input/Label',
  component: Label,
  argTypes: {
  }
};

const Template = (args) => <Label {...args} />;


export const Optional = Template.bind({});
Optional.args = {
  text: "Sample Input",
  id: "optional_id"
};
export const Required = Template.bind({});
Required.args = {
  mandatory: true,

};