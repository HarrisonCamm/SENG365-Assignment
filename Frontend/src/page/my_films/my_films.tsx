import React from "react";
import {observer, useLocalObservable} from "mobx-react-lite";
import {Box, Card, CardContent, CardHeader, Typography} from "@mui/material";
import {FilmSkeleton} from "../film_list/component/FilmSkeleton";
import {FilmListItem} from "../film_list/component/FilmListItem";
import {LoadStatusError} from "../../util/LoadStatus";
import {ErrorPresenter} from "../../component/ErrorPresenter";
import {FilmSupplierProvider} from "../film_list/film_supplier_context";
import {MyFilmsStore} from "./MyFilmsStore";
import {FilmGenresStore} from "../../store/FilmGenresStore";
import {FilmGenresStoreProvider} from "../../store/film_genres_store_context";
import {FilmPaginationControl} from "../../component/films/pagination/FilmPaginationControl";

export const MyFilmsPage: React.FunctionComponent = observer(() => {
  const store = useLocalObservable(() => new MyFilmsStore())
  const genres = useLocalObservable(() => new FilmGenresStore())
  
  let content
  if (store.isLoading) {
    content = <FilmsSkeleton/>
  }
  else if (store.films !== null) {
    if (store.films.length > 0) {
      content = (
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
          {store.films.map((film, index) => (
            <FilmListItem key={`${film.film.filmId}`} index={index}/>
          ))}
        </Box>
      )
    }
    else {
      content = (
        <Typography variant="body1">No similar films found</Typography>
      )
    }

  }
  else if (store.loadStatus instanceof LoadStatusError) {
    content = <ErrorPresenter error={store.loadStatus.error}/>
  }
  else {
    content = <Typography variant='body1'>We've found ourselves in an unexpected state... Please reload the page to try again.</Typography>
  }


  return (
    <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingTop: 2}}>
      <Card sx={{minWidth: 'sm', maxWidth: "lg", width: '100%'}}>
        <CardHeader title="My Films" subheader="Films that you've created or reviewed." />

        <CardContent>
          <FilmGenresStoreProvider store={genres}>
            <FilmSupplierProvider store={store}>
              <Box>
                <FilmPaginationControl store={store}/>
              </Box>

              <Box>
                {content}
              </Box>
            </FilmSupplierProvider>
          </FilmGenresStoreProvider>
        </CardContent>
      </Card>
    </Box>
  )
})

const FilmsSkeleton: React.FunctionComponent = () => {
  return (
    <Box>
      <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
        <FilmSkeleton/>
        <FilmSkeleton opacity={0.65}/>
        <FilmSkeleton opacity={0.3}/>
      </Box>
    </Box>
  )
}