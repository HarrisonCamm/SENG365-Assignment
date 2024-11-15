import React from "react";
import {observer} from "mobx-react-lite";
import {Box, Button} from "@mui/material";
import {FilmViewPageEditControlsEdit} from "./FilmViewPageEditControlsEdit";
import {FilmViewPageEditControlsDelete} from "./FilmViewPageEditControlsDelete";
import {Edit} from "@mui/icons-material";



export const FilmViewPageEditControls: React.FunctionComponent = observer(() => {
  return (
    <Box sx={{display: 'flex', flexDirection: 'row'}}>
      <FilmViewPageEditControlsEdit/>

      <FilmViewPageEditControlsDelete/>
    </Box>
  )
})

