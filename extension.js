/*
 * @Author: rtzhang
 * @Date: 2025-03-15 20:39:11
 * @LastEditors: rtzhang
 * @LastEditTime: 2025-03-15 22:07:53
 * @Description: 请填写简介
 */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "AutoReadmeGen" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('AutoReadmeGen.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from AutoReadme!');
	});

	// 注册创建Readme文件的命令
	const createReadmeDisposable = vscode.commands.registerCommand('AutoReadmeGen.createReadme', async function (uri) {
		try {
			// 获取当前文件夹路径
			const folderPath = uri ? uri.fsPath : vscode.workspace.workspaceFolders[0].uri.fsPath;
			
			// 生成readme文件内容
			const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
			const readmeContent = await generateReadmeContent(folderPath, 0, rootPath);
			
			// 写入readme.md文件
			const config = vscode.workspace.getConfiguration('AutoReadmeGen');
const readmeFileName = config.get('readmeFileName') || 'readme.md';
const readmePath = path.join(folderPath, readmeFileName);
			fs.writeFileSync(readmePath, readmeContent, 'utf8');
			
			// 打开生成的readme文件
			const document = await vscode.workspace.openTextDocument(readmePath);
			await vscode.window.showTextDocument(document);
			
			vscode.window.showInformationMessage('Readme文件已创建成功！');
		} catch (error) {
			vscode.window.showErrorMessage(`创建Readme文件失败: ${error.message}`);
		}
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(createReadmeDisposable);

	// 添加文件系统监听
	const watcher = vscode.workspace.createFileSystemWatcher('**/*', false, false, false);
	watcher.onDidCreate(uri => handleFileChange(uri));
	watcher.onDidDelete(uri => handleFileChange(uri));
	watcher.onDidChange(uri => handleFileChange(uri));
	context.subscriptions.push(watcher);
}

/**
 * 生成readme文件内容
 * @param {string} folderPath 文件夹路径
 * @returns {Promise<string>} readme文件内容
 */
async function generateReadmeContent(folderPath, depth = 0, rootPath = folderPath) {
    // 读取文件夹内容
    const items = fs.readdirSync(folderPath, { withFileTypes: true })
        .sort((a, b) => {
            // 如果一个是目录一个是文件，目录排在前面
            if (a.isDirectory() !== b.isDirectory()) {
                return a.isDirectory() ? -1 : 1;
            }
            // 如果都是目录或都是文件，按名称字母顺序排序
            return a.name.localeCompare(b.name);
        });
    
    // 生成缩进空格
    // 生成无序列表缩进
    const indent = '  '.repeat(depth * 2);
    
    // 生成markdown内容
    let content = depth === 0 ? `# ${path.basename(folderPath)} 目录说明\n\n` : '';
    content += depth === 0 ? '本文件由AutoReadmeGen插件自动生成，采用层级列表展示目录结构。\n\n' : '';
    
    // 处理文件夹和文件
    for (const item of items) {
        if (item.name.toLowerCase() === 'readme.md') continue;

        const relativePath = path.join(path.basename(folderPath), item.name);
        // 处理目录不添加超链接
        const relativeToRoot = path.relative(rootPath, path.join(folderPath, item.name));
        const displayName = item.isDirectory() ? `**${item.name}/**` : `[${item.name}](${relativeToRoot})`;
        content += `${indent}* ${displayName}\n`;
        if (!item.isDirectory()) {
            content += `${indent}  _info:_\n`;
        }
        

        // 递归处理子目录
        if (item.isDirectory()) {
            const subPath = path.join(folderPath, item.name);
            // 递归处理子目录
            const subContent = await generateReadmeContent(subPath, depth + 1, rootPath);
            content += subContent;
        }
    }
    

    
    return content;
}

// This method is called when your extension is deactivated
async function handleFileChange(uri) {
    const config = vscode.workspace.getConfiguration('AutoReadmeGen');
    if (!config.get('autoUpdateEnabled')) return;
    const readmeFileName = config.get('readmeFileName') || 'readme.md';
if (path.basename(uri.fsPath) === readmeFileName) return;
    
    let currentDir = path.dirname(uri.fsPath);
    let readmePath = null;
    
    // 递归查找最近的父级readme.md
    while (currentDir !== path.parse(currentDir).root) {
        // 精确匹配文件名
        const files = fs.readdirSync(currentDir, { withFileTypes: true });
        const readmeFile = files.find(
            entry => entry.isFile() && 
                    entry.name.toLowerCase() === readmeFileName.toLowerCase()
        );
        
        if (readmeFile) {
            readmePath = path.join(currentDir, readmeFile.name);
            break;
        }
        currentDir = path.dirname(currentDir);
    }
    
    if (!readmePath) return;
    
    try {
        const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        const content = await generateReadmeContent(path.dirname(readmePath), 0, rootPath);
        fs.writeFileSync(readmePath, content, 'utf8');
    } catch (error) {
        console.error('自动更新README失败:', error);
    }
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
