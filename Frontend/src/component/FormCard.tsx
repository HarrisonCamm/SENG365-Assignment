import React, { FormEventHandler } from "react";
import { Card, CardContent, CardHeader, LinearProgress } from "@mui/material";
import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles";

// Props interface for the FormCard component
interface FormCardProps {
  title: React.ReactNode; // Title of the card
  subtitle?: string; // Subtitle of the card
  loading: boolean; // Indicates whether the card is in a loading state
  onSubmit: FormEventHandler; // Form submit event handler

  actions?: React.ReactNode; // Optional additional actions to display on the card

  cardStyles?: SxProps<Theme>; // Custom styles for the card component
  cardHeaderStyles?: SxProps<Theme>; // Custom styles for the card header component
  cardContentStyles?: SxProps<Theme>; // Custom styles for the card content component
}

// FormCard component
export const FormCard: React.FunctionComponent<React.PropsWithChildren<FormCardProps>> = (props) => {
  const {
    children,
    title,
    subtitle,
    loading,
    onSubmit,

    cardStyles,
    cardHeaderStyles,
    cardContentStyles,

    actions
  } = props;

  return (
    <Card sx={{ minWidth: 'sm', maxWidth: 450, width: '100%', ...cardStyles }}>
      {loading ? <LinearProgress /> : null}

      <form onSubmit={onSubmit}>
        <CardHeader title={title} subtitle={subtitle} sx={cardHeaderStyles} />

        <CardContent sx={{ display: 'flex', gap: 2, flexDirection: 'column', ...cardContentStyles }}>
          {children}
        </CardContent>

        {actions}
      </form>
    </Card>
  );
};
