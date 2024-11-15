import React, { createContext, useContext } from "react";
import {FilmListStore} from "./FilmListStore";

const FilmListStoreContext = createContext<FilmListStore | null>(null)

interface FilmListStoreStoreProviderProps {
  store: FilmListStore
}
export const FilmListStoreProvider: React.FunctionComponent<React.PropsWithChildren<FilmListStoreStoreProviderProps>> = ({store, children}) => {
  return (
    <FilmListStoreContext.Provider value={store}>
      {children}
    </FilmListStoreContext.Provider>
  )
}

export const useFilmListStore = (): FilmListStore => {
  const store = useContext(FilmListStoreContext)

  if (store === null) {
    throw new Error("useFilmListStore must be called only within an FilmListStoreProvider context.")
  }

  return store
}