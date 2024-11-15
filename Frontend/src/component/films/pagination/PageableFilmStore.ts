// Define the interface for the PageableFilmStore
export interface PageableFilmStore {
  page: PageableFilmStorePage; // Represents the current page of the pageable film store

  goToNextPage(): Promise<void>; // Method to navigate to the next page of the film list
  goToPrevPage(): Promise<void>; // Method to navigate to the previous page of the film list
  goToFirstPage(): Promise<void>; // Method to navigate to the first page of the film list
  goToLastPage(): Promise<void>; // Method to navigate to the last page of the film list
}

// Define the interface for the PageableFilmStorePage
export interface PageableFilmStorePage {
  readonly pageSize: number; // Represents the number of films displayed per page
  pageIndex: number; // Represents the current page index

  totalResultCount: number | null; // Represents the total number of results in the film list

  get filmCount(): number | null; // Method to get the number of films in the current page
  get maxPageIndex(): number | null; // Method to get the maximum page index in the film list
}