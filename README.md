# NoCoDB Web Portal - 数据库界面构建器

一个现代化的 Web 应用，允许用户创建和管理自定义的数据库界面，支持多种数据类型和视图模式。

## ✨ 功能特色

### 核心功能
- **表格管理** - 创建、重命名、删除数据表
- **灵活的列配置** - 支持文本、数字、日期、布尔值、选择、邮箱、电话等数据类型
- **双视图模式** - 网格视图和卡片视图自由切换
- **实时数据编辑** - 内联编辑和表单验证
- **数据导出** - JSON 格式导出功能
- **拖拽排序** - 列和行的拖拽重排

### 数据存储选项
- **本地存储** - 使用浏览器 localStorage，开箱即用
- **云端存储** - 集成 Supabase，支持跨设备同步和多用户协作

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:5000 开始使用

## 📊 数据存储配置

项目默认使用本地存储，如需启用云端存储功能，请参考 [SETUP.md](./SETUP.md) 详细配置指南。

### 快速切换存储方式

**使用本地存储（默认）：**
- 无需任何配置
- 数据保存在浏览器中

**启用云端存储：**
1. 创建 Supabase 项目
2. 配置环境变量
3. 运行数据库脚本

详细步骤请查看 [SETUP.md](./SETUP.md)

## 🛠 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 6.3.5
- **UI 组件**: Radix UI + Tailwind CSS
- **图标库**: Lucide React
- **数据存储**: Supabase（可选）+ localStorage（默认）
- **状态管理**: React Hooks
- **开发环境**: GitHub Spark Template

## 📁 项目结构

```
src/
├── components/          # UI 组件
│   ├── ui/             # 基础 UI 组件
│   ├── DataTable.tsx   # 数据表格视图
│   ├── CardView.tsx    # 卡片视图
│   └── TableManager.tsx # 表格管理器
├── hooks/              # 自定义 Hooks
│   └── use-tables.ts   # 表格数据管理
├── lib/                # 工具库
│   ├── utils.ts        # 通用工具函数
│   └── supabase.ts     # Supabase 数据服务
├── types.ts            # TypeScript 类型定义
└── App.tsx             # 主应用组件
```

## � 开发指南

### 添加新的列类型
1. 在 `src/types.ts` 中扩展 `Column` 类型
2. 在 `DataTable.tsx` 和 `CardView.tsx` 中添加渲染逻辑
3. 更新列配置界面

### 自定义主题
项目使用 Tailwind CSS，可以在 `tailwind.config.js` 中自定义主题色彩。

### 部署
```bash
npm run build
```

构建产物在 `dist/` 目录中，可部署到任何静态托管服务。

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**当前状态**: ✅ 图标问题已修复，✅ 云端存储已集成
