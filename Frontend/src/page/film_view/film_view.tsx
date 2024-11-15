import React, {useEffect, useState} from "react";
import {observer, useLocalObservable} from "mobx-react-lite";
import {FilmStore} from "../../store/FilmStore";
import {observable} from "mobx";
import {FilmViewStore} from "./FilmViewStore";
import {FilmViewStoreProvider, useFilmViewStore} from "./film_view_store_context";
import {Box, Card, CardContent, Grid, LinearProgress, Skeleton, Typography} from "@mui/material";
import {FilmViewPageOverviewColumn} from "./component/FilmViewPageOverviewColumn";
import {FilmViewPageReviewColumn} from "./component/FilmViewPageReviewColumn";
import {FilmViewPageSimilarFilmsRow} from "./component/FilmViewPageSimilarFilmsRow";
import {FilmGenresStore} from "../../store/FilmGenresStore";
import {FilmGenresStoreProvider} from "../../store/film_genres_store_context";
import {FilmViewPagePicture} from "./component/FilmViewPagePicture";

const makeStore = (film: FilmStore) => observable(new FilmViewStore(film), {}, {autoBind: true})

interface FilmViewPageProps {
  film: FilmStore
}
export const FilmViewPage: React.FunctionComponent<FilmViewPageProps> = observer(({film}) => {
  const [store, setStore] = useState(() => makeStore(film))
  const genres = useLocalObservable(() => new FilmGenresStore())

  useEffect(() => {
    if (store.film !== film) {
      setStore(makeStore(film))
    }
  }, [store, film])

  return (
    <Box sx={{display: 'flex', justifyContent: 'center', marginTop: 3}}>
      <FilmGenresStoreProvider store={genres}>
        <FilmViewStoreProvider store={store}>
          <Card sx={{minWidth: 'sm', maxWidth: "lg", width: '100%'}}>
            {(store.review.isLoading || store.film.photo.isLoading || store.film.details.isLoading) && <LinearProgress/>}

            <CardContent sx={{
              flexDirection: "row"
            }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={5}>
                  <FilmViewPagePicture/>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FilmViewPageOverviewColumn/>
                </Grid>

                <Grid item xs={12}>
                  <FilmViewPageDescription/>
                </Grid>

                <Grid item xs={12}>
                  <FilmViewPageReviewColumn/>
                </Grid>

                

                <Grid item xs={12}>
                  <FilmViewPageSimilarFilmsRow/>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </FilmViewStoreProvider>
      </FilmGenresStoreProvider>
    </Box>
  )
})


const FilmViewPageDescription = observer(() => {
  const store = useFilmViewStore()

  if (store.film.details.isLoading) {
    return (
      <Typography variant='body1'><Skeleton/></Typography>
    )
  }
  else {
    return <Typography variant='body1' sx={{whiteSpace: 'pre-line'}}>{store.film.details.film?.description ?? "No description"}</Typography>
  }
})

