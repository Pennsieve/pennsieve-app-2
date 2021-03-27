#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const user = {
    EMAIL: process.env.E2E_EMAIL,
    PASSWORD: process.env.E2E_PASSWORD,
    ORG_ID: process.env.E2E_ORG_ID || 'N:organization:c905919f-56f5-43ae-9c2a-8d5d542c133b',
    DATASET: process.env.E2E_DATASET || 'N:dataset:55c7c5b8-ebff-4a1f-a1bf-630cd299ff8c'
}

const filepath = 'fixtures';
const filename = 'user.json';
const userfile = path.join(__dirname, filepath, filename);

fs.writeFile(userfile, JSON.stringify(user), function (err) {
    if (err) {
        throw err;
    }
    const formattedFileName = chalk.green(filepath + '/' + filename)
    console.log('Created ' + formattedFileName + '!');
});