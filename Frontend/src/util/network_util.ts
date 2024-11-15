import {format} from "date-fns";

export const getApiBaseUrl = (): string => {
  return process.env.REACT_APP_API_URL ?? "https://seng365.csse.canterbury.ac.nz/api/v1"
}

export const makeApiPath = (apiPath: string): string => {
  return process.env.REACT_APP_API_URL + apiPath
}

export const formatDateForFilm = (date: Date): string => {
  return format(date, "yyyy-MM-dd hh:mm:ss")
}