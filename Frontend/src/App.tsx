import React, {useMemo} from 'react';
import {createTheme, CssBaseline, Paper, ThemeProvider} from "@mui/material";
import {useSystemTheme} from "./hook/useSystemTheme";
import {NavBar} from "./component/NavBar";
import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import {FilmListPageRoot} from "./page/film_list/film_list";
import {NotFoundPage} from "./page/404";
import {RegisterPage} from "./page/register/register";
import {LoginPage} from "./page/login";
import {observer} from "mobx-react-lite";
import {ApplicationStore} from "./store/ApplicationStore";
import {OtherUserProfilePage, ProfilePage} from "./page/profile/profile";
import {FilmViewPage} from "./page/film_view/film_view";
import {FilmPageLoader} from "./component/films/FilmPageLoader";
import {CreateFilmPage} from "./page/create_film/create_film";
import { MyFilmsPage } from './page/my_films/my_films';

const App = () => {
  const systemTheme = useSystemTheme()

  const theme = useMemo(
    () => createTheme({
      palette: {
        mode: systemTheme,
        neutral: {
          main: '#fff'
        }
      }
    }),
    [systemTheme]
  )

  console.log(systemTheme)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>

      <Paper sx={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
        <Router>
          <NavBar/>

          <AppRoutes/>
        </Router>
      </Paper>
    </ThemeProvider>
  );
}

const AppRoutes: React.FunctionComponent = observer(() => {
  const isLoggedIn = ApplicationStore.main.isLoggedIn

  return (
    <Routes>
      <Route index element={<FilmListPageRoot/>}/>
      {!isLoggedIn && <Route path="/login" element={<LoginPage/>}/>}
      {!isLoggedIn && <Route path="/register" element={<RegisterPage/>}/>}

      {isLoggedIn && <Route path="/profile" element={<ProfilePage user={ApplicationStore.main.user!}/>} />}
      {isLoggedIn && <Route path={`/profile/${ApplicationStore.main.user!.id}`} element={<Navigate to='/profile' replace/>}/>}
      <Route path="/profile/:userId" element={<OtherUserProfilePage/>}/>

      {isLoggedIn && <Route path="/films/create" element={<CreateFilmPage/>}/>}
      <Route path="/films/:filmId" element={<FilmPageLoader pageBuilder={(film) => <FilmViewPage film={film}/>}/>}/>

      {isLoggedIn && <Route path="/my_films" element={<MyFilmsPage/>}/>}

      <Route path="*" element={<NotFoundPage/>} />
    </Routes>
  )
})

export default App;
