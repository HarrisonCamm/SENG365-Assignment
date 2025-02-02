import React, {useCallback, useState} from "react";
import {observer} from "mobx-react-lite";
import {useNavigate} from "react-router-dom";
import {useFilmViewStore} from "../film_view_store_context";
import {LoadStatusDone, LoadStatusError} from "../../../util/LoadStatus";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  LinearProgress,
  Tooltip
} from "@mui/material";
import {Check, Delete} from "@mui/icons-material";
import {ErrorPresenter} from "../../../component/ErrorPresenter";


export const FilmViewPageEditControlsDelete: React.FunctionComponent = observer(() => {
  const navigate = useNavigate()
  const store = useFilmViewStore()
  const [open, setOpen] = useState<boolean>(false)

  const openPopup = useCallback(() => {
    setOpen(true)
  }, [])

  const closePopup = useCallback(() => {
    if (!store.isDeleting && !(store.deleteStatus instanceof LoadStatusDone)) {
      setOpen(false)
    }

  }, [store.isDeleting, store.deleteStatus])

  const onDelete = useCallback(async () => {
    const success = await store.deleteFilm()
    if (success) {
      setTimeout(() => {
        navigate("/")
      }, 750)
    }
  }, [navigate, store])

  return (
    <>
      <Tooltip title='Delete Film'>
        <IconButton
          color='error'
          onClick={openPopup}
        >
          <Delete/>
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={closePopup}>
        {(store.isDeleting) && <LinearProgress color='error'/>}

        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this film?</DialogContentText>
          <DialogContentText>This action cannot be reversed.</DialogContentText>
          {(store.deleteStatus instanceof LoadStatusError) && (
            <DialogContentText color='error'>
              Failed to delete film:<br/><ErrorPresenter error={store.deleteStatus.error}/>
            </DialogContentText>
          )}
        </DialogContent>

        <DialogActions sx={{display: 'flex', justifyContent: 'space-between'}}>
          <Button
            onClick={closePopup}
            disabled={store.isDeleting}
          >
            Cancel
          </Button>

          <Button
            onClick={(store.deleteStatus instanceof LoadStatusDone) ? undefined : onDelete}
            variant='contained'
            color={(store.deleteStatus instanceof LoadStatusDone) ? 'success' : 'error'}
            disabled={store.isDeleting}
          >
            {(store.deleteStatus instanceof LoadStatusDone) ? <Check/> : "Yes, proceed"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
})