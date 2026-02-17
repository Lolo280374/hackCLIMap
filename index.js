#!/usr/bin/env node

import axios from 'axios';
import chalk from 'chalk';
import enquirer from 'enquirer';
import os from 'os';
import path from 'path';
import { readFile, writeFile } from 'node:fs/promises';

const { prompt } = enquirer;
const api_path = path.join(os.homedir(), '.hackCLIMap-apikey.json');

async function getAPIKey(){
    try {
        const data = await readFile(api_path, 'utf8');
        const config = JSON.parse(data);
        console.log('saved key looks valid, continuing!');
        console.log(`if your key is invalidated, please delete the file at '${api_path}'!`)
        console.log('you can then restart the program and add your new key...')
        return config.api_key;
    } catch (error){
        if (error.code == 'ENOENT'){
            console.log('no saved api key found, please enter your API key!');
            console.log(`you can get an API key from 'https://mail.hackclub.com/my/api_keys'.`);
            const response = await prompt({
                type: 'input',
                name: 'resp_key',
                message: 'mail key:'
            });

            const key = response.resp_key;
            await writeFile(api_path, JSON.stringify({ api_key: key }, null, 2));
            console.log('')
            console.log(`saved your key under '${api_path}'!`);

            return key;
        } else {
            throw error;
        }
    }
}

async function mail(){
    const api_key = await getAPIKey();
    console.log('');
    
    let resp_choice;

    try{
        const response = await prompt({
            type: 'select',
            name: 'mail_app',
            message: 'what do you wish to do?',
            choices: [
                { message: 'list letters', name: 'list letters' },
                { message: 'list packages', name: 'list packages' },
                { message: 'get info w/ letter ID', name: `get info w/ letter ID` },
                { message: 'get info w/ package ID', name: `get info w/ package ID` },
                { message: 'open in your browser', name: 'open in your browser' },
                { message: 'open the global mail map', name: 'open the global mail map' }
            ]
        });
        resp_choice = response.mail_app;
    } catch (err){
        console.log('bye!');
        process.exit(0);
    }

    console.log('');

    if (resp_choice.toLowerCase() === 'list letters'){
        list_letters()
    };

    if (resp_choice.toLowerCase() === 'list packages'){
        list_packages()
    };

    if (resp_choice.toLowerCase() === `get info w/ letter id`){
        info_letter()
    };

    if (resp_choice.toLowerCase() === `get info w/ package id`){
        info_package()
    };

    if (resp_choice.toLowerCase() === 'open in your browser'){
        browser_fallback()
    };

    if (resp_choice.toLowerCase() === 'open the global mail map'){
        mail_map()
    };
}



mail();