import React, { createContext, useContext } from "react";
import {FilmViewStore} from "./FilmViewStore";

const FilmViewStoreContext = createContext<FilmViewStore | null>(null)

interface ProfileStoreProviderProps {
  store: FilmViewStore
}
export const FilmViewStoreProvider: React.FunctionComponent<React.PropsWithChildren<ProfileStoreProviderProps>> = ({store, children}) => {
  return (
    <FilmViewStoreContext.Provider value={store}>
      {children}
    </FilmViewStoreContext.Provider>
  )
}

export const useFilmViewStore = (): FilmViewStore => {
  const store = useContext(FilmViewStoreContext)

  if (store === null) {
    throw new Error("useFilmViewStore must be called only within an FilmViewStoreProvider ontext.")
  }

  return store
}