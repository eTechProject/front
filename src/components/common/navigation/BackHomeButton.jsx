import React from 'react';
import {useNavigate} from "react-router-dom";

const BackButtonHome = () => {
    const navigate = useNavigate();
    function handleClickBack() {
        navigate("/");
    }

    return (
        <button
            id="back-to-top"
            onClick={handleClickBack}
            className={`fixed top-8 right-8 bg-orange-300 bg-opacity-20 text-orange-400 p-3 rounded-full shadow-lg hover:bg-opacity-30 transition-opacity duration-300 z-50`}
        >
            <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                />
            </svg>
        </button>
    );
};

export default BackButtonHome;