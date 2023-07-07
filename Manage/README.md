# "Manage" Application Directory

<br>

**Dependencies:**

* Electron v25.2.0
   * [installation](https://releases.electronjs.org/release/v25.2.0)
   * [documentation](https://www.electronjs.org/docs/latest/)
* Node.js v18.16.1
   * [documentation](https://nodejs.org/dist/latest-v18.x/docs/api/documentation.html)
* Tailwind CSS v3.3.2
   * [documentation](https://tailwindcss.com/docs/installation)

<br>

## How to Setup

Install Electron and Tailwind CSS using npm inside the ```Manage/``` directory.

To make sure that all the required dependencies are installed, type
```bash
npm list
```

This should output Electron and Tailwind CSS like this
```bash
freezmenu-manage@1.0.0
├── electron@25.2.0
└── tailwindcss@3.3.2
```

That's it, just read the documentation links provided at the top for these tools.

<br>

## Directory and File Structure

The structure is bound to change depending on the state of the development.

```
Manage/
   public/
      style/
         *.css
   *.html
   src/
   main.js
```

```Manage/``` is the root folder, all code inside this folder is for the "Manage" application
only. This directory is intended for framework configurations.

```Manage/public/``` directory is for all of the html files.

```Manage/public/styles/``` directory is for all of the css files needed for the html
files.

```Manage/src/``` currently this is for the Tailwind CSS.

```main.js``` file is for Electron.js. This file is intended for all Electron scripts.
