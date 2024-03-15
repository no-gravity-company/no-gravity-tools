const esbuild = require('esbuild');
const glob = require('tiny-glob');

function findCommonPath(componentPaths) {
    const separator = '/';
    let commonPrefix = '';
    const substrings = componentPaths.map((str) => str.split(separator));
    for (let i = 0; i < substrings[0].length; i++) {
        const substring = substrings[0][i];
        if (substrings.every((arr) => arr[i] === substring)) {
            commonPrefix += substring + separator;
        } else {
            break;
        }
    }
    return commonPrefix;
}

function getToolPath(childrenPath) {
    const parts = childrenPath.split('/');
    parts.pop();
    parts.pop();
    const newPath = parts.join('/');
    return newPath;
}

const getCommonOps = (toolsPaths) => {
    const ops = {
        entryNames: '[dir]/lib/index',
        entryPoints: toolsPaths,
        bundle: true,
        minify: true,
        outdir:
            toolsPaths.length === 1
                ? getToolPath(toolsPaths[0])
                : findCommonPath(toolsPaths),
        sourcemap: false,
        platform: 'node',
        target: 'esnext',
        format: 'esm',
        allowOverwrite: true,
        plugins: [],
        tsconfig: 'tsconfig.json',
    };
    return ops;
};

(async () => {
    let toolsPaths = await glob('packages/tools/**/src/index.ts');
    toolsPaths = toolsPaths.filter((path) => !path.includes('.spec.ts'));
    const buildOps = getCommonOps(toolsPaths);

    await esbuild.build(buildOps);
})();
