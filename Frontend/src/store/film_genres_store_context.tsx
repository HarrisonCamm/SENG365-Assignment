import React, { createContext, useContext } from "react";
import {FilmGenresStore} from "./FilmGenresStore";

const FilmGenresStoreContext = createContext<FilmGenresStore | null>(null)

interface FilmGenresStoreProviderProps {
  store: FilmGenresStore
}
export const FilmGenresStoreProvider: React.FunctionComponent<React.PropsWithChildren<FilmGenresStoreProviderProps>> = ({store, children}) => {
  return (
    <FilmGenresStoreContext.Provider value={store}>
      {children}
    </FilmGenresStoreContext.Provider>
  )
}

export const useFilmGenresStore = (): FilmGenresStore => {
  const store = useContext(FilmGenresStoreContext)

  if (store === null) {
    throw new Error("useFilmGenresStore must be called only within an FilmGenresStoreProvider context.")
  }

  return store
}