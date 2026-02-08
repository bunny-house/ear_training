# 环境配置指南

## 使用 nvm-windows 配置 Node.js 环境

### 步骤 1: 安装 nvm-windows

1. **下载 nvm-windows**
   - 访问：https://github.com/coreybutler/nvm-windows/releases
   - 下载最新版本的 `nvm-setup.exe`（推荐）或 `nvm-noinstall.zip`

2. **安装 nvm-windows**
   - 运行 `nvm-setup.exe` 并按照提示完成安装
   - 默认安装路径：`C:\Users\<用户名>\AppData\Roaming\nvm`

3. **验证安装**
   - 打开新的 PowerShell 或命令提示符窗口
   - 运行：`nvm version`
   - 应该显示版本号（如：1.1.12）

### 步骤 2: 安装 Node.js

安装完成后，在项目目录下运行以下命令：

```powershell
# 安装 Node.js LTS 版本（推荐）
nvm install lts

# 或者安装特定版本（如 18.x）
nvm install 18.12.1

# 使用安装的版本
nvm use 18.12.1

# 验证 Node.js 版本
node --version
npm --version
```

### 步骤 3: 安装项目依赖

```powershell
# 进入项目目录
cd e:\ear_training

# 安装依赖
npm install
```

### 步骤 4: 启动开发服务器

```powershell
npm run dev
```

## 常见问题

### 问题 1: nvm 命令无法识别
- **解决方案**: 重新打开 PowerShell 或命令提示符窗口
- 如果仍然不行，检查环境变量 PATH 是否包含 nvm 的安装路径

### 问题 2: 权限问题
- **解决方案**: 以管理员身份运行 PowerShell

### 问题 3: 切换 Node.js 版本
```powershell
# 查看已安装的版本
nvm list

# 切换到指定版本
nvm use <版本号>

# 设置默认版本
nvm alias default <版本号>
```

## 项目要求

- **Node.js**: 16.x 或更高版本（推荐 18.x LTS）
- **npm**: 随 Node.js 一起安装
- **包管理器**: npm（已包含在 Node.js 中）
