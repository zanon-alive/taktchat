import React from "react";

import TextField from "@mui/material/TextField";

const InputComponent = React.forwardRef((props, ref) => {
  const { inputRef, ...other } = props;
  return <div ref={inputRef || ref} {...other} />;
});

const OutlinedDiv = ({
  InputProps,
  children,
  InputLabelProps,
  label,
  ...other
}) => {
  return (
    <TextField
      {...other}
      variant="outlined"
      label={label}
      multiline
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
      InputProps={{
        inputComponent: InputComponent,
        ...InputProps
      }}
      inputProps={{ children: children }}
    />
  );
};

export default OutlinedDiv;