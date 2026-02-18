#!/usr/bin/env node

import axios from 'axios';
import chalk from 'chalk';
import enquirer from 'enquirer';
import os from 'os';
import path from 'path';
import { exec } from 'child_process';
import blessed from 'blessed';
import contrib from 'blessed-contrib';
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
                { message: 'list legacy shipments', name: 'list legacy shipments' },
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
        await list_packages(api_key);
    };

    if (resp_choice.toLowerCase() === 'list legacy shipments'){
        await list_legacy_shipments(api_key);
    };

    if (resp_choice.toLowerCase() === `get info w/ letter id`){
        await info_letter(api_key);
    };

    if (resp_choice.toLowerCase() === `get info w/ package id`){
        await info_package(api_key);
    };

    if (resp_choice.toLowerCase() === 'open in your browser'){
        await browser_fallback();
    };

    if (resp_choice.toLowerCase() === 'open the global mail map'){
        await mail_map();
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

async function list_packages(api_key){
    console.log(chalk.blue('loading!'));

    try{
        const response = await axios.get('https://mail.hackclub.com/api/public/v1/packages', {
            headers: {
                'Authorization': `Bearer ${api_key}`,
                'Content-Type': 'application/json'
            }
        });

        const packages = response.data.packages;

        if (packages.length === 0){
            console.log(chalk.yellow('no packages found... did you select the intended option?'));
            console.log(chalk.yellow('this will only show packages, and not actual letters!'))
            return;
        }

        console.log(chalk.green(`showing a total of ${packages.length} packages:`));
        console.log('');

        packages.forEach(pkg => {

            let statusColor = chalk.white;
            if (pkg.status === 'received') statusColor = chalk.green;
            if (pkg.status === 'pending') statusColor = chalk.yellow;
            if (pkg.status === 'printed') statusColor = chalk.yellow;
            if (pkg.status === 'mailed') statusColor = chalk.cyan;

            console.log(`${chalk.gray('id:')} ${pkg.id} (${pkg.type})`);
            console.log(`${chalk.gray('name:')} ${pkg.title}`);
            console.log(`${chalk.gray('status:')} ${statusColor(pkg.status)}`);

            if (pkg.tags.length > 0){
                console.log(`${chalk.gray('tags:')} ${pkg.tags.join(', ')}`);
            }

            console.log('');
            console.log(`${pkg.carrier} ${chalk.gray('via')} ${pkg.service}`);
            console.log(`${chalk.gray('total weight of')} ${pkg.weight} lbs, ${chalk.gray('with contents:')}`);

            if (pkg.contents && pkg.contents.length > 0){
                pkg.contents.forEach(item => {
                    console.log(`${chalk.blue(item.quantity + 'x')} ${item.name} ${chalk.dim('(' + item.hc_sku + ')')}`);
                });
            } else {
                console.log(chalk.gray('(no contents listed...)'));
            }

            console.log('');
            console.log(`learn more at '${chalk.underline(pkg.public_url)}'!`);
            console.log(chalk.dim(`-----------------------------------`));
            console.log('');
        });
    } catch (error){
        console.error('');
        console.error(chalk.red(`an error occured while fetching packages...`));
        console.error(chalk.red(`make sure the API key you're using is valid!`));
    }
}

async function info_letter(api_key){
    let ltr_choice;
    
    const response = await prompt({
        type: 'input',
        name: 'ltr_id',
        message: 'letter ID to lookup:'
    });
    ltr_choice = response.ltr_id;

    console.log(chalk.blue('loading!'));
    try {
        const response = await axios.get(`https://mail.hackclub.com/api/public/v1/letters/${ltr_choice}`, {
            headers: {
                'Authorization': `Bearer ${api_key}`,
                'Content-Type': 'application/json'
            }
        });

        const letter = response.data.letter;

        let statusColor = chalk.white;
        if (letter.status === 'received') statusColor = chalk.green;
        if (letter.status === 'pending') statusColor = chalk.yellow;
        if (letter.status === 'printed') statusColor = chalk.yellow;
        if (letter.status === 'mailed') statusColor = chalk.cyan;

        console.log('');
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
    } catch (error){
        console.error('');
        console.error(chalk.red(`an error occured while loading the letter...`));
        console.error(chalk.red(`make sure the API key you're using is valid!`));
    }
}

async function info_package(api_key){
    let pkg_choice;

    const response = await prompt({
        type: 'input',
        name: 'pkg_id',
        message: 'package ID to lookup:'
    });
    pkg_choice = response.pkg_id;

    console.log(chalk.blue('loading!'));
    try {
        const response = await axios.get(`https://mail.hackclub.com/api/public/v1/packages/${pkg_choice}`, {
            headers: {
                'Authorization': `Bearer ${api_key}`,
                'Content-Type': 'application/json'
            }
        });

        const pkg = response.data.package;

        let statusColor = chalk.white;
        if (pkg.status === 'received') statusColor = chalk.green;
        if (pkg.status === 'pending') statusColor = chalk.yellow;
        if (pkg.status === 'printed') statusColor = chalk.yellow;
        if (pkg.status === 'mailed') statusColor = chalk.cyan;

        console.log(`${chalk.gray('id:')} ${pkg.id} (${pkg.type})`);
        console.log(`${chalk.gray('name:')} ${pkg.title}`);
        console.log(`${chalk.gray('status:')} ${statusColor(pkg.status)}`);

        if (pkg.tags.length > 0){
            console.log(`${chalk.gray('tags:')} ${pkg.tags.join(', ')}`);
        }

        console.log('');
        console.log(`${pkg.carrier} ${chalk.gray('via')} ${pkg.service}`);
        console.log(`${chalk.gray('total weight of')} ${pkg.weight} lbs, ${chalk.gray('with contents:')}`);

        if (pkg.contents && pkg.contents.length > 0){
            pkg.contents.forEach(item => {
                console.log(`${chalk.blue(item.quantity + 'x')} ${item.name} ${chalk.dim('(' + item.hc_sku + ')')}`);
            });
        } else {
            console.log(chalk.gray('(no contents listed...)'));
        }

        console.log('');
        console.log(`learn more at '${chalk.underline(pkg.public_url)}'!`);
        console.log(chalk.dim(`-----------------------------------`));
        console.log('');
    } catch (error){
        console.error('');
        console.error(chalk.red(`an error occured while loading the package...`));
        console.error(chalk.red(`note that there's also a bug for packages where some don't get any API response...`));
        console.error(chalk.red(`this is not something I can fix, it's sadly an API issue afaik :(`));
        console.error(chalk.red(`make sure the API key you're using is valid!`));
    }
}

async function browser_fallback(){
    const mail_url = 'https://mail.hackclub.com/my/mail/';
    let command;

    if (process.platform === "win32"){
        command = `start "" "${mail_url}"`;
    } else if (process.platform === "darwin"){
        command = `open "${mail_url}"`;
    } else{
        command = `xdg-open "${mail_url}"`;
    }

    console.log(chalk.blue('hackclub mail has been opened in your default browser!'));
    console.log(chalk.blue('or at least normally it should have...'));
    console.log(chalk.dim(`-----------------------------------`));
    console.log('');
    exec(command);
}

async function list_legacy_shipments(api_key){
    console.log(chalk.blue('loading!'));

    try {
        const response = await axios.get('https://mail.hackclub.com/api/public/v1/lsv', {
            headers: {
                'Authorization': `Bearer ${api_key}`,
                'Content-Type': 'application/json'
            }
        });

        const legacy_shipments = response.data.legacy_shipment_viewer_records;

        if (legacy_shipments.length === 0){
            console.log(chalk.yellow('no legacy shipments found...'));
            console.log(chalk.yellow(`note that this endpoint isn't being used anymore, and is only for old shipments.`));
            return;
        }

        console.log(chalk.green(`showing a total of ${legacy_shipments.length} shipments:`));
        console.log('');

        legacy_shipments.forEach(shipment => {

            let statusColor = chalk.white;
            if (shipment.status === 'received') statusColor = chalk.green;
            if (shipment.status === 'pending') statusColor = chalk.yellow;
            if (shipment.status === 'printed') statusColor = chalk.yellow;
            if (shipment.status === 'mailed') statusColor = chalk.cyan;

            console.log(`${chalk.gray('id:')} ${shipment.id}`);
            console.log(`${chalk.gray('name:')} ${shipment.title}`);
            console.log(`${chalk.gray('status:')} ${statusColor(shipment.status)}`);

            if (shipment.tracking_number){
                console.log(`${chalk.gray('tracking:')} ${chalk.blue(shipment.tracking_number)}`);
                if (shipment.tracking_link){
                    console.log(`${chalk.dim(shipment.tracking_link)}`);
                }
            }

            console.log('');

            if (shipment.contents && shipment.contents.length > 0){
                console.log(chalk.gray('contents:'));
                shipment.contents.forEach(item => {
                    console.log(`- ${item}`);
                });
            } else if (shipment.description){
                console.log(`${chalk.gray('description:')} ${shipment.description}`);
            } else {
                console.log(chalk.gray('(no contents listed...)'));
            }

            console.log('');
            console.log(`learn more at '${chalk.underline(shipment.public_url)}'!`);
            console.log(chalk.dim(`-----------------------------------`));
            console.log('');

        });
    } catch (error){
        console.error('');
        console.error(chalk.red(`an error occured while fetching legacy shipments...`));
        console.error(chalk.red(`make sure the API key you're using is valid!`));   
    }
}

async function mail_map(){
    console.log(chalk.blue('loading hackclub global map!'));

    let mapData;
    try {
        const { data: html } = await axios.get('https://mail.hackclub.com/map');
        const jsonGlobal = html.match(/<script[^>]*id="map-data"[^>]*>([\s\S]*?)<\/script>/i);
        mapData = JSON.parse(jsonGlobal[1]);
    } catch (error){
        console.error('');
        console.error(chalk.red('failed to load the global map data!'));
        console.error(chalk.red(`error: ${error.message}`));
    }
    
    const screen = blessed.screen({
        smartCSR: true,
        title: 'hackclub earth mailmap',
        fullUnicode: true
    });

    const map = contrib.map({
        label: `hackclub mail - ${mapData.letters.length} current letters - (✉ : mailed letters), (✓ : received letters)`,
        style: { shapeColor: 'cyan', stroke: 'blue' },
        width: '100%',
        height: '100%'
    });

    screen.append(map);

    function append_letters(){
        let receivedCount = 0;
        let mailedCount = 0;

        mapData.letters.forEach(letter => {
            if (!letter.current_location) return;
            const lat = letter.current_location.lat;
            const lon = letter.current_location.lon;
            let color = 'yellow';
            let char = 'O';

            if (letter.aasm_state === 'received'){
                color = 'green';
                char = '✓';
                receivedCount++;
            } else if (letter.aasm_state === 'mailed'){
                color = 'white';
                char = '✉';
                mailedCount++;
            }

            map.addMarker({
                lon: lon.toString(),
                lat: lat.toString(),
                color: color,
                char: char
            });
        });
    }
    append_letters();

    screen.on('resize', function(){
        map.emit('attach');
        append_letters();
        screen.render();
    });

    screen.render();
    return new Promise((resolve) => {
        screen.key(['escape', 'q', 'C-c'], function(ch, key){
            screen.destroy();
            resolve();
        });
    });
}

mail();