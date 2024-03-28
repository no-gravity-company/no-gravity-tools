import {
  errorMessage,
  getKebabCase,
  getPackageJsonTemplate,
  getSCSSTemplate,
  getUnitTestsTemplate,
  getGitIgnoreTemplate,
  getComponentTemplateWithValues,
  getStoryTemplate,
  getTypesTemplate,
  getIntegrationTestsTemplate,
  createFile,
} from '../helpers';

import fs from 'fs';

describe('errorMessage', () => {
  it('should log error message and exit process', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

    errorMessage('Test Error Message');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Test Error Message');
    expect(processExitSpy).toHaveBeenCalledWith(1);

    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });
});

describe('getKebabCase', () => {
  it('should convert string to kebab case', () => {
    expect(getKebabCase('HelloWorld')).toBe('hello-world');
    expect(getKebabCase('hello_world')).toBe('hello-world');
    expect(getKebabCase('helloWorldTest')).toBe('hello-world-test');
  });
});

describe('getPackageJsonTemplate', () => {
  it('should generate a valid package.json template', () => {
    const kebabCase = 'test-component';
    const template = getPackageJsonTemplate(kebabCase);

    expect(template).toContain(`"name": "@no-gravity-elements/${kebabCase}"`);
    expect(template).toContain(`"main": "lib/index.js"`);
    expect(template).toContain(`"typings": "lib/index.ts"`);
  });
});

describe('getSCSSTemplate', () => {
  it('should generate a valid SCSS template', () => {
    const template = getSCSSTemplate();

    expect(template).toContain('@import');
    expect(template).toContain(':host');
  });
});

describe('getComponentTemplateWithValues', () => {
  it('should generate a valid component template with values', () => {
    const componentName = 'TestComponent';
    const template = getComponentTemplateWithValues(componentName);

    expect(template).toContain(`<Fragment></Fragment>`);
    expect(template).toContain(`FunctionComponent<${componentName}Props>`);
  });
});

describe('getGitIgnoreTemplate', () => {
  it('should generate a valid .gitignore template', () => {
    const template = getGitIgnoreTemplate();

    expect(template).toBe('lib');
  });
});

describe('getTypesTemplate', () => {
  it('should generate a valid types template', () => {
    const componentName = 'TestComponent';
    const template = getTypesTemplate(componentName);

    expect(template).toContain(`interface ${componentName}Props`);
  });
});

describe('getStoryTemplate', () => {
  it('should generate a valid story template', () => {
    const componentName = 'TestComponent';
    const kebabCase = 'test-component';
    const componentType = 'test';
    const template = getStoryTemplate(componentName, componentType);

    expect(template).toContain(`title: '${componentType}/${componentName}'`);
    expect(template).toContain(`<nge-${kebabCase} x=`);
  });
});

describe('getUnitTestsTemplate', () => {
  it('should generate a valid unit tests template', () => {
    const componentName = 'TestComponent';
    const template = getUnitTestsTemplate(componentName);

    expect(template).toContain(`describe('${componentName}'`);
    expect(template).toContain(
      `shallow(<${componentName} x='test'>Test</${componentName}>)`
    );
  });
});

describe('getIntegrationTestsTemplate', () => {
  it('should generate a valid integration tests template', () => {
    const componentName = 'TestComponent';
    const kebabCase = 'test-component';
    const componentType = 'test';
    const template = getIntegrationTestsTemplate(componentName, componentType);

    expect(template).toContain(`context('${componentName}'`);
    expect(template).toContain(`cy.get('nge-${kebabCase}')`);
  });
});

describe('createFile function', () => {
  beforeEach(() => {
    jest.mock('path', () => ({
      join: jest.fn((basePath, fileName) => `${basePath}/${fileName}`),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a file with correct content', async () => {
    const writeFileMock = jest
      .spyOn(fs.promises, 'writeFile')
      .mockImplementation(() => Promise.resolve());

    const basePath = '/some/base/path';
    const fileName = 'testFile.js';
    const templateGenerator = jest.fn((name, type) => `// ${name} - ${type}`);
    const component = { name: 'TestComponent', type: 'functional' };
    const expectedContent = '// TestComponent - functional';
    const expectedPath = `${basePath}/${fileName}`;

    await createFile({ basePath, fileName, templateGenerator, component });
    expect(writeFileMock).toHaveBeenCalledWith(expectedPath, expectedContent, {
      encoding: 'utf-8',
    });
    writeFileMock.mockRestore();
  });

  it('should not create a file if fileName or templateGenerator is not provided', async () => {
    const writeFileMock = jest
      .spyOn(fs.promises, 'writeFile')
      .mockImplementation(() => Promise.resolve());

    const basePath = '/some/base/path';
    const fileName = '';
    const templateGenerator = jest.fn();
    const component = { name: 'TestComponent', type: 'functional' };

    await createFile({ basePath, fileName, templateGenerator, component });
    expect(writeFileMock).not.toHaveBeenCalled();
    writeFileMock.mockRestore();
  });
});
