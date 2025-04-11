import { useContext,createContext,useEffect,useState } from "react";
const UIStateContext = createContext();
export const UIStateProvider = ({ children }) => {
    const [uiState, setUIState] = useState({
        sidebar:false,
        navbar:false,
        loader:false,
        modal:false,
        registerModal:false,
    });
    const toggleUIState=(key)=>{
        setUIState((prevState) => ({ ...prevState, [key]: !prevState[key] }));
    }
    
    return (
        <UIStateContext.Provider value={{ uiState, setUIState,toggleUIState }}>
        {children}
        </UIStateContext.Provider>
    );
};