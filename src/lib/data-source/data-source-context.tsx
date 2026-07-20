import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { initDataSource, setDataSource as persistDataSource, getRefreshVersion, subscribeToDataSourceChange, resetLocalData as persistResetLocalData, type DataSourceType } from './data-source';

interface DataSourceContextValue {
  dataSource: DataSourceType;
  isReady: boolean;
  refreshVersion: number;
  setDataSource: (source: DataSourceType) => Promise<void>;
  resetLocalData: () => Promise<void>;
}

const DataSourceContext = createContext<DataSourceContextValue | null>(null);

function DataSourceProvider({ children }: PropsWithChildren) {
  const [dataSource, setDataSourceState] = useState<DataSourceType>('local');
  const [refreshVersion, setRefreshVersion] = useState(getRefreshVersion());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      const source = await initDataSource();
      setDataSourceState(source);
      setIsReady(true);
    }
    init();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToDataSourceChange(() => {
      setRefreshVersion(getRefreshVersion());
    });
    return unsubscribe;
  }, []);

  const handleSetDataSource = useCallback(async (source: DataSourceType) => {
    setDataSourceState(source);
    await persistDataSource(source);
  }, []);

  const handleResetLocalData = useCallback(async () => {
    await persistResetLocalData();
    setRefreshVersion(getRefreshVersion());
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <DataSourceContext.Provider value={{ dataSource, isReady, refreshVersion, setDataSource: handleSetDataSource, resetLocalData: handleResetLocalData }}>
      {children}
    </DataSourceContext.Provider>
  );
}

function useDataSource(): DataSourceContextValue {
  const context = useContext(DataSourceContext);
  if (!context) {
    throw new Error('useDataSource must be used within a DataSourceProvider');
  }
  return context;
}

export { DataSourceProvider, useDataSource };
