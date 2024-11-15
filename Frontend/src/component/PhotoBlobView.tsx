import React, {useEffect, useState} from "react"; // Importing React, useEffect, and useState from 'react' library

// Define the type for the props passed to the component
interface PhotoBlobViewProps {
  image: Blob | null | undefined // Blob image data or null/undefined if no image is available
  imageBuilder: (imageUrl: string) => React.ReactElement<any, any> // Function that builds the image component using the image URL
  defaultBuilder: () => React.ReactElement<any, any> // Function that builds the default component when no image is available
}

// Define the PhotoBlobView component as a functional component with props
export const PhotoBlobView: React.FunctionComponent<PhotoBlobViewProps> = ({image: imageBlob, imageBuilder, defaultBuilder}) => {

  // Define state variable to hold the image URL
  const [image, setImage] = useState<string | null>(null)

  // useEffect hook to handle changes in the image blob
  useEffect(() => {
    if (!imageBlob) {
      setImage(null) // If image blob is null or undefined, set the image URL to null
    }
    else {
      const url = URL.createObjectURL(imageBlob) // Create a temporary URL for the image blob
      setImage(url) // Set the image URL to the temporary URL
      return () => {
        URL.revokeObjectURL(url) // Revoke the temporary URL when the component is unmounted or when the image blob changes
      }
    }
  }, [imageBlob])

  // Render the component based on the image availability
  if (image === null) {
    return defaultBuilder() // If no image is available, render the default component
  }
  else {
    return imageBuilder(image) // If an image is available, render the image component using the image URL
  }
}