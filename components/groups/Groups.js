import React from 'react';
import {StyleSheet, Text, View, FlatList} from 'react-native';
import Table from "./Table"
import { translate } from '../../assets/translations/translationManager';

import { totalSize } from '../../api/Dimensions';

export default class Groups extends React.Component {

    constructor(props) {
        super(props);

    }
    
    renderGroup = (group) => {
         
        return (

            <View style={{...styles.groupContainer}}>
                <View style={{...styles.groupTitleView}}>
                    <Text style={styles.groupTitleText}>{translate("vocabulary.group") + " " + (group.name)}</Text>
                </View>
                <Table
                    {...group}
                    competition={this.props.competition}
                    navigation={this.props.navigation}
                />
            </View>
    
        )
    }

    render() {

        if (!this.props.groups) return null

        return (
            <FlatList 
                style={styles.scrollView} 
                ref={(scroller) => {
                    this.scroller = scroller
                }}
                data={this.props.groups}
                renderItem={({ item }) => this.renderGroup(item)}
                keyExtractor={group => group.iGroup}
                contentContainerStyle={styles.contentContainer}
                bounces={true}/>
        );
    }
}

const styles = StyleSheet.create({

    groupContainer : {
        elevation: 5,
        marginVertical: 10,
        marginHorizontal: 10,
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: "white",
        overflow: "hidden"
    },

    groupTitleView : {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingBottom: 10,
    },

    groupTitleText: {
        fontSize: totalSize(1.9),
        color: "black",
        fontWeight: "bold"
    },

    loadingMessageView: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    scrollView: {
        flex: 1,
    },

    contentContainer: {
        paddingVertical: 10,
    },
});