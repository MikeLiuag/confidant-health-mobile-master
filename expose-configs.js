const fs = require('fs');
const os = require("os");
const path = require("path");

const envFilePath = path.resolve(__dirname, ".env");
const readEnvVars = () => fs.readFileSync(envFilePath, "utf-8").split(os.EOL);
const cliArgs = process.argv.slice(2);
const profile = cliArgs[0];
const configFile = cliArgs[1];
const json = JSON.parse(fs.readFileSync(configFile));

function extractDynamicConfigurations (remoteConfig) {
    if(remoteConfig) {
        let propertySources = remoteConfig.propertySources;
        if(propertySources && propertySources.length>0) {
            const appConfigSource = propertySources.find(propSource=>propSource.name &&
                (propSource.name.includes('confidant-health-mobile') || propSource.name.includes('confidant-health-provider')));
            if(appConfigSource) {
                return appConfigSource.source;
            }
        }
    }
    return null;
}

function setEnvValue (key, value) {
    const envVars = readEnvVars();
    const targetLine = envVars.find((line) => line.split("=")[0] === key);
    if (targetLine !== undefined) {
        // update existing line
        const targetLineIndex = envVars.indexOf(targetLine);
        // replace the key/value with the new value
        envVars.splice(targetLineIndex, 1, `${key}="${value}"`);
    } else {
        // create new key value
        envVars.push(`${key}="${value}"`);
    }
    // write everything back to the file system
    fs.writeFileSync(envFilePath, envVars.join(os.EOL));
}
const appConfig = extractDynamicConfigurations(json);
setEnvValue('REACT_APP_ENVIRONMENT',profile);
setEnvValue('BRANCH_KEY',appConfig['branch.key']);
setEnvValue('INSTABUG_TOKEN',appConfig['instabug.token']);
console.log('Environment variables set');
