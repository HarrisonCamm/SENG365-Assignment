import React, {useCallback, useState} from "react";
import {observer} from "mobx-react-lite";
import {useFilmViewStore} from "../../../film_view/film_view_store_context";
import {Button, Skeleton, Tooltip} from "@mui/material";
import {PlaceReviewEntryField} from "./PlaceReviewEntryField";
import {ApplicationStore} from "../../../../store/ApplicationStore";
import {Link} from "react-router-dom";

export const PlaceReviewButton: React.FunctionComponent = observer(() => {
  const store = useFilmViewStore()

  if (store.review.isLoading || store.film.details.isLoading) {
    return <Skeleton variant='rectangular' height={40} sx={{borderRadius: 1}}/>
  }
  else if (store.review.review !== null && store.film.details.film !== null) {
    return <PlaceReviewButtonContent/>
  }
  else {
    return (
      <Tooltip title='This element requires both review and film details to be available, but they have failed to load.'>
        <Skeleton variant='rectangular' color='error'/>
      </Tooltip>
    )
  }
})

const PlaceReviewButtonContent: React.FunctionComponent = observer(() => {
  const [showReviewEntry, setShowReviewEntry] = useState<boolean>(false)
  const store = useFilmViewStore()
  const details = store.film.details

  const onToggleShowReviewEntry = useCallback(() => {
    setShowReviewEntry((prev) => !prev)
  }, [])


  if (!ApplicationStore.main.isLoggedIn) {
    return (
      <Button component={Link} to='/login' variant='contained' color='secondary'>Log in to Review</Button>
    )
  }
  else if (details.film!.directorId === ApplicationStore.main.user!.id) {
    return (
      <Button variant='contained' disabled>This is your film</Button>
    )
  }
  else if (!showReviewEntry) {
    return (
      <Button variant='contained' color='secondary' onClick={onToggleShowReviewEntry}>Place Review</Button>
    )
  }
  else {
    // Show the review entry field
    return <PlaceReviewEntryField onClose={onToggleShowReviewEntry}/>
  }
})

