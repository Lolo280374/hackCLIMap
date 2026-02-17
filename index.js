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
        console.log(chalk.green('saved key looks valid, continuing!'));
        console.log(chalk.yellow(`if your key is invalidated, please delete the file at '${api_path}'!`))
        console.log(chalk.yellow('you can then restart the program and add your new key...'))
        return config.api_key;
    } catch (error){
        if (error.code == 'ENOENT'){
            console.log(chalk.red('no saved api key found, please enter your API key!'));
            console.log(chalk.yellow(`you can get an API key from 'https://mail.hackclub.com/my/api_keys'.`));
            const response = await prompt({
                type: 'input',
                name: 'resp_key',
                message: 'mail key:'
            });

            const key = response.resp_key;
            await writeFile(api_path, JSON.stringify({ api_key: key }, null, 2));
            console.log('')
            console.log(chalk.yellow(`saved your key under '${api_path}'!`));

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
        await list_letters(api_key);
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

async function list_letters(api_key){
    console.log(chalk.blue('loading!'));

    try {
        const response = await axios.get('https://mail.hackclub.com/api/public/v1/letters', {
            headers: {
                'Authorization': `Bearer ${api_key}`,
                'Content-Type': 'application/json'
            }
        });

        const letters = response.data.letters;
        
        if (letters.length === 0){
            console.log(chalk.yellow('no letters found... maybe join a YSWS? :D'));
            console.log(chalk.yellow('fun fact: get free welcome stickers in the toolbox!'))
            return;
        }

        console.log(chalk.green(`showing a total of ${letters.length} letters:`));
        console.log('');

        letters.forEach(letter => {

            let statusColor = chalk.white;
            if (letter.status === 'received') statusColor = chalk.green;
            if (letter.status === 'pending') statusColor = chalk.yellow;
            if (letter.status === 'printed') statusColor = chalk.yellow;
            if (letter.status === 'mailed') statusColor = chalk.cyan;

            console.log(`${chalk.gray('id:')} ${letter.id}`);
            console.log(`${chalk.gray('name:')} ${letter.title}`);
            console.log(`${chalk.gray('status:')} ${statusColor(letter.status)}`);

            if (letter.tags.length > 0){
                console.log(`${chalk.gray('tags:')} ${letter.tags.join(', ')}`);
            }

            console.log('');
            console.log(`learn more at '${chalk.underline(letter.public_url)}'!`);
            console.log(chalk.dim(`-----------------------------------`));
            console.log('');
        });
    } catch (error){
        console.error('');
        console.error(chalk.red(`an error occured while fetching letters...`));
        console.error(chalk.red(`make sure the API key you're using is valid!`));
    }
}

mail();