import { useContext,createContext,useEffect,useState } from "react";
const UIStateContext = createContext();
export const useUIState = () => useContext(UIStateContext);
export const UIStateProvider = ({ children }) => {
    const [uiState, setUIState] = useState({
        sidebar:false,
        navbar:false,
        loader:false,
        postModal:false,
        editprofileDialog:false,
        dialog:false,
        globalLoader:false,
        //add whatever keys as you like
    });
    const toggleUIState=(key)=>{
        setUIState((prevState) => ({ ...prevState, [key]: !prevState[key] }));
    }
    const openUIState=(key)=>{
        setUIState((prevState)=>{return {...prevState,[key]:true}});
    }
    const closeUIState=(key)=>{
        setUIState((prevState)=>{return {...prevState,[key]:false}});
    }
    return (
        <UIStateContext.Provider value={{ uiState, setUIState,toggleUIState,openUIState,closeUIState }}>
        {children}
        </UIStateContext.Provider>
    );
};