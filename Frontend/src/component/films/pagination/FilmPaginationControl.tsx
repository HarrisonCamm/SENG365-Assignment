import React from "react";
import { useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useFilmListStore } from "../../../page/film_list/film_list_store_context";
import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight, FirstPage, LastPage } from "@mui/icons-material";
import { FilmListPageStore } from "../../../page/film_list/FilmListPageStore";
import { PageableFilmStore } from "./PageableFilmStore";

// Define the props interface for FilmPaginationControl component
interface FilmPaginationControlProps {
  store: PageableFilmStore; // Represents the PageableFilmStore used by the component
}

// FilmPaginationControl component
export const FilmPaginationControl: React.FunctionComponent<FilmPaginationControlProps> = observer(({store}) => {
  const page = store.page;

  // Callback function for clicking the "Go to first page" button
  const onFirstPageClick = useCallback(() => {
    store.goToFirstPage();
  }, [store]);

  // Callback function for clicking the "Go to previous page" button
  const onLeftClick = useCallback(() => {
    store.goToPrevPage();
  }, [store]);

  // Callback function for clicking the "Go to next page" button
  const onRightClick = useCallback(() => {
    store.goToNextPage();
  }, [store]);

  // Callback function for clicking the "Go to last page" button
  const onLastPageClick = useCallback(() => {
    store.goToLastPage();
  }, [store]);

  return (
    <Stack spacing={0}>
      <Typography variant='caption' color='text.secondary'>{page.totalResultCount} Results</Typography>
      {(page.maxPageIndex === 0) ? undefined : (
        // Show the page navigation stuff
        <Stack direction='row' spacing={1} sx={{alignItems: 'center'}}>

          {(page.pageIndex > 0) && (
            <>
              <Tooltip title='Go to first page'>
                <IconButton size='small' onClick={onFirstPageClick}><FirstPage/></IconButton>
              </Tooltip>
              <Tooltip title='Go to previous page'>
                <IconButton size='small' onClick={onLeftClick}><ChevronLeft/></IconButton>
              </Tooltip>
            </>
          )}

          <Tooltip title={`Showing results ${page.pageIndex * page.pageSize + 1} - ${page.pageIndex * page.pageSize + (page.filmCount ?? 0)}`}>
            <Typography variant='body1' color='text.secondary'>Page {page.pageIndex + 1} / {page.maxPageIndex! + 1}</Typography>
          </Tooltip>

          {(page.pageIndex < page.maxPageIndex!) && (
            <>
              <Tooltip title='Go to next page'>
                <IconButton size='small' onClick={onRightClick}><ChevronRight/></IconButton>
              </Tooltip>
              <Tooltip title='Go to last page'>
                <IconButton size='small' onClick={onLastPageClick}><LastPage/></IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      )}
    </Stack>
  );
});