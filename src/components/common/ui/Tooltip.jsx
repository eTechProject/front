const Tooltip = ({ children, text, className = '' }) => (
    <div className={`relative z-[999] group ${className}`}>
        {children}
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 pointer-events-none z-50 group-hover:opacity-100 opacity-0 transition-all duration-200 ease-out hidden lg:block">
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl whitespace-nowrap relative">
                {text}
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
            </div>
        </div>
    </div>
);
export default Tooltip;