import React, { useEffect, useState } from "react"; // Importing React, useEffect, and useState from 'react' library
import { observer } from "mobx-react-lite"; // Importing observer from 'mobx-react-lite' library
import { observable } from "mobx"; // Importing observable from 'mobx' library
import { Box, Skeleton, Typography } from "@mui/material"; // Importing Box, Skeleton, and Typography from '@mui/material' library
import { UserStore } from "../store/UserStore"; // Importing UserStore from specified path
import { ProfileStore } from "../page/profile/ProfileStore"; // Importing ProfileStore from specified path
import { ProfilePhotoBlobView } from "./ProfilePhotoBlobView"; // Importing ProfilePhotoBlobView component from specified path

// Function to create an observable store for a user
const makeStore = (userId: number) => observable(new UserStore(userId), {}, {autoBind: true})

// Define the type for the props passed to the component
interface UserInfoRowProps {
  userId: number // User ID
  size?: number // Size of the profile photo
}

// Define the UserInfoRow component as a functional component with props
export const UserInfoRow: React.FunctionComponent<UserInfoRowProps> = observer(({userId, size = 32}) => {

  // Define state variable to hold the user store
  const [store, setStore] = useState(() => makeStore(userId))

  // useEffect hook to handle changes in the user ID and update the store accordingly
  useEffect(() => {
    if (store.id !== userId) {
      setStore(makeStore(userId))
    }
  }, [store, userId])

  // Render the user information row
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <ProfilePhotoBlobView image={store.profilePhoto.imageData} size={size}/> {/* Render the profile photo using the ProfilePhotoBlobView component */}

      <Box sx={{flex: 1, paddingLeft: 1}}>
        <Typography variant="body1">{(store.profileDetails.hasDetails) ? <>{store.profileDetails.firstName} {store.profileDetails.lastName}</> : <Skeleton/>}</Typography> {/* Render the user's first and last name if available, otherwise render a Skeleton loading animation */}
      </Box>
    </Box>
  )
})