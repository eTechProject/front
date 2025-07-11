import React, { useState, useEffect } from 'react';

const BackToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled down
    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Scroll to top smoothly
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <button
            id="back-to-top"
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 bg-[#00f0ff] bg-opacity-20 text-[#00f0ff] p-3 rounded-full shadow-lg hover:bg-opacity-30 transition-opacity duration-300 ${
                isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
        >
            <i className="fas fa-arrow-up"></i>
        </button>
    );
};

export default BackToTopButton;
