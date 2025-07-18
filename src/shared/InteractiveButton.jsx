import { useRef, useState } from "react";
import "./InteractiveButton.css";
import { ArrowDownRight } from 'lucide-react';

function InteractiveButton({ children, href = "#about" }) {
    const buttonRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);

    let rippleCooldown = false;

    const createRipple = (event) => {
        if (rippleCooldown) return; // Ignore si déjà dans un cooldown //Optimisation
        rippleCooldown = true;

        const button = buttonRef.current;
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement("span");
        const diameter = Math.max(rect.width, rect.height);
        const radius = diameter / 2;

        ripple.classList.add("ripple");
        ripple.style.width = ripple.style.height = `${diameter}px`;
        ripple.style.left = `${event.clientX - rect.left - radius}px`;
        ripple.style.top = `${event.clientY - rect.top - radius}px`;

        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
            rippleCooldown = false; // Fin du cooldown //Optimisation
        }, 1000);
    };


    return (
        <a
            href={href}
            className={`button-container ${isHovering ? "hovered" : ""}`}
            ref={buttonRef}
            onMouseMove={createRipple}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <span className="button-text">{children}</span>
            <span className="button-circle">
                <ArrowDownRight />
            </span>
        </a>
    );
}

export default InteractiveButton;
