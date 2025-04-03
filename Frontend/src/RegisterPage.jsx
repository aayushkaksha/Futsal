const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (validateForm()) {
    // Remove confirmPassword before sending to API
    const { confirmPassword: _confirmPassword, ...registerData } = formData;
    const success = await register(registerData);
    if (success) {
      navigate('/');
    }
  }
}; 