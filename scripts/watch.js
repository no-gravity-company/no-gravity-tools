const chokidar = require('chokidar');
const { exec } = require('child_process');

const compileFile = async (filePath) => {
    console.log(`Detected change in ${filePath}, rebuilding...`);
    exec('yarn compile', (error, stdout, stderr) => {
        if (error) {
            console.error(`Rebuild of ${path} failed: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Rebuild of ${path} failed: ${error.message}`);
            return;
        }
        console.log(`stdout:\n${stdout}`);
        console.log(`Rebuild of ${filePath} succeeded!`);
    });
};

(async () => {
    const watcher = chokidar.watch([
        'packages/tools/**/*.ts',
        '!packages/tools/**/lib',
    ]);
    watcher.on('change', compileFile);
})();
