<!--
 * @Author: rtzhang
 * @Date: 2025-03-15 20:39:11
 * @LastEditors: rtzhang
 * @LastEditTime: 2025-03-16 11:18:55
 * @Description: 请填写简介
-->
# AutoReadmeGen

## 目录

- [autoreadme](#autoreadme)
  - [目录](#目录)
  - [关于 ](#关于-)
  - [入门 ](#入门-)
    <!-- - [前提条件](#前提条件) -->
    - [安装](#安装)
  - [使用方法 ](#使用方法-)

## 关于 <a name = "about"></a>

😫你是否曾经为测试代码时创建了大量类似命名的文件而感到困扰？几天后你可能会混淆这些文件。你可能创建了许多名为`test`、`test1`、`test2`......的文件，然后完全忘记了它们的用途。


🎉 现在你可以使用这个扩展来根据所选目录的文件结构自动生成一个`autoReadme.md`文件，并且具有以下强大功能：

- **自定义目录层级**：你可以选择记录的目录深度（默认为0仅显示当前目录，设置为-1时展开所有子目录）
- **文件过滤**：通过`.readignore`文件排除不需要记录的文件或目录
- **自动更新**：当目录结构变化时，自动更新文档内容

## 演示

观看演示视频，了解AutoReadmeGen的工作方式：

https://github.com/user-attachments/assets/c67312fa-d875-401c-a86d-d6374e189a6b



## 入门 <a name = "getting_started"></a>

<!-- 这些说明将为您提供项目的副本，并在本地计算机上运行以进行开发和测试。有关如何在实时系统上部署项目的说明，请参阅[部署](#deployment)。 -->

<!-- ### 前提条件

安装软件需要什么以及如何安装它们。

```
给出示例
``` -->

### 安装

- 打开 `Visual Studio Code`。
- 转到扩展或使用键盘快捷键 `Cmd+Shift+X` 或 `Ctrl+Shift+X`。
- 搜索 `AutoReadmeGen`。
- 安装扩展。
- 重启 `Visual Studio Code` 和您的项目。


## 使用方法 <a name = "usage"></a>

1. 在资源管理器中右键点击目标文件夹
2. 在上下文菜单中选择 `AutoReadmeGen`
3. 输入要记录的目录层级（默认为0）

系统将在所选目录中创建以下文件：
- `autoReadme.md`：包含相应文件结构的文档
- `.readignore`：用于指定需要忽略的文件或目录模式

### .readignore 文件

`.readignore` 文件的工作方式类似于 `.gitignore`，你可以在其中添加需要从文档中排除的文件或目录模式，每行一个。当你创建一个新的 `.readignore` 文件时，它会自动填充扩展设置中配置的默认忽略模式。例如：

```
node_modules/
*.log
.git/
```

你可以在扩展设置中自定义默认忽略模式。

### 自动更新

当目录结构发生变化时，`autoReadme.md` 文件会自动更新，同时考虑 `.readignore` 文件中的规则。
