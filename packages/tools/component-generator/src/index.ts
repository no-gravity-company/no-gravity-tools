import * as fsp from 'fs/promises';
import * as path from 'path';
import {
    errorMessage,
    getKebabCase,
    getComponentTemplateWithValues,
    getGitIgnoreTemplate,
    getPackageJsonTemplate,
    getTypesTemplate,
    getStoryTemplate,
    getUnitTestsTemplate,
    getIntegrationTestsTemplate,
    getSCSSTemplate,
} from './helpers';

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
            kebabCase,
            componentTypeValue
        );
        await fsp.writeFile(integrationTestsPath, integrationTestsTemplate, {
            encoding: 'utf-8',
        });
        // scss
        const scssPath = path.join(
            componentFolderPath,
            `${componentNameValue}.modules.scss`
        );
        const scssTemplate = getSCSSTemplate();
        await fsp.writeFile(scssPath, scssTemplate, {
            encoding: 'utf-8',
        });
    }
};

main();
