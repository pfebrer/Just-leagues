import React , {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from "react-native"
import { Icon } from 'native-base';
import { totalSize } from '../../../api/Dimensions';

export default class NumericInput extends Component  {

    static _type = "number"
    
    constructor(props){
        super(props)
    }

    render() {

        return <View style={{...styles.container, ...this.props.style}}>
                    <View style={styles.valueView}>
                        <Text style={styles.valueText}>{this.props.value}</Text>
                    </View>
                    <View>
                        <TouchableOpacity 
                            onPress={()=> {this.props.onValueChange(this.props.value+1)}}
                            style={styles.iconView}>
                            <Icon name="arrow-up" style={styles.icon}/>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={()=> {this.props.onValueChange(this.props.value-1)}}
                            style={styles.iconView}>
                            <Icon name="arrow-down" style={styles.icon}/>
                        </TouchableOpacity>
                    </View>
                </View>
    }

}

const styles = StyleSheet.create({

    container: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    valueView: {
        paddingRight: 20
    },

    valueText: {
        fontSize: totalSize(2.5)
    },

    iconView: {
        paddingVertical: 10
    },

    icon: {
        color:"gray",
        fontSize: totalSize(2.8)
    }

})