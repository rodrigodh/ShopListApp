const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addWindow

// Listen for app to be ready

app.on('ready', () => {
    // Create new Window
    mainWindow = new BrowserWindow({
        webPreferences: { nodeIntegration: true },
    });
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: false
    }));
    // Quit app when closed
    mainWindow.on('closed', () => {
        app.quit();
    })

    // Build menu from template
    const topMainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(topMainMenu);
});

// Handle create add window
function createAddWindow() {
    // Create new Window
    addWindow = new BrowserWindow({
        webPreferences: { nodeIntegration: true },
        width: 300,
        height: 200,
        title: 'Add Shopping List Item'
    });
    // Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: false
    }));
    // Garbage collection handle (n deixa as abas abertas mesmo quando deveriam estar fechadas)
    addWindow.on('close', () => {
        addWindow = null;
    });
}

//Catch item:add
ipcMain.on('item:add', (e, item) => {
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
})

// Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click() {
                    createAddWindow();
                }
            },
            { 
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                // Mac is 'darwin', windows is 'win32'
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// if mac, add empty object to menu because mac has a little problem with the first object
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
    // unshift pushs something to the start of the array
}

// Add developer tools item if not in production (prod)
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}