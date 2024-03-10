import * as fsp from 'fs/promises';
import * as path from 'path';

const errorMessage = (message: string) => {
    console.error(message);
    process.exit(1);
};

const getKebabCase = (name: string) => {
    return name
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLocaleLowerCase();
};

const getComponentTemplateWithValues = (componentName: string): string => {
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

const getGitIgnoreTemplate = (): string => {
    return 'lib';
};

const getPackageJsonTemplate = (kebabCase: string): string => {
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

const getTypesTemplate = (componentName: string): string => {
    return `export interface ${componentName}Props {
    x: string;
}
    `;
};

const getStoryTemplate = (
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
  title: '${componentName}',
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

const getUnitTestsTemplate = (
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

const getIntegrationTestsTemplate = (
    componentName: string,
    kebabCase: string
): string => {
    const lowerCaseName = componentName.toLowerCase();
    return `/// <reference types="cypress" />

context('${componentName}', () => {
    beforeEach(() => {
        cy.visit('/iframe.html?args=&id=${lowerCaseName}--default&viewMode=story');
    });

    it('should check if <nge-${kebabCase}> is present in the dom', () => {
        cy.get('nge-${kebabCase}').should('be.visible');
    });
});
    `;
};

const main = async (): Promise<void> => {
    // Checks for --type and if it has a value
    const componentTypeIndex = process.argv.indexOf('--type');
    let componentTypeValue = '';

    if (componentTypeIndex > -1) {
        // Retrieve the value after --type
        componentTypeValue = process.argv[componentTypeIndex + 1];
        !componentTypeValue && errorMessage('No component type was provided');
    } else {
        errorMessage('No --type flag was provided');
    }

    // Checks for --name and if it has a value
    const componentNameIndex = process.argv.indexOf('--name');
    let componentNameValue = '';

    if (componentNameIndex > -1) {
        // Retrieve the value after --name
        componentNameValue = process.argv[componentNameIndex + 1];
        !componentNameValue && errorMessage('No component name was provided');
        // create component tsx file
        const componentFolderPath = path.join(
            'packages',
            'components',
            componentTypeValue,
            componentNameValue
        );
        const kebabCase = getKebabCase(componentNameValue);

        // TODO: use try and catch in case the component already exists
        await fsp.mkdir(componentFolderPath);
        // Component .tsx file
        const componentFilePath = path.join(
            componentFolderPath,
            `${componentNameValue}.tsx`
        );
        const interpolation =
            getComponentTemplateWithValues(componentNameValue);
        await fsp.writeFile(componentFilePath, interpolation, {
            encoding: 'utf-8',
        });
        // .gitignore
        const gitIgnorePath = path.join(componentFolderPath, '.gitignore');
        const gitIgnoreTemplate = getGitIgnoreTemplate();
        await fsp.writeFile(gitIgnorePath, gitIgnoreTemplate, {
            encoding: 'utf-8',
        });
        // package.json
        const packageJsonPath = path.join(componentFolderPath, 'package.json');
        const packageJsonTemplate = getPackageJsonTemplate(kebabCase);
        await fsp.writeFile(packageJsonPath, packageJsonTemplate, {
            encoding: 'utf-8',
        });
        // types
        const typesFolderPath = path.join(componentFolderPath, 'types');
        await fsp.mkdir(typesFolderPath);
        const typesPath = path.join(typesFolderPath, 'index.ts');
        const typesTemplate = getTypesTemplate(componentNameValue);
        await fsp.writeFile(typesPath, typesTemplate, { encoding: 'utf-8' });
        // story
        const storyPath = path.join(
            componentFolderPath,
            `${componentNameValue}.stories.tsx`
        );
        const storyTemplate = getStoryTemplate(
            componentNameValue,
            kebabCase,
            componentTypeValue
        );
        await fsp.writeFile(storyPath, storyTemplate, { encoding: 'utf-8' });
        // unit tests
        const unitTestsPath = path.join(
            componentFolderPath,
            `${componentNameValue}.spec.tsx`
        );
        const unitTestsTemplate = getUnitTestsTemplate(
            componentNameValue,
            componentTypeValue
        );
        await fsp.writeFile(unitTestsPath, unitTestsTemplate, {
            encoding: 'utf-8',
        });
        // integration-tests
        const integrationTestsPath = path.join(
            componentFolderPath,
            `${componentNameValue}.integration.spec.ts`
        );
        const integrationTestsTemplate = getIntegrationTestsTemplate(
            componentNameValue,
            kebabCase
        );
        await fsp.writeFile(integrationTestsPath, integrationTestsTemplate, {
            encoding: 'utf-8',
        });
    }
};

main();
