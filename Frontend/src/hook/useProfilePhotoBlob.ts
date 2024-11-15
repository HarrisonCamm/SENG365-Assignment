import { observable } from "mobx"; // Importing observable from 'mobx' library
import { PhotoStore } from "../store/PhotoStore"; // Importing PhotoStore from specified path
import { useEffect, useState } from "react"; // Importing useEffect and useState from 'react' library

// Function to create the API path for a user's profile photo based on the user ID
const makePathForUserId = (userId: number) => `/users/${userId}/image`;

// Function to create an observable store for a user's profile photo
const makeStore = (userId: number) => {
  const store = new PhotoStore(makePathForUserId(userId)); // Create a new instance of PhotoStore with the API path for the user's profile photo
  store.fetchImage(); // Fetch the image data for the user's profile photo
  return observable(store, {}, { autoBind: true }); // Make the store observable and enable auto-binding
};

/**
 * MUST BE USED WITHIN AN OBSERVER
 */

// Custom hook to retrieve and manage a user's profile photo
export const useProfilePhotoBlob = (userId: number) => {
  const [store, setStore] = useState(() => makeStore(userId)); // Define state variable to hold the photo store

  // useEffect hook to handle changes in the store's API path and update the store accordingly
  useEffect(() => {
    if (store.apiPath !== makePathForUserId(userId)) {
      setStore(makeStore(userId));
    }
  }, [store, userId]);

  return store; // Return the photo store
};