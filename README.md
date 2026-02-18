<p align=center><br>
<a href="https://github.com/Lolo280374/hackCLIMap/"><img src="https://hackatime-badge.hackclub.com/U09CBF0DS4F/hackCLIMap"></a>
<a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
<a href="#npm-linux-macos-windows"><img src="https://img.shields.io/badge/os-linux-brightgreen"></a>
<a href="#npm-linux-macos-windows"><img src="https://img.shields.io/badge/os-mac-brightgreen"></a>
<a href="#npm-linux-macos-windows"><img src="https://img.shields.io/badge/os-windows-brightgreen"></a>
<br></p>

<p align="center"><br><a href="https://www.npmjs.com/package/hackCLIMap" title="npm downloads stats"><img src="https://img.shields.io/npm/dt/hackCLIMap" alt="npm downloads 
stats"></a>
<a href="https://www.npmjs.com/package/hackCLIMap" title="npm version"><img src="https://img.shields.io/npm/v/hackCLIMap" alt="npm version"></a></p>

<h3 align="center">
track your Hack Club mail, all while avoiding the web clutter and lags! </a>
</h3>

<img width="1212" height="479" alt="image" src="https://github.com/user-attachments/assets/7330f023-0f78-4b82-8bd9-1723f84c321f" />

<img width="1920" height="1080" alt="ahrjzqfhsdfq" src="https://github.com/user-attachments/assets/abdde01c-2d55-419c-8be1-0472f6a92636" />

<h1 align="center">
    showcases
</h1>

## table of contents

- [compatibility](#compatibility)
- [features](#features)
- [api endpoints used](#api-endpoints)
- [installation](#installation)
    - [with npm: Linux, macOS, Windows](#npm-linux-macos-windows)
    - [install from source](#install-from-source)
- [uninstall](#uninstall)
- [reporting issues](#reporting-issues)
- [privacy information](#privacy-disclaimer)
- [license](#license)

## compatibility

this project works and can be installed on any device running nodeJS, that being mostly Linux, Windows, and macOS, but it can be installed on Android with terminal emulators for example!
<br>compatibility with devices running anything else than macOS, Linux, or Windows has been untested and is gonna be random.

## features
this project allows you to do exactly the same stuff you would do on the Hack Club mail portal (mail.hackclub.com), but via your terminal! you can: 
- list your packages, letters, 
- check a certain letter's information (or package), 
- view the global earth map of letters (without lag compared to the web version!!), 
- and you can also view your legacy shipments if you have any associated to your account, but I'm not sure anyone even has any of these.

## api endpoints

to use this project, you must first get an API key for hack club mail over [here](https://mail.hackclub.com/my/api_keys). once you'll first initiate the project, it'll ask you for your API key, and store it in your home directory under the file '.hackCLIMap-apikey.json'. you can edit or reset your API key there!

<br>the hack club mail API is not very well documented, and since it's not very clear on how to use it i'll put the list of endpoints used here, so you may understand better! here's a list of known routes:
- /api/public/v1/me
- /api/public/v1/mail (the important one)
- /api/public/v1/letters
- /api/public/v1/letters/:id
- /api/public/v1/packages
- /api/public/v1/packages/:id
- /api/public/v1/lsv
- /api/public/v1/lsv/:type/:id

## installation
### npm: Linux, macOS, Windows
you can install this project by simply getting it from npm:
```sh
npm install -g hackclimap
hackclimap
```

### install from source
to install from source, you must start by making sure you have git, nodeJS, and npm installed.
then, start by cloning the repository:

```sh
git clone https://github.com/Lolo280374/hackCLIMap.git
cd hackCLIMap
```
you may then install the dependencies, and link the package to your system:
```sh
npm install
npm link
```
once complete, you can run the following to make sure the installation suceeded, and you can start editing 'index.js' to make modifs!
```sh
hackclimap
```

## uninstall
to uninstall, you can simply run the following:
```sh
npm uninstall -g hackclimap
```

## reporting issues

this is a community project, and your help is very much appreciated! if you notice anything wrong durign your usage of this project, please report it on the [GitHub issues tracker](https://github.com/Lolo280374/hackCLIMap/issues)!


## privacy disclaimer

this tool dosen't contain any analytics, or software that does connection to third party or online services, excluding the hack club mail API. you can check the source code if you have any doubts, but no analytics are being obtained thru this software!

## license

this project is licensed under the MIT license. you can check it [here](https://github.com/Lolo280374/hackCLIMap/blob/master/LICENSE/).
<br>if you have any questions about this project, please reach me [at lolodotzip@proton.me](mailto:lolodotzip@proton.me).