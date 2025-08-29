import './loader.css'
export default function Loader(){
    return (
        <div className="flex flex-col items-center justify-center h-full text-black p-8 rounded-lg mt-3">
            <div className="circle-container">
                <div className="animated-circle one"></div>
                <div className="animated-circle two"></div>
                <div className="animated-circle three"></div>
            </div>
        </div>
    )
}