-- 在 Supabase SQL 编辑器中运行此脚本来创建所需的数据表

-- 创建表格表 (tables)
CREATE TABLE IF NOT EXISTS public.tables (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  columns JSONB NOT NULL DEFAULT '[]',
  user_id VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建行数据表 (rows)
CREATE TABLE IF NOT EXISTS public.rows (
  id VARCHAR PRIMARY KEY,
  table_id VARCHAR NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  user_id VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tables_user_id ON public.tables(user_id);
CREATE INDEX IF NOT EXISTS idx_tables_created_at ON public.tables(created_at);
CREATE INDEX IF NOT EXISTS idx_rows_table_id ON public.rows(table_id);
CREATE INDEX IF NOT EXISTS idx_rows_user_id ON public.rows(user_id);
CREATE INDEX IF NOT EXISTS idx_rows_created_at ON public.rows(created_at);

-- 启用行级安全 (RLS) - 可选，用于多用户场景
-- ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.rows ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略 - 可选，用于多用户场景
-- CREATE POLICY "Users can only see their own tables" ON public.tables
--   FOR ALL USING (auth.uid()::text = user_id);

-- CREATE POLICY "Users can only see their own rows" ON public.rows
--   FOR ALL USING (auth.uid()::text = user_id);

-- 添加触发器来自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tables_updated_at ON public.tables;
CREATE TRIGGER update_tables_updated_at 
  BEFORE UPDATE ON public.tables 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_rows_updated_at ON public.rows;
CREATE TRIGGER update_rows_updated_at 
  BEFORE UPDATE ON public.rows 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();