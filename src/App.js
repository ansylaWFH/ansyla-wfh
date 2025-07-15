import React, { useState, useEffect } from 'react';

// Main App component
const App = () => {
    // State to hold form data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        qualification: '',
        gender: ''
    });

    // State for dark mode, initialized to true (default dark mode)
    const [darkMode, setDarkMode] = useState(true);

    // State to control showing the success message
    const [isSubmitted, setIsSubmitted] = useState(false);

    // State for loading indicator during form submission
    const [isLoading, setIsLoading] = useState(false);

    // State for loading indicator during Gemini API call
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

    // State to store the generated application summary
    const [applicationSummary, setApplicationSummary] = useState('');

    // State to control the visibility of the summary modal
    const [showSummaryModal, setShowSummaryModal] = useState(false);

    // Effect to update local storage and apply dark mode class to body
    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle form submission (sends data to webhook)
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setIsLoading(true); // Set loading to true

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
                setIsSubmitted(true); // Show success message
            } else {
                console.error('Failed to send data to webhook:', response.status, response.statusText);
                showCustomAlert('Application failed to send. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showCustomAlert('An error occurred. Please check your internet connection and try again.');
        } finally {
            setIsLoading(false); // Set loading to false regardless of success or failure
        }
    };

    // Function to show a custom alert message (for errors/feedback)
    const showCustomAlert = (message) => {
        const alertBox = document.createElement('div');
        alertBox.className = `fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ease-in-out
                              ${darkMode ? 'bg-red-700 text-white' : 'bg-red-500 text-white'}`; // Red for error alerts
        alertBox.textContent = message;
        document.body.appendChild(alertBox);

        setTimeout(() => {
            alertBox.remove();
        }, 3000); // Remove alert after 3 seconds
    };

    // Toggle dark mode
    const toggleDarkMode = () => {
        setDarkMode(prevMode => !prevMode);
    };

    // Function to generate application summary using Gemini API
    const generateSummary = async () => {
        setIsGeneratingSummary(true);
        setApplicationSummary(''); // Clear previous summary

        // Construct a detailed prompt for the LLM
        const prompt = `Generate a concise, professional summary of the following job application details.
        Focus on key qualifications and suitability for a WFH role.
        Name: ${formData.name}
        Email: ${formData.email}
        Phone: ${formData.phone}
        Country: ${formData.country}
        City: ${formData.city}
        Gender: ${formData.gender}
        Highest Qualification: ${formData.qualification}

        Please provide a summary that is no more than 150 words.`;

        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });

        const payload = { contents: chatHistory };
        const apiKey = ""; // API key is provided by the Canvas environment
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setApplicationSummary(text);
                setShowSummaryModal(true); // Show the modal with the summary
            } else {
                showCustomAlert('Failed to generate summary. Please try again.');
                console.error('Gemini API response structure unexpected:', result);
            }
        } catch (error) {
            showCustomAlert('Error generating summary. Please check your internet connection.');
            console.error('Error calling Gemini API:', error);
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    // Conditional rendering: show success message if form is submitted
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

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300
                        ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-100 to-purple-200'}`}>
            <div className={`p-8 rounded-xl shadow-2xl w-full max-w-md border transition-colors duration-300
                            ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-end mb-4">
                    <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-full transition-colors duration-300
                                    ${darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {/* Sun/Moon Icon */}
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

                <h2 className={`text-4xl font-extrabold mb-8 text-center transition-colors duration-300 font-serif
                                ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Ansyla WFH Application
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Input */}
                    <div>
                        <label htmlFor="name" className={`block text-sm font-medium mb-1 transition-colors duration-300
                                                        ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out
                                        ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`}
                            placeholder="John Doe"
                        />
                    </div>

                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className={`block text-sm font-medium mb-1 transition-colors duration-300
                                                        ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out
                                        ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`}
                            placeholder="john.doe@example.com"
                        />
                    </div>

                    {/* Phone Number Input */}
                    <div>
                        <label htmlFor="phone" className={`block text-sm font-medium mb-1 transition-colors duration-300
                                                        ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            pattern="[0-9]{10,15}"
                            title="Please enter a valid phone number (10-15 digits)"
                            required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out
                                        ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`}
                            placeholder="e.g., 1234567890"
                        />
                    </div>

                    {/* Gender Dropdown */}
                    <div>
                        <label htmlFor="gender" className={`block text-sm font-medium mb-1 transition-colors duration-300
                                                        ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Gender
                        </label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none
                                        ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                        >
                            <option value="">Select your gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="non_binary">Non-binary</option>
                            <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                    </div>

                    {/* Country Dropdown */}
                    <div>
                        <label htmlFor="country" className={`block text-sm font-medium mb-1 transition-colors duration-300
                                                        ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Country
                        </label>
                        <select
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none
                                        ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                        >
                            <option value="">Select your country</option>
                            <option value="ghana">🇬🇭 Ghana</option>
                            <option value="nigeria">🇳🇬 Nigeria</option>
                            <option value="kenya">🇰🇪 Kenya</option>
                        </select>
                    </div>

                    {/* City Input */}
                    <div>
                        <label htmlFor="city" className={`block text-sm font-medium mb-1 transition-colors duration-300
                                                        ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            City
                        </label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out
                                        ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`}
                            placeholder="Manchester"
                        />
                    </div>

                    {/* Highest Qualification Select */}
                    <div>
                        <label htmlFor="qualification" className={`block text-sm font-medium mb-1 transition-colors duration-300
                                                        ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Highest Qualification
                        </label>
                        <select
                            id="qualification"
                            name="qualification"
                            value={formData.qualification}
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none
                                        ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                        >
                            <option value="">Select an option</option>
                            <option value="high_school">High School Diploma/GED</option>
                            <option value="bachelor">Bachelor's Degree</option>
                            <option value="master">Master's Degree</option>
                            <option value="phd">Ph.D. or Doctorate</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Generate Summary Button */}
                    <button
                        type="button" // Important: type="button" to prevent form submission
                        onClick={generateSummary}
                        disabled={isGeneratingSummary || !formData.name || !formData.email || !formData.qualification} // Disable if fields are empty or generating
                        className={`w-full font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-opacity-75 mt-4
                                    ${darkMode ? 'bg-purple-700 hover:bg-purple-600 text-white focus:ring-purple-600' : 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500'}
                                    ${isGeneratingSummary || !formData.name || !formData.email || !formData.qualification ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isGeneratingSummary ? 'Generating Summary...' : 'Generate Application Summary ✨'}
                    </button>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading} // Disable button when loading
                        className={`w-full font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-opacity-75
                                    ${darkMode ? 'bg-blue-700 hover:bg-blue-600 text-white focus:ring-blue-600' : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'}
                                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Applying...' : 'Apply'}
                    </button>
                </form>
            </div>

            {/* Summary Modal */}
            {showSummaryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className={`p-8 rounded-xl shadow-2xl w-full max-w-lg transition-colors duration-300 relative
                                    ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'}`}>
                        <button
                            onClick={() => setShowSummaryModal(false)}
                            className={`absolute top-4 right-4 p-2 rounded-full text-lg font-bold
                                        ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            &times;
                        </button>
                        <h3 className={`text-2xl font-bold mb-4
                                        ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            Application Summary
                        </h3>
                        {applicationSummary ? (
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>
                                {applicationSummary}
                            </p>
                        ) : (
                            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                No summary generated yet.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;