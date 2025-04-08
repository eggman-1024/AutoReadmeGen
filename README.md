<!--
 * @Author: rtzhang
 * @Date: 2025-03-15 20:39:11
 * @LastEditors: rtzhang
 * @LastEditTime: 2025-03-16 11:18:55
 * @Description: Please fill in the introduction
-->
# AutoReadmeGen
[中文文档](./doc/readme_cn.md)

## Table of Contents

- [autoreadme](#autoreadme)
  - [Table of Contents](#table-of-contents)
  - [About ](#about-)
  - [Getting Started ](#getting-started-)
    <!-- - [Prerequisites](#prerequisites) -->
    - [Installing](#installing)
  - [Usage ](#usage-)

## About <a name = "about"></a>

😫 Have you ever been frustrated by creating numerous similarly named files when testing code? A few days later, you might get confused about these files. You may have created many files named `test`, `test1`, `test2`...... and then completely forgotten their purposes.


🎉 Now you can use this extension to automatically generate an `autoReadme.md` file based on the file structure of the selected directory, with the following powerful features:

- **Customizable Directory Levels**: You can choose the depth of directories to record (default is 0 for current directory only, set to -1 to expand all subdirectories)
- **File Filtering**: Exclude files or directories that don't need to be recorded through the `.readignore` file
- **Automatic Updates**: Automatically update document content when the directory structure changes

## Demo

Watch the demo video to see how AutoReadmeGen works:

https://github.com/user-attachments/assets/7fa1d1ad-3b8d-49e1-a154-fdfdddb58496



## Getting Started <a name = "getting_started"></a>

<!-- These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system. -->

<!-- ### Prerequisites

What things you need to install the software and how to install them.

```
Give examples
```  -->

### Installing

- Open `Visual Studio Code`.
- Go to Extensions or use the keyboard shortcut `Cmd+Shift+X`or `Ctrl+Shift+X`.
- Search for `AutoReadmeGen`.
- Install the extension.
- Restart `Visual Studio Code` and your project.


## Usage <a name = "usage"></a>

1. Right-click on the target folder in the Explorer
2. Select `AutoReadmeGen` from the context menu
3. Enter the directory level to record (default is 0)

The system will create the following files in the selected directory:
- `autoReadme.md`: A document containing the corresponding file structure
- `.readignore`: Used to specify file or directory patterns to be ignored

### .readignore File

The `.readignore` file works similarly to `.gitignore`, where you can add file or directory patterns to be excluded from the documentation, one per line. When you create a new `.readignore` file, it will be automatically populated with default ignore patterns configured in the extension settings. For example:

```
node_modules/
*.log
.git/
```

You can customize the default ignore patterns in the extension settings.

### Automatic Updates

When the directory structure changes, the `autoReadme.md` file will be automatically updated, taking into account the rules in the `.readignore` file.

