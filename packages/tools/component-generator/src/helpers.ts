import * as path from 'path';
import * as fsp from 'fs/promises';
import { CreateFileData } from './types';

export const errorMessage = (message: string) => {
  console.error(message);
  process.exit(1);
};

export const getKebabCase = (name: string) => {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLocaleLowerCase();
};

export const getComponentTemplateWithValues = (
  componentName: string
): string => {
  return `import { Fragment, FunctionComponent, h } from 'preact';
import { ${componentName}Props } from './types'

const ${componentName}: FunctionComponent<${componentName}Props> = ({ x }: ${componentName}Props) => {
    return (
        <Fragment></Fragment>
    );
};

export default ${componentName};
`;
};

export const getGitIgnoreTemplate = (): string => {
  return 'lib';
};

export const getPackageJsonTemplate = (componentName: string): string => {
  const kebabCase = getKebabCase(componentName);
  return `{
    "name": "@no-gravity-elements/${kebabCase}",
    "version": "1.0.0",
    "description": "No Gravity Element",
    "author": "No Gravity Company",
    "private": false,
    "homepage": "https://github.com/no-gravity-company/no-gravity-elements#readme",
    "license": "ISC",
    "main": "lib/index.js",
    "typings": "lib/index.ts",
    "directories": {
      "lib": "lib"
    },
    "files": [
      "lib/index.js",
      "lib/index.js.map",
      "types/index.ts"
    ],
    "repository": {
      "type": "git",
      "url": "git+https://github.com/no-gravity-company/no-gravity-elements.git"
    },
    "scripts": {
      "publish-component": "yarn publish --access=public"
    },
    "bugs": {
      "url": "https://github.com/no-gravity-company/no-gravity-elements/issues"
    }
  }
    `;
};

export const getTypesTemplate = (componentName: string): string => {
  return `export interface ${componentName}Props {
    x: string;
}
    `;
};

export const getStoryTemplate = (
  componentName: string,
  componentType: string
): string => {
  const kebabCase = getKebabCase(componentName);
  return `import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit-html';

import { ${componentName}Props } from './types';

import '@no-gravity-elements/${kebabCase}';

type CustomArgs = ${componentName}Props & { text: string };

const meta: Meta<CustomArgs> = {
  title: '${componentType}/${componentName}',
  component: 'nge-${kebabCase}',
  parameters: {
    webComponents: {
      tagName: 'nge-${kebabCase}',
    },
  },
  argTypes: {
    x: {
      description: 'Custom prop text',
      control: { type: 'text' },
    },
    text: {
      description: 'Custom text',
      control: { type: 'text' },
    },
  },
  render: ({ x, text }) => html\` <nge-${kebabCase} x=\${x}>\${text}</nge-${kebabCase}> \`,
};

export default meta;
type Story = StoryObj<CustomArgs>;

export const Default: Story = {
  args: {
    text: 'Text',
    x: 'props'
  },
};
`;
};

export const getUnitTestsTemplate = (componentName: string): string => {
  return `import { h } from 'preact';
import { shallow } from 'enzyme';

import ${componentName} from './${componentName}';

describe('${componentName}', () => {
  it('should match the snapshot', () => {
    const wrapper = shallow(<${componentName} x='test'>Test</${componentName}>);
    expect(wrapper).toMatchSnapshot();
  });
});`;
};

export const getIntegrationTestsTemplate = (
  componentName: string,
  componentType: string
): string => {
  const lowerCaseName = componentName.toLowerCase();
  const kebabCase = getKebabCase(componentName);
  return `/// <reference types="cypress" />

context('${componentName}', () => {
    beforeEach(() => {
        cy.visit('/iframe.html?args=&id=${componentType}-${lowerCaseName}--default&viewMode=story');
    });

    it('should check if <nge-${kebabCase}> is present in the dom', () => {
        cy.get('nge-${kebabCase}').should('be.visible');
    });
});
    `;
};

export const getSCSSTemplate = (): string => {
  return `@import '../../../stylesheets/base/variables';
:host {

}
`;
};

export const createFile = async ({
  basePath,
  fileName,
  templateGenerator,
  component,
}: CreateFileData) => {
  if (!fileName || !templateGenerator) return;
  const newPath = path.join(basePath, fileName);
  const templateContent = templateGenerator(component.name, component.type);
  await fsp.writeFile(newPath, templateContent, {
    encoding: 'utf-8',
  });
};
