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

const getPackageJsonTemplate = (componentName: string): string => {
  const kebabCase = getKebabCase(componentName);
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
    // TODO: use try and catch in case the component already exists
    await fsp.mkdir(componentFolderPath);
    // Component .tsx file
    const componentFilePath = path.join(
      componentFolderPath,
      `${componentNameValue}.tsx`
    );
    const interpolation = getComponentTemplateWithValues(componentNameValue);
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
    const packageJsonTemplate = getPackageJsonTemplate(componentNameValue);
    await fsp.writeFile(packageJsonPath, packageJsonTemplate, {
      encoding: 'utf-8',
    });
    // types
    const typesFolderPath = path.join(componentFolderPath, 'types');
    await fsp.mkdir(typesFolderPath);
    const typesPath = path.join(typesFolderPath, 'index.ts');
    const typesTemplate = getTypesTemplate(componentNameValue);
    await fsp.writeFile(typesPath, typesTemplate, { encoding: 'utf-8' });

    // TODO: unit-tests
    // TODO: integration-tests
  }
};

main();
