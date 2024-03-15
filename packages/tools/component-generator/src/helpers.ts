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

export const getPackageJsonTemplate = (kebabCase: string): string => {
    return `{
    "name": "@no-gravity-elements/${kebabCase}",
    "version": "1.0.0",
    "description": "No Gravity Element",
    "author": "No Gravity Team",
    "private": false,
    "homepage": "https://github.com/no-gravity-company/no-gravity-elements#readme",
    "license": "ISC",
    "main": "lib/index.js",
    "typings": "lib/index.d.ts",
    "directories": {
      "lib": "lib"
    },
    "files": [
      "lib/index.js",
      "lib/index.js.map",
      "types/index.d.ts"
    ],
    "repository": {
      "type": "git",
      "url": "git+https://github.com/no-gravity-company/no-gravity-elements.git"
    },
    "scripts": {
      "build": "tsc --jsx react --emitDeclarationOnly --esModuleInterop --module ESNext --target ESNext --moduleResolution node --declaration --declarationDir ./lib/types src/*.ts && esbuild src/index.ts --bundle --outfile=lib/index.js --platform=node --target=es2018 --minify --sourcemap --external:react --external:react-dom",
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
    kebabCase: string,
    componentType: string
): string => {
    return `import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit-html';

import { ${componentName}Props } from '@${componentType}/${componentName}/types';

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

export const getUnitTestsTemplate = (
    componentName: string,
    componentType: string
): string => {
    return `import { h } from 'preact';
import { shallow } from 'enzyme';

import ${componentName} from '@${componentType}/${componentName}/${componentName}';

describe('${componentName}', () => {
  it('should match the snapshot', () => {
    const wrapper = shallow(<${componentName} x='test'>Test</${componentName}>);
    expect(wrapper).toMatchSnapshot();
  });
});`;
};

export const getIntegrationTestsTemplate = (
    componentName: string,
    kebabCase: string,
    componentType: string
): string => {
    const lowerCaseName = componentName.toLowerCase();
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
