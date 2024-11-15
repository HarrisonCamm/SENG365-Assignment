import React, {useEffect, useState} from "react"; // Importing React, useEffect, and useState from 'react' library
import {AccountCircle} from "@mui/icons-material"; // Importing AccountCircle icon from '@mui/icons-material' library
import {SvgIconTypeMap} from "@mui/material/SvgIcon/SvgIcon"; // Importing SvgIconTypeMap from '@mui/material/SvgIcon/SvgIcon' module
import {PhotoBlobView} from "./PhotoBlobView"; // Importing PhotoBlobView component from specified path

// Define the type for the props passed to the component
interface ProfilePhotoBlobViewProps {
  image: Blob | null | undefined // Blob image data or null/undefined if no image is available
  size: number // Size of the profile photo
  color?: SvgIconTypeMap["props"]["color"] // Color of the default profile icon
  style?: React.CSSProperties // Additional styles for the profile photo component
}

// Define the ProfilePhotoBlobView component as a functional component with props
export const ProfilePhotoBlobView: React.FunctionComponent<ProfilePhotoBlobViewProps> = ({ image, size, color, style }) => {
  return (
    <PhotoBlobView
      image={image}
      imageBuilder={(imageUrl) => (
        <img
          src={imageUrl} // Set the image URL as the source of the img tag
          style={{...(style ?? {}), width: size, height: size, borderRadius: size/2}} // Apply styles to the img tag
          alt="Profile" // Alt text for the image
        />
      )}
      defaultBuilder={() => <AccountCircle sx={{...(style ?? {}), fontSize: size}} color={color}/>} // Render the default profile icon
    />
  )
}
