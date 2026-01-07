import SlashLogo from "../../assets/splashlogo.svg";

function Loading(){
    return(
    <div className="fixed inset-0 bg-green-600 flex flex-col items-center justify-center z-[99999] 
                    transition-opacity duration-[3000ms] opacity-100 pointer-events-auto">
      <div className="flex justify-center items-center animate-bounce">
        <img
          src={SlashLogo}
          className="w-20 h-20 md:w-40 md:h-40 drop-shadow-xl"
          alt="Logo"
        />
      </div>
    </div>        
    )
}

export default Loading;