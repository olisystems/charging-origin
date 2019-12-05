# OLI Charging Origin DApp
Initial skeleton for building decentralized applications with Vue.js and the Ethereum netwrok 

<!-- vscode-markdown-toc -->
1. [ Description](#Description)
2. [ Getting Started](#GettingStarted)
	* [ Prerequisites](#Prerequisites)
	* [ Installing](#Installing)
3. [ Built With](#BuiltWith)
4. [ Contributing](#Contributing)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

##  1. <a name='Description'></a> Description
This is starter code for building decentralized applications with Vue.js on the top Ethereum netwrok.

##  2. <a name='GettingStarted'></a> Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

###  2.1. <a name='Prerequisites'></a> Prerequisites
Please make sure you've already installed Truffle and enabled MetaMask extension in your browser.

```
* Truffle v5.0.41 (core: 5.0.41)
* Solidity >= v0.5.8 (solc-js)
* Node >= v10.16.3
* Web3.js >= v1.2.1
```

###  2.2. <a name='Installing'></a> Installing
Follow the steps below to have development environment running:
1. Clone the repository:
```
git clone https://github.com/olisystems/charging-origin.git
```

2. Change directory to `app` folder and install all requisite npm packages (as listed in `package.json`):
```
cd app
npm install
```
3. Compile the smart contracts:
```
truffle compile
```
This will create the smart contract artifacts in folder `src\assets\js\contracts`.

4. Migrate smart contracts to `volta` chain:
```
npm run migrate
```

5. Test smart contracts:
```
npm run test
```

6. Compiles and hot-reloads for development, run the following command inside `app` directory:
```
npm run serve
```
Navigate to `localhost:8080` in your browser.

7. Compiles and minifies for production:
```
npm run build
```

##  3. <a name='BuiltWith'></a> Built With
* [Ethereum](https://www.ethereum.org/) - Ethereum is a decentralized platform that runs smart contracts to make the web faster, safer, and more open.
* [Truffle Framework](http://truffleframework.com/) - Truffle is the most popular development framework for Ethereum with a mission to make your life a whole lot easier.
* [Vue.js](https://vuejs.org/) - The Progressive JavaScript Framework for building user interfaces.

##  4. <a name='Contributing'></a> Contributing
Pull requests are welcome.

1. Fork the repository.
2. Create your new feature branch: `git checkout -b new-feature-branch`
3. Stage your changes: `git add .`
4. Commit the changes: `git commit -m "add commit message"`
5. `push` to the branch: `git push origin new-feature-branch`
6. Submit a `pull request`.