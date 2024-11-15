import React, { createContext, useContext } from "react";
import {FilmSupplier} from "./FilmListPageStore";

const FilmSupplierContext = createContext<FilmSupplier | null>(null)

interface FilmSupplierProviderProps {
  store: FilmSupplier
}
export const FilmSupplierProvider: React.FunctionComponent<React.PropsWithChildren<FilmSupplierProviderProps>> = ({store, children}) => {
  return (
    <FilmSupplierContext.Provider value={store}>
      {children}
    </FilmSupplierContext.Provider>
  )
}

export const useFilmSupplierStore = (): FilmSupplier => {
  const store = useContext(FilmSupplierContext)

  if (store === null) {
    throw new Error("useFilmSupplierStore must be called only within an FilmSupplierProvider context.")
  }

  return store
}