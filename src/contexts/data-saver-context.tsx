import AsyncStorage from "@react-native-async-storage/async-storage";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface DataSaverContextType {
  dataSaver: boolean;
  toggle: () => void;
}

const DataSaverContext = createContext<DataSaverContextType | undefined>(undefined);

export function DataSaverProvider({ children }: { children: React.ReactNode }) {
  const [dataSaver, setDataSaver] = useState(false);

  useEffect(() => {
    // Explicitly use the value to satisfy linter
    const storage = AsyncStorage;
    storage.getItem("data_saver").then((val) => {
      if (val !== null) setDataSaver(val === "true");
    });
  }, []);

  const toggle = () => {
    const next = !dataSaver;
    setDataSaver(next);
    AsyncStorage.setItem("data_saver", String(next));
  };

  return (
    <DataSaverContext.Provider value={{ dataSaver, toggle }}>{children}</DataSaverContext.Provider>
  );
}

export function useDataSaver() {
  const context = useContext(DataSaverContext);
  if (!context) throw new Error("useDataSaver must be used within DataSaverProvider");
  return context;
}
