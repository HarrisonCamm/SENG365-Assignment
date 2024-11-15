import React, { createContext, useContext } from "react"; // Importing React, createContext, and useContext from 'react' library
import { CreateFilmStore } from "./CreateFilmStore"; // Importing CreateFilmStore from specified path

// Create a context for the CreateFilmStore
const CreateFilmStoreContext = createContext<CreateFilmStore | null>(null);

// Define the props for the CreateFilmStoreProvider component
interface CreateFilmStoreProviderProps {
  store: CreateFilmStore; // CreateFilmStore instance
}

// CreateFilmStoreProvider component to provide the CreateFilmStore through context
export const CreateFilmStoreProvider: React.FunctionComponent<React.PropsWithChildren<CreateFilmStoreProviderProps>> = ({ store, children }) => {
  return (
    <CreateFilmStoreContext.Provider value={store}>
      {children}
    </CreateFilmStoreContext.Provider>
  );
};

// Custom hook to access the CreateFilmStore from the context
export const useCreateFilmStore = (): CreateFilmStore => {
  const store = useContext(CreateFilmStoreContext);

  if (store === null) {
    throw new Error("useCreateFilmStore must be called only within a CreateFilmStoreProvider context.");
  }

  return store;
};
