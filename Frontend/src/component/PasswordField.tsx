// Import necessary dependencies
import {RegisterStore} from "../page/register/RegisterStore"; // Importing RegisterStore from specified path
import React, {useCallback, useState} from "react"; // Importing React, useCallback, and useState from 'react' library
import {observer} from "mobx-react-lite"; // Importing observer from 'mobx-react-lite' library
import {IconButton, InputAdornment, TextField, Tooltip} from "@mui/material"; // Importing IconButton, InputAdornment, TextField, and Tooltip from '@mui/material' library
import {Visibility, VisibilityOff} from "@mui/icons-material"; // Importing Visibility and VisibilityOff from '@mui/icons-material' library
import {InputValue} from "../util/InputValue"; // Importing InputValue from specified path

// Define the type for the props passed to the component
interface PasswordFieldProps {
  passwordStore: InputValue<string> // Password input value and related methods
  loading: boolean // Loading state of the component
  labelText?: string // Optional label text for the password field
  externalErrorText?: string // Optional external error text to be displayed
  autoFocus?: boolean // Optional flag to automatically focus the password field
  tabIndex?: number // Optional tab index for the password field
}

// Define the PasswordField component as a functional component with props
export const PasswordField: React.FunctionComponent<PasswordFieldProps> = observer(({passwordStore: password, loading, labelText, externalErrorText, autoFocus, tabIndex}) => {

  // Define state variable to control password visibility
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false)

  // Function to toggle the visibility of the password
  const togglePasswordVisible = useCallback(() => {
    setPasswordVisible((current) => !current)
  }, [setPasswordVisible])

  // Function to handle password change event
  const onPasswordChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    password.setValue(evt.target.value)
  }, [password])

  // Render the password field component
  return (
    <TextField
      id={`password-${labelText ?? ''}`}
      label={labelText ?? 'Password'}
      variant='outlined'
      type={(passwordVisible) ? "text" : "password"}
      required
      disabled={loading}
      autoFocus={autoFocus}
      tabIndex={tabIndex}

      value={password.value}
      onChange={onPasswordChange}
      error={password.hasError || externalErrorText !== undefined}
      helperText={externalErrorText ?? password.error}

      InputProps={{
        endAdornment: (
          <InputAdornment position='end'>
            <Tooltip title={`${(passwordVisible) ? 'Hide' : 'Show'} password`}>
              <IconButton
                tabIndex={-1}
                aria-label="Toggle password visibility"
                onClick={togglePasswordVisible}
              >
                {(passwordVisible) ? <VisibilityOff/> : <Visibility/>}
              </IconButton>
            </Tooltip>
          </InputAdornment>
        )
      }}
    />
  )
})