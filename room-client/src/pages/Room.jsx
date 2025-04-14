import MyTab,{TabContent} from '../components/MyTab';
import React,{useState,useEffect} from 'react';
const Room=()=>{
    const [labels,setLabels]=useState([]);
    return<>
        <MyTab active={0} labels={[{label:"Home"},{label:"About"},{label:"Other"}]}>
            <TabContent index={0}>
                Hello World
            </TabContent>
            <TabContent index={1}>
                Hello World1
            </TabContent>
            <TabContent index={2}>
                Hello World2
            </TabContent>
        </MyTab>
    </>
};
export default Room;
