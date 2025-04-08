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
const crypto = require('crypto');
const minimatch = require('minimatch');

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

	// Register command to create Readme file
	const createReadmeDisposable = vscode.commands.registerCommand('AutoReadmeGen.createReadme', async function (uri) {
		try {
			// Get current folder path
			const folderPath = uri ? uri.fsPath : vscode.workspace.workspaceFolders[0].uri.fsPath;
			
			// Get directory level setting
			const directoryLevel = await vscode.window.showInputBox({
				prompt: 'Enter the directory level to record (0 for current directory only, -1 for all subdirectories)',
				placeHolder: '0',
				value: '0'
			});
			
			const level = parseInt(directoryLevel || '0', 10);
			
			// Generate readme file content
			// 使用folderPath作为rootPath，确保相对路径计算正确
			const rootPath = folderPath;
			const readmeContent = await generateReadmeContent(folderPath, 0, rootPath, level, []);
			
			// Write to autoReadme.md file
			const config = vscode.workspace.getConfiguration('AutoReadmeGen');
			const readmeFileName = 'autoReadme.md'; // Fixed filename as autoReadme.md
			const readmePath = path.join(folderPath, readmeFileName);
			
			// Create or update .readignore file
			const readignorePath = path.join(folderPath, '.readignore');
			if (!fs.existsSync(readignorePath)) {
				// 获取默认忽略模式配置
				const config = vscode.workspace.getConfiguration('AutoReadmeGen');
				const defaultIgnorePatterns = config.get('defaultIgnorePatterns', ['node_modules/', '*.log', '.git/']);
				
				// 构建.readignore文件内容
				let readignoreContent = '# Add files or directory patterns to ignore, one per line\n';
				
				// 添加默认忽略模式
				if (defaultIgnorePatterns && defaultIgnorePatterns.length > 0) {
					defaultIgnorePatterns.forEach(pattern => {
						readignoreContent += `${pattern}\n`;
					});
				}
				
				fs.writeFileSync(readignorePath, readignoreContent, 'utf8');
			}
			fs.writeFileSync(readmePath, readmeContent, 'utf8');
			
			// Open the generated readme file
			const document = await vscode.workspace.openTextDocument(readmePath);
			await vscode.window.showTextDocument(document);
			
			vscode.window.showInformationMessage('Readme file created successfully!');
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to create Readme file: ${error.message}`);
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
 * Generate readme file content
 * @param {string} folderPath Folder path
 * @param {number} depth Current depth
 * @param {string} rootPath Root path
 * @param {number} maxLevel Maximum level depth
 * @param {string[]} parentIgnorePatterns Ignore patterns from parent directories
 * @returns {Promise<string>} Readme file content
 */
async function generateReadmeContent(folderPath, depth = 0, rootPath = folderPath, maxLevel = 1, parentIgnorePatterns = []) {
    // If maxLevel is -1, it means to expand all subdirectories
    // Otherwise, if exceeding maximum level, don't continue
    if (maxLevel !== -1 && depth > maxLevel) {
        return '';
    }
    
    // Read .readignore file
    const readignorePath = path.join(folderPath, '.readignore');
    let currentIgnorePatterns = [];
    if (fs.existsSync(readignorePath)) {
        const ignoreContent = fs.readFileSync(readignorePath, 'utf8');
        currentIgnorePatterns = ignoreContent.split('\n')
            .filter(line => line.trim() && !line.startsWith('#'))
            .map(pattern => pattern.trim());
    }
    
    // Combine parent ignore patterns with current directory patterns
    const ignorePatterns = [...parentIgnorePatterns, ...currentIgnorePatterns];
    
    // Read folder contents and filter ignored items
    const allItems = fs.readdirSync(folderPath, { withFileTypes: true });
    const items = allItems
        .filter(item => {
            // 获取相对于根目录的路径
            const relativePath = path.relative(rootPath, path.join(folderPath, item.name));
            // 对于目录，添加斜杠以便匹配目录模式
            const relativePathWithSlash = item.isDirectory() ? relativePath + '/' : relativePath;
            
            // 使用minimatch检查是否应该忽略该项
            return !ignorePatterns.some(pattern => {
                // 检查文件名匹配
                if (minimatch.minimatch(item.name, pattern, { matchBase: true })) {
                    return true;
                }
                
                // 检查相对路径匹配
                if (minimatch.minimatch(relativePath, pattern, { dot: true })) {
                    return true;
                }
                
                // 检查带斜杠的路径匹配（针对目录）
                if (item.isDirectory() && minimatch.minimatch(relativePathWithSlash, pattern, { dot: true })) {
                    return true;
                }
                
                return false;
            });
        })
        .sort((a, b) => {
            // If one is directory and one is file, directory comes first
            if (a.isDirectory() !== b.isDirectory()) {
                return a.isDirectory() ? -1 : 1;
            }
            // If both are directories or both are files, sort by name alphabetically
            return a.name.localeCompare(b.name);
        });
    
    // Generate indentation spaces
    // Generate unordered list indentation
    const indent = '  '.repeat(depth * 2);
    
    // Generate markdown content
    let content = depth === 0 ? `# ${path.basename(folderPath)} Directory Guide\n\n` : '';
    content += depth === 0 ? 'This file is automatically generated by AutoReadmeGen plugin, using hierarchical lists to display directory structure.\n\n' : '';
    
    // Process folders and files
    for (const item of items) {
        // Skip autoReadme.md and .readignore files
        if (item.name.toLowerCase() === 'autoreadme.md' || item.name === '.readignore') continue;

        // 计算相对于当前目录的路径，对于当前目录的文件直接使用文件名，对于子目录的文件使用相对路径
        let relativePath;
        if (depth === 0) {
            // 当前目录的文件，直接使用文件名
            relativePath = item.name;
        } else {
            // 子目录的文件，使用相对于autoReadme.md所在目录的路径
            // 计算从autoReadme.md所在目录到当前文件的相对路径
            // 首先获取从根目录到当前文件夹的路径
            const folderRelativeToRoot = path.relative(rootPath, folderPath);

            // 构建不包含根目录名称的相对路径
            relativePath = folderRelativeToRoot ? 
                path.join(folderRelativeToRoot, item.name).replace(/\\/g, '/') : 
                item.name;
        }
        // Don't add hyperlinks for directories
        const displayName = item.isDirectory() ? `**${item.name}/**` : `[${item.name}](${relativePath})`;
        content += `${indent}* ${displayName}\n`;
        if (!item.isDirectory()) {
            content += `${indent}  _info:_\n`;
        }
        
        // Recursively process subdirectories, when maxLevel is -1 or not reaching the maximum level
        if (item.isDirectory() && (maxLevel === -1 || depth < maxLevel)) {
            const subPath = path.join(folderPath, item.name);
            // Recursively process subdirectory, passing the combined ignore patterns
            const subContent = await generateReadmeContent(subPath, depth + 1, rootPath, maxLevel, ignorePatterns);
            content += subContent;
        }
    }
    

    
    return content;
}

// This method is called when your extension is deactivated
// Used to store directory structure hash values
const directoryHashes = new Map();

// Calculate directory structure hash value
function calculateDirectoryHash(dirPath) {
    const hash = crypto.createHash('md5');
    function processDirectory(currentPath) {
        const items = fs.readdirSync(currentPath, { withFileTypes: true })
            .sort((a, b) => a.name.localeCompare(b.name));
        
        for (const item of items) {
            if (item.name.toLowerCase() === 'readme.md') continue;
            const fullPath = path.join(currentPath, item.name);
            const relativePath = path.relative(dirPath, fullPath);
            
            if (item.isDirectory()) {
                hash.update(`D:${relativePath}\n`);
                processDirectory(fullPath);
            } else {
                hash.update(`F:${relativePath}\n`);
            }
        }
    }
    
    processDirectory(dirPath);
    return hash.digest('hex');
}

async function handleFileChange(uri) {
    const config = vscode.workspace.getConfiguration('AutoReadmeGen');
    if (!config.get('autoUpdateEnabled')) return;
    const readmeFileName = 'autoReadme.md'; // Fixed filename
    const isReadignoreFile = path.basename(uri.fsPath) === '.readignore';
    
    // 如果是autoReadme.md文件变化，直接返回，避免循环更新
    if (path.basename(uri.fsPath) === readmeFileName) return;
    
    let currentDir = path.dirname(uri.fsPath);
    let readmePath = null;
    
    // 如果是.readignore文件变化，直接在同目录查找autoReadme.md
    if (isReadignoreFile) {
        const files = fs.readdirSync(currentDir, { withFileTypes: true });
        const readmeFile = files.find(
            entry => entry.isFile() && 
                    entry.name.toLowerCase() === readmeFileName.toLowerCase()
        );
        
        if (readmeFile) {
            readmePath = path.join(currentDir, readmeFile.name);
        }
    } else {
        // 对于其他文件，递归查找最近的父目录中的readme.md
        while (currentDir !== path.parse(currentDir).root) {
            // Exact match of filename
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
    }
    
    if (!readmePath) return;
    
    try {
        const readmeDirPath = path.dirname(readmePath);
        
        // 如果是.readignore文件变化，强制更新README，无需比较哈希值
        if (!isReadignoreFile) {
            const currentHash = calculateDirectoryHash(readmeDirPath);
            const previousHash = directoryHashes.get(readmeDirPath);
            
            // If directory structure hasn't changed, don't update README
            if (previousHash === currentHash) {
                return;
            }
            
            // 更新目录结构哈希值
            directoryHashes.set(readmeDirPath, currentHash);
        }
        
        // Read directory level setting
        const config = vscode.workspace.getConfiguration('AutoReadmeGen');
        const level = config.get('directoryLevel') || 1;
        
        // 使用readmeDirPath作为rootPath，确保相对路径计算正确
        const rootPath = readmeDirPath;
        const content = await generateReadmeContent(readmeDirPath, 0, rootPath, level, []);
        fs.writeFileSync(readmePath, content, 'utf8');
        
        // 如果是.readignore文件变化，更新完成后也要更新哈希值
        if (isReadignoreFile) {
            const newHash = calculateDirectoryHash(readmeDirPath);
            directoryHashes.set(readmeDirPath, newHash);
        }
    } catch (error) {
        console.error('Failed to auto-update README:', error);
    }
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
