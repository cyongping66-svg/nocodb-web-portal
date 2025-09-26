# Database Interface Builder - Product Requirements Document

A modern web application that allows users to create and manage custom database-like interfaces for organizing and visualizing data in various formats.

**Experience Qualities**: 
1. **Professional** - Clean, business-focused interface that inspires confidence in data management
2. **Intuitive** - Self-explanatory interface that reduces cognitive load for database operations
3. **Efficient** - Fast data entry and retrieval with keyboard shortcuts and smart defaults

**Complexity Level**: 
- Light Application (multiple features with basic state)
- This choice allows us to provide core database interface functionality while maintaining simplicity and performance in a web environment.

## Essential Features

### Table Management
- **Functionality**: Create, rename, and delete data tables with custom column definitions
- **Purpose**: Provides the foundation for organizing different types of data
- **Trigger**: Click "New Table" button or table management menu
- **Progression**: Click New Table → Enter table name → Define initial columns → Save → Table appears in sidebar
- **Success criteria**: Tables persist between sessions and can be selected/modified

### Column Configuration
- **Functionality**: Add/remove columns with different data types (text, number, date, boolean, select)
- **Purpose**: Allows customization of data structure to match specific use cases
- **Trigger**: Click column header menu or "Add Column" button
- **Progression**: Click Add Column → Select data type → Enter column name → Configure options → Save → Column appears in table
- **Success criteria**: Columns maintain their type validation and display correctly

### Data Entry & Editing
- **Functionality**: Add, edit, and delete rows with inline editing and form validation
- **Purpose**: Core functionality for managing the actual data content
- **Trigger**: Click empty row, edit existing cell, or delete row button
- **Progression**: Click cell → Enter edit mode → Type data → Press Enter/Tab → Data saves → Move to next cell
- **Success criteria**: Data persists correctly and validation works for each column type

### View Modes
- **Functionality**: Switch between grid view and card view for different data visualization needs
- **Purpose**: Provides flexibility in how users view and interact with their data
- **Trigger**: Click view mode toggle buttons in toolbar
- **Progression**: Select view mode → Data re-renders in new format → Interactions adapt to view type
- **Success criteria**: All data remains accessible and editable in both view modes

### Data Export
- **Functionality**: Export table data to JSON format for external use
- **Purpose**: Allows users to extract their data for backup or integration purposes
- **Trigger**: Click export button in table toolbar
- **Progression**: Click Export → Choose format → Generate download → File downloads to device
- **Success criteria**: Exported data maintains integrity and can be re-imported

## Edge Case Handling

- **Empty Tables**: Show helpful placeholder with sample data suggestions
- **Invalid Data Types**: Provide clear validation messages and prevent invalid entries
- **Large Datasets**: Implement virtual scrolling for tables with many rows
- **Data Conflicts**: Handle concurrent editing with optimistic updates and conflict resolution
- **Storage Limits**: Notify users when approaching browser storage limitations

## Design Direction

The design should feel professional and database-focused, similar to modern SaaS tools like Airtable or Notion databases. Clean lines, subtle shadows, and a data-dense but organized layout that prioritizes functionality over decoration.

## Color Selection

Complementary (opposite colors) - Using a blue and orange complementary scheme to create clear visual hierarchy between primary actions (blue) and accent elements (orange), evoking trust and efficiency.

- **Primary Color**: Deep Blue (oklch(0.45 0.15 240)) - Communicates reliability and professionalism for database operations
- **Secondary Colors**: Light Blue (oklch(0.85 0.08 240)) for backgrounds and Neutral Gray (oklch(0.6 0 0)) for secondary text
- **Accent Color**: Warm Orange (oklch(0.7 0.15 45)) - Attention-grabbing highlight for CTAs and important status indicators
- **Foreground/Background Pairings**: 
  - Background (White oklch(0.98 0 0)): Dark Gray text (oklch(0.2 0 0)) - Ratio 12.6:1 ✓
  - Primary (Deep Blue oklch(0.45 0.15 240)): White text (oklch(0.98 0 0)) - Ratio 8.2:1 ✓
  - Secondary (Light Blue oklch(0.85 0.08 240)): Dark Blue text (oklch(0.25 0.12 240)) - Ratio 6.1:1 ✓
  - Accent (Warm Orange oklch(0.7 0.15 45)): White text (oklch(0.98 0 0)) - Ratio 4.8:1 ✓

## Font Selection

Inter font family for its excellent readability in data-dense interfaces and professional appearance that works well for both headers and tabular data display.

- **Typographic Hierarchy**: 
  - H1 (App Title): Inter Bold/24px/tight letter spacing
  - H2 (Table Names): Inter Semibold/18px/normal spacing  
  - H3 (Column Headers): Inter Medium/14px/wide letter spacing
  - Body (Cell Data): Inter Regular/14px/normal spacing
  - Labels (Form Fields): Inter Medium/12px/normal spacing

## Animations

Subtle and functional animations that enhance data manipulation workflows without causing distraction during intensive data entry tasks.

- **Purposeful Meaning**: Quick fade-ins for new rows/columns, smooth transitions between view modes, and gentle hover states that indicate interactivity
- **Hierarchy of Movement**: Row additions get priority animation focus, followed by column changes, with UI state changes being most subtle

## Component Selection

- **Components**: Table for data display, Dialog for table creation, Card for card view mode, Button for actions, Input/Select for data entry, Tabs for view switching, Sheet for mobile column configuration
- **Customizations**: Custom data type indicators, sortable column headers, inline editing components, virtual scrolling container
- **States**: Buttons show loading states during saves, inputs highlight validation errors, rows show hover states for actions, tables show empty states with onboarding
- **Icon Selection**: Plus for adding, Pencil for editing, Trash for deleting, Grid3x3 for table view, LayoutGrid for card view, Download for export
- **Spacing**: Consistent 16px padding for cards, 8px gaps in toolbars, 4px cell padding for dense data display
- **Mobile**: Stack toolbar buttons vertically, use Sheet component for column configuration, switch to card view by default on mobile screens

## 詳細功能結構、功能點和功能邏輯

### 核心業務功能模塊

#### 1. 表格管理模塊 (Table Management)

**主要功能點**:
- **表格創建**: 用戶可以建立新的數據表格，設定表格名稱
- **表格編輯**: 支持表格名稱的即時編輯
- **表格刪除**: 提供安全刪除功能，包含確認對話框
- **表格切換**: 側邊欄支持多表格切换，支持搜尋篩選

**功能邏輯**:
1. 用戶點擊"+"按鈕觸發表格創建對話框
2. 輸入表格名稱後，系統自動創建默認欄位結構 (姓名、電子郵件、建立日期)
3. 新表格創建後自動切換到當前表格視圖
4. 表格列表支持拖拽重新排序 (未來功能)

#### 2. 欄位配置模塊 (Column Configuration)

**主要功能點**:
- **動態欄位新增**: 支持添加多種類型欄位
- **欄位類型系統**: 文本、數字、日期、布爾值、單選/多選選項、檔案、URL、郵件、電話
- **欄位編輯**: 欄位名稱即時編輯
- **欄位刪除**: 支持刪除欄位及關聯數據
- **欄位排序**: 拖拽調整欄位顯示順序
- **欄位寬度調整**: 拖拽調整欄位寬度

**功能邏輯**:
1. 點擊"新增欄位"開啟配置對話框
2. 選擇欄位類型後動態顯示相應配置選項
3. 對於選項類型，支持單選/多選配置和動態添加選項
4. 新欄位添加後系統為所有現有行創建默認值

**數據類型詳解**:
- **text**: 純文本輸入，支持長文本
- **number**: 數字輸入，支持小數
- **date**: 日期選擇器 (格式: YYYY/MM/DD HH:mm)
- **boolean**: 勾選框 (true/false)
- **select**: 單選下拉框，自定義選項列表
- **multi-select**: 多選標籤，支持多個選項同時選擇
- **file**: 檔案上傳，存儲檔案名稱、大小、類型和內容
- **url**: 網址連結，自動驗證並支持點擊打開
- **email**: 郵件地址，點擊發送郵件
- **phone**: 電話號碼，點擊撥打

#### 3. 數據操作模塊 (Data Manipulation)

**主要功能點**:
- **行數據新增**: 點擊按鈕或表格底部新增空白行
- **單元格編輯**: 點擊任意單元格進入編輯模式
- **數據驗證**: 根據欄位類型進行輸入驗證
- **數據刪除**: 支援單行和批量刪除操作
- **批量編輯**: 批量修改選中行的指定欄位值

**編輯邏輯**:
1. 點擊目標單元格觸發編輯狀態
2. 根據欄位類型顯示相應的編輯控件
3. 對於專用類型 (郵件、電話、URL) 提供快速訪問功能
4. 編輯完成後自動保存並同步到服務端

#### 4. 數據檢索模塊 (Data Query & Filter)

**主要功能點**:
- **全域搜尋**: 在所有欄位中搜尋關鍵字
- **欄位篩選**: 針對每個欄位設置特定篩選條件
- **排序功能**: 支持升序/降序排序，支援多種數據類型
- **篩選組合**: 多個篩選條件邏輯與組合

**篩選規則**:
- **文本類型**: 模糊匹配、不區分大小寫
- **數字類型**: 範圍篩選 (最小值/最大值)
- **布爾類型**: 精確匹配 (是/否)
- **日期類型**: 日期範圍篩選
- **選項類型**: 多選項篩選
- **檔案類型**: 根據檔案名稱搜尋

#### 5. 批量操作模塊 (Batch Operations)

**主要功能點**:
- **行選擇器**: 支援全選、單選、多選
- **批量編輯**: 批量修改選中行的欄位值
- **批量複製**: 複製選中行創建新記錄
- **批量刪除**: 批量刪除選中行
- **批量匯出**: 匯出選中行到Excel文件

**操作流程**:
1. 用戶勾選需要操作的行
2. 介面顯示批量操作工具列
3. 選擇具體操作類型 (編輯/複製/刪除/匯出)
4. 對於編輯操作，提供統一的編輯介面

#### 6. 數據匯出模塊 (Data Export)

**主要功能點**:
- **完整表匯出**: 匯出整個表格的所有數據
- **選擇性匯出**: 僅匯出篩選後的數據
- **批量匯出**: 匯出用戶選中的特定行
- **Excel格式支援**: 自動處理不同數據類型的格式化

**匯出邏輯**:
1. 收集需要匯出的數據行
2. 根據欄位類型進行數據格式化
3. 處理特殊類型 (檔案顯示檔案名稱，日期格式化等)
4. 生成帶有凍結表頭的Excel文件
5. 自動下載並提供有意義的檔案名稱

#### 7. 視圖切換模塊 (View Switching)

**主要功能點**:
- **表格視圖**: 傳統的網格佈局，適合大量數據操作
- **卡片視圖**: 卡片式佈局，更直觀的記錄展示 (規劃中)
- **移動端適配**: 根據螢幕大小自動調整視圖

**視圖邏輯**:
1. 使用標籤頁介面進行視圖切換
2. 不同視圖共享相同的數據篩選和排序狀態
3. 編輯操作在所有視圖中保持一致

### 用戶交互邏輯

#### 編輯流程
1. **單元格點擊** → 進入編輯模式
2. **輸入控件激活** → 根據類型顯示不同編輯器
3. **數據輸入** → 即時驗證輸入內容
4. **保存操作** → Enter鍵或點擊外部觸發保存
5. **取消操作** → Escape鍵取消編輯

#### 搜尋篩選流程
1. **輸入關鍵字** → 全域搜尋立即響應
2. **開啟篩選面板** → 針對性設置篩選條件
3. **動態篩選** → 即時更新結果列表
4. **組合篩選** → 多條件邏輯與
5. **清除篩選** → 一步恢復完整數據

#### 批量操作流程
1. **選擇記錄** → 點擊複選框選擇多行
2. **激活工具列** → 顯示批量操作選項
3. **選擇操作** → 點擊對應操作按鈕
4. **配置參數** → 如選擇編輯欄位和值
5. **執行確認** → 批量應用到所有選中記錄

### 數據驗證規則

#### 前端驗證
- **必填欄位**: 確保核心欄位不為空
- **類型驗證**: 數字欄位只接受數字輸入
- **格式驗證**: Email格式，電話號碼格式
- **長度限制**: 文本欄位最大長度限制
- **選項驗證**: 確保選項值在定義範圍內

#### 後端驗證
- **數據完整性**: 確保所有必要字段存在
- **訪問控制**: 驗證用戶操作權限
- **業務邏輯**: 防止無效數據組合
- **SQL注入防護**: 參數化查詢全面覆蓋

### 錯誤處理邏輯

#### 用戶級錯誤
- **輸入錯誤**: 清晰的錯誤訊息和修正建議
- **操作失敗**: 友好的失敗提示和重試選項
- **網路錯誤**: 自動重試和離線提示
- **數據衝突**: 衝突解決指引和合併選項

#### 系統級錯誤
- **服務不可用**: 降級功能和修復指引
- **數據損壞**: 備份恢復和數據修復工具
- **性能問題**: 性能監控和自動優化

### 性能優化策略

#### 前端優化
- **虛擬滾動**: 支持上萬行數據平滑滾動
- **增量更新**: 最小化重渲染範圍
- **懶載入**: 依需求載入組件和數據
- **記憶化**: 緩存計算結果避免重複計算

#### 後端優化
- **數據庫索引**: 關鍵查詢字段建立索引
- **查詢優化**: 減少不必要的數據傳輸
- **快取策略**: 常用數據和查詢結果快取
- **連接池**: 數據庫連接有效利用

## 項目架構與技術結構

### 整體架構
本項目採用前後端分離的架構設計，包含以下主要組件：
- **前端應用** (React + TypeScript + Vite)
- **後端API服務** (Node.js + Express + SQLite)
- **容器化部署** (Docker + Docker Compose)
- **數據持久化** (SQLite 數據庫)

### 前端架構 (Frontend)

#### 技術棧
- **框架**: React 19.0.0 + TypeScript 5.7.2
- **構建工具**: Vite 6.3.5
- **UI組件庫**: Radix UI + shadcn/ui
- **樣式系統**: Tailwind CSS 4.1.11
- **狀態管理**: React Query (TanStack Query 5.83.1)
- **表單處理**: React Hook Form 7.54.2 + Zod 3.25.76
- **圖標系統**: Lucide React + Phosphor Icons + Heroicons
- **動畫**: Framer Motion 12.6.2
- **數據處理**: XLSX 0.18.5 (Excel導出)
- **拖拽功能**: DND Kit 6.3.1

#### 目錄結構
```
src/
├── components/           # 組件目錄
│   ├── ui/              # 基礎UI組件 (shadcn/ui)
│   │   ├── button.tsx   # 按鈕組件
│   │   ├── card.tsx     # 卡片組件
│   │   ├── dialog.tsx   # 對話框組件
│   │   ├── input.tsx    # 輸入框組件
│   │   ├── table.tsx    # 表格組件
│   │   ├── tabs.tsx     # 標籤頁組件
│   │   └── ...          # 其他UI組件
│   ├── DataTable.tsx    # 數據表格視圖組件
│   ├── CardView.tsx     # 卡片視圖組件
│   └── TableManager.tsx # 表格管理組件
├── hooks/               # 自定義Hook
│   ├── use-mobile.ts    # 移動端檢測Hook
│   ├── use-tables.ts    # 表格數據Hook
│   └── use-tables-new.ts # 新版表格Hook
├── lib/                 # 工具庫
│   ├── api.ts          # API服務封裝
│   ├── utils.ts        # 通用工具函數
│   └── supabase.ts     # Supabase配置 (備用)
├── styles/             # 樣式文件
│   └── theme.css       # 主題樣式
├── types.ts            # TypeScript類型定義
├── App.tsx             # 主應用組件
├── main.tsx            # 應用入口點
├── index.css           # 全局樣式
└── main.css            # 主樣式文件
```

#### 核心組件說明
- **App.tsx**: 主應用組件，管理全局狀態和路由
- **DataTable.tsx**: 表格視圖組件，支持內聯編輯、排序、篩選
- **CardView.tsx**: 卡片視圖組件，提供更直觀的數據展示
- **TableManager.tsx**: 表格管理組件，處理表格的創建、編輯、刪除

### 後端架構 (Backend)

#### 技術棧
- **運行環境**: Node.js 18+
- **Web框架**: Express.js 4.18.2
- **數據庫**: Better-SQLite3 12.4.1
- **安全中間件**: Helmet 7.1.0
- **跨域處理**: CORS 2.8.5
- **日誌記錄**: Morgan 1.10.0
- **開發工具**: Nodemon 3.0.2

#### 目錄結構
```
server/
├── db/                  # 數據庫相關
│   ├── database.js      # 數據庫管理類
│   └── nocodb.sqlite    # SQLite數據庫文件
├── routes/              # API路由
│   ├── tables.js        # 表格相關API
│   └── rows.js          # 數據行相關API
├── scripts/             # 腳本文件
│   └── init-db.js       # 數據庫初始化腳本
├── server.js            # 服務器入口文件
├── package.json         # 後端依賴配置
└── Dockerfile           # 後端Docker配置
```

#### API接口設計
- **表格管理**:
  - `GET /api/tables` - 獲取所有表格
  - `POST /api/tables` - 創建新表格
  - `PUT /api/tables/:id` - 更新表格結構
  - `DELETE /api/tables/:id` - 刪除表格

- **數據管理**:
  - `GET /api/tables/:id/rows` - 獲取表格數據
  - `POST /api/tables/:id/rows` - 創建新數據行
  - `PUT /api/tables/:id/rows/:rowId` - 更新數據行
  - `DELETE /api/tables/:id/rows/:rowId` - 刪除數據行

- **系統監控**:
  - `GET /api/health` - 健康檢查接口

### 容器化部署架構

#### Docker配置
- **前端容器**: 基於Nginx的靜態文件服務
- **後端容器**: 基於Node.js的API服務
- **數據持久化**: 通過Docker Volume掛載SQLite數據庫

#### 部署文件
```
deployment/
├── docker-compose.yml           # 容器編排配置
├── Dockerfile                   # 主Dockerfile
├── nocodb-web-portal/
│   ├── Dockerfile.frontend      # 前端容器配置
│   └── Dockerfile.backend       # 後端容器配置
├── nginx.conf                   # Nginx配置
├── build-images.sh              # 鏡像構建腳本 (Linux)
├── build-images.ps1             # 鏡像構建腳本 (Windows)
├── deploy-from-images.sh        # 部署腳本
└── DEPLOYMENT.md                # 部署文檔
```

### 配置文件

#### 前端配置
- **vite.config.ts**: Vite構建配置，包含插件和別名設置
- **tailwind.config.js**: Tailwind CSS配置
- **tsconfig.json**: TypeScript編譯配置
- **components.json**: shadcn/ui組件配置

#### 項目配置
- **.env**: 環境變量配置
- **package.json**: 前端依賴和腳本配置
- **runtime.config.json**: 運行時配置

### 數據庫設計

#### SQLite數據庫結構
- **tables表**: 存儲表格元數據
  - id: 表格唯一標識
  - name: 表格名稱
  - columns: 列定義 (JSON格式)
  - created_at: 創建時間
  - updated_at: 更新時間

- **動態數據表**: 根據用戶定義動態創建
  - 支持多種數據類型: text, number, date, boolean, email, select
  - 自動生成主鍵和時間戳字段

### 開發工具鏈

#### 代碼質量
- **ESLint**: JavaScript/TypeScript代碼檢查
- **TypeScript**: 靜態類型檢查
- **Prettier**: 代碼格式化 (通過編輯器配置)

#### 構建和部署
- **Vite**: 快速的前端構建工具
- **Docker**: 容器化部署
- **GitHub Actions**: CI/CD流水線 (可選)

### 安全考慮

#### 前端安全
- **輸入驗證**: 使用Zod進行表單驗證
- **XSS防護**: React自動轉義和CSP策略
- **HTTPS**: 生產環境強制使用HTTPS

#### 後端安全
- **Helmet**: 設置安全HTTP頭
- **CORS**: 跨域請求控制
- **輸入清理**: SQL注入防護
- **錯誤處理**: 避免敏感信息洩露

### 性能優化

#### 前端優化
- **代碼分割**: Vite自動代碼分割
- **懶加載**: 組件按需加載
- **虛擬滾動**: 大數據集性能優化
- **緩存策略**: React Query數據緩存

#### 後端優化
- **數據庫索引**: SQLite查詢優化
- **連接池**: 數據庫連接管理
- **響應壓縮**: Gzip壓縮
- **健康檢查**: 服務監控

### 擴展性設計

#### 水平擴展
- **微服務架構**: 可拆分為獨立服務
- **負載均衡**: 支持多實例部署
- **數據庫分片**: 支持數據分布式存儲

#### 功能擴展
- **插件系統**: 支持自定義字段類型
- **API擴展**: RESTful API設計便於集成
- **主題系統**: 支持自定義UI主題
- **多語言**: 國際化支持框架
