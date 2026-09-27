import { useState } from 'react';

export default function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  const handleChange = (field, value) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: '',
    }));
  };

  const handleSubmit = (onSubmit) => {
    const validationErrors = validate(values);

    setErrors(validationErrors);
    setIsValid(Object.keys(validationErrors).length === 0);

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(values);
      return true;
    }

    return false;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setIsValid(false);
  };

  return {
    values,
    errors,
    handleChange,
    handleSubmit,
    reset,
    isValid,
  };
}