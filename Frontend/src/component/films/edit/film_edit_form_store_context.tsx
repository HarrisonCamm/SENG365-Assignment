import React, { createContext, useContext } from "react";
import {FilmEditFormStore} from "./FilmEditFormStore";

// Create a context for the FilmEditFormStore
const FilmEditFormStoreContext = createContext<FilmEditFormStore | null>(null)

// Custom hook that returns the FilmEditFormStore from the context
export const useFilmEditFormStore = (): FilmEditFormStore => {
  const store = useContext(FilmEditFormStoreContext)

  // If the store is null, throw an error indicating that useFilmEditFormStore must be called within a FilmEditFormStoreProvider context
  if (store === null) {
    throw new Error("useFilmEditFormStore must be called only within a FilmEditFormStoreProvider context.")
  }

  return store
}

// Props interface for the FilmEditFormStoreProvider component
interface FilmEditFormStoreProviderProps {
  store: FilmEditFormStore
}

// FilmEditFormStoreProvider component that wraps its children with the FilmEditFormStoreContext.Provider
export const FilmEditFormStoreProvider: React.FunctionComponent<React.PropsWithChildren<FilmEditFormStoreProviderProps>> = ({store, children}) => {
  return (
    <FilmEditFormStoreContext.Provider value={store}>
      {children}
    </FilmEditFormStoreContext.Provider>
  )
}
