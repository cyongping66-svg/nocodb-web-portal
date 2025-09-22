# 数据存储配置指南

本项目支持两种数据存储方式：

## 1. 本地存储（默认）
- 数据保存在浏览器的 localStorage 中
- 适合个人使用和开发测试
- 无需任何配置，开箱即用
- 限制：数据无法跨设备同步，清除浏览器缓存会丢失数据

## 2. 云端存储（Supabase）
- 数据保存在 Supabase 云端数据库中
- 支持跨设备同步和多用户协作
- 需要配置 Supabase 项目

### 配置 Supabase 步骤：

#### 第一步：创建 Supabase 项目
1. 访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 注册/登录账户
3. 点击 "New Project" 创建新项目
4. 填写项目信息：
   - Name: `nocodb-web-portal`
   - Database Password: 设置一个强密码
   - Region: 选择距离你最近的区域

#### 第二步：获取项目配置
1. 项目创建完成后，进入项目仪表板
2. 点击左侧菜单的 "Settings" → "API"
3. 复制以下信息：
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJ...` (很长的字符串)

#### 第三步：创建数据表
1. 在 Supabase 仪表板中，点击左侧菜单的 "SQL Editor"
2. 复制项目根目录下的 `supabase-schema.sql` 文件内容
3. 粘贴到 SQL 编辑器中并执行

#### 第四步：配置环境变量
1. 复制项目根目录下的 `.env.example` 文件为 `.env.local`
2. 编辑 `.env.local` 文件，填入第二步获取的配置：
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_USE_SUPABASE=true
```

#### 第五步：重启开发服务器
```bash
npm run dev
```

### 验证配置
- 重启后，左侧边栏应该显示 "雲端存儲" 绿色指示器
- 创建的表格和数据会自动同步到 Supabase 数据库
- 可以在 Supabase 仪表板的 "Table Editor" 中查看数据

### 故障排除

**问题：显示 "本地存儲" 而不是 "雲端存儲"**
- 检查 `.env.local` 文件是否存在且配置正确
- 确保 `VITE_USE_SUPABASE=true`
- 重启开发服务器

**问题：显示 "連接錯誤"**
- 检查 Supabase URL 和 API 密钥是否正确
- 确保 Supabase 项目正常运行
- 检查网络连接

**问题：无法创建或更新数据**
- 确保已经运行了 `supabase-schema.sql` 脚本
- 检查 Supabase 项目的 RLS（行级安全）设置
- 查看浏览器控制台是否有错误信息

### 成本说明
- Supabase 提供免费层级，包含：
  - 500MB 数据库存储
  - 每月 50,000 次 API 请求
  - 适合个人和小型项目使用
- 超出免费额度后按使用量付费

### 数据迁移
如果已经在使用本地存储，启用 Supabase 后：
1. 原有的本地数据会作为默认数据加载
2. 新创建/修改的数据会同步到云端
3. 建议重新创建重要数据以确保云端同步
