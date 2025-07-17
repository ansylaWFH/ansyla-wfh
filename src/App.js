import React, { useState, useEffect } from 'react';

// Main App component
const App = () => {
    // State to hold form data for all fields
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        gender: '',
        country: '',
        city: '',
        qualification: ''
    });

    // State for dark mode, initialized to true (default dark mode)
    const [darkMode, setDarkMode] = useState(true);

    // State to control the current step of the form
    // Total steps: 1 (Intro) + 7 (Fields) = 8 steps (no review page)
    const [currentStep, setCurrentStep] = useState(1);

    // State to control showing the success message after submission
    const [isSubmitted, setIsSubmitted] = useState(false);

    // State for loading indicator during form submission
    const [isLoading, setIsLoading] = useState(false);

    // State for animation key to trigger re-render and animation for step transitions
    const [animationKey, setAnimationKey] = useState(0);

    // State to store validation errors for the *current* field
    const [validationError, setValidationError] = useState('');

    // Total number of steps (Intro + Fields)
    const totalSteps = 8; // 1 (Intro) + 7 (Fields)

    // Effect to manage dark mode class on the documentElement (html tag)
    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Handles changes in form input fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        // Clear validation error for the field being edited
        setValidationError('');
    };

    // Displays a custom alert message (e.g., for submission errors)
    const showCustomAlert = (message) => {
        const alertBox = document.createElement('div');
        alertBox.className = `fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ease-in-out
                              ${darkMode ? 'bg-red-700 text-white' : 'bg-red-500 text-white'}`;
        alertBox.textContent = message;
        document.body.appendChild(alertBox);

        setTimeout(() => {
            alertBox.remove();
        }, 5000); // Alert stays for 5 seconds
    };

    // Validates the current field before proceeding to the next step
    const validateCurrentStep = () => {
        let error = '';
        switch (currentStep) {
            case 1: // Intro page - always valid
                break;
            case 2: // Name
                if (!formData.name.trim()) {
                    error = 'Name is required.';
                }
                break;
            case 3: // Email
                if (!formData.email.trim()) {
                    error = 'Email is required.';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                    error = 'Please enter a valid email address.';
                }
                break;
            case 4: // Phone
                if (!formData.phone.trim()) {
                    error = 'Phone number is required.';
                } else if (!/^[0-9]{10,15}$/.test(formData.phone)) {
                    error = 'Please enter a valid phone number (10-15 digits).';
                }
                break;
            case 5: // Gender
                if (!formData.gender) {
                    error = 'Gender is required.';
                }
                break;
            case 6: // Country
                if (!formData.country) {
                    error = 'Country is required.';
                }
                break;
            case 7: // City
                if (!formData.city.trim()) {
                    error = 'City is required.';
                }
                break;
            case 8: // Qualification (now the last field step)
                if (!formData.qualification) {
                    error = 'Highest qualification is required.';
                }
                break;
            default:
                break;
        }
        setValidationError(error);
        return !error; // Return true if no error, false otherwise
    };

    // Handles moving to the next step in the form
    const handleNext = async () => { // Made async to handle submission
        if (validateCurrentStep()) {
            if (currentStep === totalSteps) { // If it's the last field step
                await handleSubmit(); // Directly submit the form
            } else {
                setCurrentStep(prevStep => prevStep + 1);
                setAnimationKey(prevKey => prevKey + 1); // Trigger animation (for re-render, not visibility)
            }
        } else {
            // Only show alert if there's a validation error and it's not the intro page
            if (currentStep !== 1) {
                 showCustomAlert('Please correct the highlighted field.');
            }
        }
    };

    // Handles moving to the previous step in the form
    const handlePrevious = () => {
        setValidationError(''); // Clear any validation errors when going back
        setCurrentStep(prevStep => prevStep - 1);
        setAnimationKey(prevKey => prevKey + 1); // Trigger animation (for re-render, not visibility)
    };

    // Handles form submission, sending data to the webhook
    const handleSubmit = async () => { // Removed 'e' parameter as it's called internally
        setIsLoading(true); // Show loading indicator

        const webhookUrl = 'https://hook.eu2.make.com/gua8l1hq3mvr9yk5792cekjjfan62bcy';

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log('Form Data Successfully Sent to Webhook:', formData);
                setIsSubmitted(true); // Show success message page
            } else {
                console.error('Failed to send data to webhook:', response.status, response.statusText);
                showCustomAlert('Application failed to send. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showCustomAlert('An error occurred. Please check your internet connection and try again.');
        } finally {
            setIsLoading(false); // Hide loading indicator
        }
    };

    // Toggles dark mode on/off
    const toggleDarkMode = () => {
        setDarkMode(prevMode => {
            console.log("Toggling dark mode to:", !prevMode); // Debugging log
            return !prevMode;
        });
    };

    // Conditional rendering for the success message page
    if (isSubmitted) {
        return (
            <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300
                            ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-100 to-purple-200 text-gray-800'}`}>
                <div className={`p-8 rounded-xl shadow-2xl w-full max-w-md border text-center transition-colors duration-300
                                ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h2 className="text-4xl font-extrabold mb-4 text-green-500">
                        Thank you for your application!
                    </h2>
                    <p className={`text-lg transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        We will reach out to you via email or SMS within the next 48 hours.
                    </p>
                </div>
            </div>
        );
    }

    // Renders the content for the current form step
    const renderFormStep = () => {
        let questionText = "";
        let exampleText = ""; // Used for placeholder or example hint
        let inputField = null; // Holds the JSX for the current input/select field

        // Common Tailwind classes for input/select elements
        const commonInputClasses = `w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-lg
                                    ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`;
        const commonSelectClasses = `w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none text-lg
                                     ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`;

        // Determine content based on current step
        switch (currentStep) {
            case 1: // Intro Page
                questionText = "Welcome to the Ansyla WFH Application!";
                exampleText = "Click 'Next' to begin.";
                break;
            case 2: // Name Field
                questionText = "What is your full name?";
                exampleText = "Example - John Doe";
                inputField = (
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={`${commonInputClasses} ${validationError ? '!border-red-500' : ''}`}
                        placeholder={exampleText}
                    />
                );
                break;
            case 3: // Email Field
                questionText = "What is your email address?";
                exampleText = "Example - john.doe@example.com";
                inputField = (
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`${commonInputClasses} ${validationError ? '!border-red-500' : ''}`}
                        placeholder={exampleText}
                    />
                );
                break;
            case 4: // Phone Field
                questionText = "What is your phone number?";
                exampleText = "Example - 1234567890";
                inputField = (
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        pattern="[0-9]{10,15}"
                        title="Please enter a valid phone number (10-15 digits)"
                        required
                        className={`${commonInputClasses} ${validationError ? '!border-red-500' : ''}`}
                        placeholder={exampleText}
                    />
                );
                break;
            case 5: // Gender Field
                questionText = "What is your gender?";
                exampleText = "Select your gender";
                inputField = (
                    <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        className={`${commonSelectClasses} ${validationError ? '!border-red-500' : ''}`}
                    >
                        <option value="">{exampleText}</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non_binary">Non-binary</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                );
                break;
            case 6: // Country Field
                questionText = "Which country are you applying from?";
                exampleText = "Select your country";
                inputField = (
                    <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        className={`${commonSelectClasses} ${validationError ? '!border-red-500' : ''}`}
                    >
                        <option value="">{exampleText}</option>
                        <option value="ghana">🇬🇭 Ghana</option>
                        <option value="nigeria">🇳🇬 Nigeria</option>
                        <option value="kenya">🇰🇪 Kenya</option>
                    </select>
                );
                break;
            case 7: // City Field
                questionText = "Which city are you located in?";
                exampleText = "Example - Accra";
                inputField = (
                    <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className={`${commonInputClasses} ${validationError ? '!border-red-500' : ''}`}
                        placeholder={exampleText}
                    />
                );
                break;
            case 8: // Qualification Field (now the last field step)
                questionText = "What is your highest qualification?";
                exampleText = "Select an option";
                inputField = (
                    <select
                        id="qualification"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        required
                        className={`${commonSelectClasses} ${validationError ? '!border-red-500' : ''}`}
                    >
                        <option value="">{exampleText}</option>
                        <option value="high_school">High School Diploma/GED</option>
                        <option value="bachelor">Bachelor's Degree</option>
                        <option value="master">Master's Degree</option>
                        <option value="phd">Ph.D. or Doctorate</option>
                        <option value="other">Other</option>
                    </select>
                );
                break;
            default: // This case should ideally not be reached with totalSteps logic
                return null;
        }

        return (
            <div key={animationKey} className="transition-all duration-500 ease-in-out">
                <h3 className={`text-2xl md:text-3xl font-bold mb-4 text-gray-800 text-center`}>
                    {questionText}
                </h3>
                {currentStep !== 1 && ( // Only show example text for field steps (not intro)
                    <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6 text-center`}>
                        {exampleText}
                    </p>
                )}
                {inputField}
                {validationError && ( // Display error only for field steps
                    <p className="text-red-500 text-sm mt-2 text-center">{validationError}</p>
                )}
            </div>
        );
    };

    // Calculate progress bar width
    const progressBarWidth = `${((currentStep - 1) / (totalSteps - 1)) * 100}%`;

    // Logo URL
    const logoUrl = "https://i.ibb.co/p618LXK5/photo-2025-07-17-09-24-50-removebg-preview.png";


    return (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300
                        ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-100 to-purple-200'}`}>
            {/* Header/Logo Area */}
            <div className="absolute top-0 left-0 right-0 p-4 text-center z-10"> {/* Added z-10 to ensure it's above other elements */}
                <img
                    src={logoUrl}
                    alt="Ansyla WFH Application Logo"
                    className="mx-auto h-24 w-auto object-contain mb-4" // Adjusted size and centering
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/000000/FFFFFF?text=Logo"; }} // Fallback
                />
            </div>

            <div className={`bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border transition-colors duration-300 relative
                            ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-2 rounded-t-xl overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ease-in-out ${darkMode ? 'bg-blue-400' : 'bg-blue-600'}`}
                        style={{ width: progressBarWidth }}
                    ></div>
                </div>


                {/* Dark Mode Toggle - repositioned for better visual flow */}
                <div className="absolute top-4 right-4">
                    <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-full transition-colors duration-300
                                    ${darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {darkMode ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h1M3 12H2m15.325-4.575l-.707-.707M6.372 17.628l-.707-.707M18.364 18.364l-.707-.707M5.636 5.636l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="mt-12 mb-8"> {/* Adjusted margin to make space for dots and toggle */}
                    {renderFormStep()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={handlePrevious}
                            className={`px-6 py-3 rounded-lg transition duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-opacity-75 text-lg font-semibold
                                        ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500' : 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500'}`}
                        >
                            ← PREV
                        </button>
                    )}

                    {/* Next button or Apply button on the last field step */}
                    {currentStep < totalSteps ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className={`ml-auto px-6 py-3 rounded-lg transition duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-opacity-75 text-lg font-semibold
                                        ${darkMode ? 'bg-blue-700 hover:bg-blue-600 text-white focus:ring-blue-600' : 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500'}`}
                        >
                            NEXT →
                        </button>
                    ) : ( // This is the last field step (Qualification)
                        <button
                            type="submit"
                            onClick={handleNext} // Call handleNext which now triggers handleSubmit
                            disabled={isLoading}
                            className={`w-full font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-opacity-75 text-lg font-semibold
                                        ${darkMode ? 'bg-blue-700 hover:bg-blue-600 text-white focus:ring-blue-600' : 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500'}
                                        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Applying...' : 'Apply'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
