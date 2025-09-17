// API 服務配置
// API 基礎配置
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // 生產環境通過 nginx 代理
  : 'http://localhost:3003/api';  // 開發環境直接連接

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint: string, options: RequestOptions = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // 表格相關 API
  async getTables() {
    return this.request('/tables');
  }

  async getTable(tableId) {
    return this.request(`/tables/${tableId}`);
  }

  async createTable(tableData) {
    return this.request('/tables', {
      method: 'POST',
      body: JSON.stringify(tableData),
    });
  }

  async updateTable(tableId, tableData) {
    return this.request(`/tables/${tableId}`, {
      method: 'PUT',
      body: JSON.stringify(tableData),
    });
  }

  async deleteTable(tableId) {
    return this.request(`/tables/${tableId}`, {
      method: 'DELETE',
    });
  }

  // 行數據相關 API
  async getTableRows(tableId) {
    return this.request(`/tables/${tableId}/rows`);
  }

  async createRow(tableId, rowData) {
    return this.request(`/tables/${tableId}/rows`, {
      method: 'POST',
      body: JSON.stringify(rowData),
    });
  }

  async updateRow(tableId, rowId, rowData) {
    return this.request(`/tables/${tableId}/rows/${rowId}`, {
      method: 'PUT',
      body: JSON.stringify(rowData),
    });
  }

  async deleteRow(tableId, rowId) {
    return this.request(`/tables/${tableId}/rows/${rowId}`, {
      method: 'DELETE',
    });
  }

  async batchDeleteRows(tableId, rowIds) {
    return this.request(`/tables/${tableId}/rows/batch`, {
      method: 'POST',
      body: JSON.stringify({
        operation: 'delete',
        rowIds,
      }),
    });
  }

  async batchUpdateRows(tableId, operations) {
    return this.request(`/tables/${tableId}/rows/batch`, {
      method: 'POST',
      body: JSON.stringify({ operations }),
    });
  }

  // 健康檢查
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;
