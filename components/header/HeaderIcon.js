import React from "react"
import { TouchableHighlight} from 'react-native';
import { Icon } from 'native-base';
import { TouchableOpacity } from "react-native-gesture-handler";


export default headerIcon = (props) => {

    if (props.highlight) {

        return <TouchableHighlight 
                    onPress={props.onPress ? props.onPress : ()=>{}}
                    style={{height:"90%", justifyContent: "center", alignItems: "center", paddingHorizontal: 15, borderRadius:50, marginHorizontal: 5}}
                    activeOpacity={0.3}
                    underlayColor={props.underlayColor || "#ccc"}>
                    <Icon name={props.name} />
                </TouchableHighlight>

    } else {
        return <TouchableOpacity
                    onPress={props.onPress ? props.onPress : ()=>{}}
                    style={{height:"90%", justifyContent: "center", alignItems: "center", paddingHorizontal: 15, borderRadius:50, marginRight: 5}}>
                    <Icon name={props.name} />
                </TouchableOpacity>
    }
    
}
    