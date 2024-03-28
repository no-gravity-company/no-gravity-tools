import * as fsp from 'fs/promises';
import * as path from 'path';
import {
  errorMessage,
  getComponentTemplateWithValues,
  getGitIgnoreTemplate,
  getPackageJsonTemplate,
  getTypesTemplate,
  getStoryTemplate,
  getUnitTestsTemplate,
  getIntegrationTestsTemplate,
  getSCSSTemplate,
  createFile,
} from './helpers';
import { CreateFileData } from './types';

export const main = async (): Promise<void> => {
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
    const componentFolderPath = path.join(
      'packages',
      'components',
      componentTypeValue,
      componentNameValue
    );

    const commonFileData: CreateFileData = {
      basePath: componentFolderPath,
      component: {
        name: componentNameValue,
        type: componentTypeValue,
      },
    };

    // TODO: use try and catch in case the component already exists
    await fsp.mkdir(componentFolderPath);
    // Component .tsx file
    createFile({
      ...commonFileData,
      fileName: `${componentNameValue}.tsx`,
      templateGenerator: getComponentTemplateWithValues,
    });
    // .gitignore
    createFile({
      ...commonFileData,
      fileName: '.gitignore',
      templateGenerator: getGitIgnoreTemplate,
    });
    // package.json
    createFile({
      ...commonFileData,
      fileName: 'package.json',
      templateGenerator: getPackageJsonTemplate,
    });
    // types
    const typesFolderPath = path.join(componentFolderPath, 'types');
    await fsp.mkdir(typesFolderPath);
    createFile({
      ...commonFileData,
      basePath: typesFolderPath,
      fileName: 'index.ts',
      templateGenerator: getTypesTemplate,
    });
    // story
    createFile({
      ...commonFileData,
      fileName: `${componentNameValue}.stories.tsx`,
      templateGenerator: getStoryTemplate,
    });
    // unit tests
    createFile({
      ...commonFileData,
      fileName: `${componentNameValue}.spec.tsx`,
      templateGenerator: getUnitTestsTemplate,
    });
    // integration-tests
    createFile({
      ...commonFileData,
      fileName: `${componentNameValue}.integration.spec.ts`,
      templateGenerator: getIntegrationTestsTemplate,
    });
    // scss
    createFile({
      ...commonFileData,
      fileName: `${componentNameValue}.modules.scss`,
      templateGenerator: getSCSSTemplate,
    });
  }
};

main();
