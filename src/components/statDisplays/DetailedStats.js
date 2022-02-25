import React from 'react';
import { StyleSheet, View, Text} from 'react-native';
import { w } from '../../api/Dimensions';


export default class DetailedStats extends React.Component {

    getStats = () => {
        let stats = [];
        let playerMatches = this.props.playerMatches;
        let header = [ <View key="emptyCorner" style={styles.groupNameView}></View>];
        let headerText = ["PJ","PG","PP","JJ","JG","JP"];
        let addCellViewStyles =[styles.firstCellView,null,styles.thirdCellView,null,null,null];
        let total = [0,0,0,0,0,0];
        headerText.forEach((text,iCell)=>{
            header.push(
                <View key={text} style={[styles.dataCellView,addCellViewStyles[iCell]]}>
                    <Text>{text[1]}</Text>
                </View>
            )
        });
        stats.push(
            <View key="headerRow" style={[styles.rowView,styles.headerRowView]}>{header}</View>
        )
        if (playerMatches.length > 0){

            //let separatedMatches = _.groupBy(playerMatches, "context.group.id")
            separatedMatches = []

            separatedMatches.forEach((group,index)=>{
                if (group.length > 0){
                    let playedMatches = 0;
                    let wonMatches = 0;
                    let lostMatches = 0;
                    let playedSets = 0;
                    let wonSets = 0;
                    let lostSets = 0;
                    group.forEach((match)=> {
                        playedMatches += 1;
                        wonMatches = match.matchWon ? wonMatches+1 : wonMatches;
                        lostMatches = match.matchWon ? lostMatches : lostMatches+1;
                        wonSets += match.playerSets;
                        lostSets += match.rivalSets;
                        playedSets += match.playerSets + match.rivalSets;
                    })
                    playedWonLost[index] = [playedMatches,wonMatches,lostMatches,playedSets,wonSets,lostSets]
                }
            })
            playedWonLost.forEach((statistics,index) => {
                if (statistics.length > 0) {
                    let groupText = index < 14 ? "Grup "+ index : (
                        index == 14 ? "Torneig" : "Reptes"
                    )
                    let row = [
                        <View key={"Name"+index} style={styles.groupNameView}>
                            <Text style={styles.groupNameText}>{groupText}</Text>
                        </View>
                    ]
                    statistics.forEach((statistic,iStat) => {
                        total [iStat] += statistic
                        row.push(
                            <View key={String(index)+String(iStat)} style={[styles.dataCellView,addCellViewStyles[iStat]]}>
                                <Text>{statistic}</Text>
                            </View>
                        )
                    })
                    stats.push(
                        <View key={index} style={styles.rowView}>
                            {row}
                        </View>
                    )
                }
            })
        }

        let row = [
            <View key="Total" style={styles.groupNameView}>
                <Text style={styles.groupNameText}>Total</Text>
            </View>
        ];
        
        total.forEach((statistic,iStat) => {
            total [iStat] += statistic
            row.push(
                <View key={"Total"+iStat} style={[styles.dataCellView,addCellViewStyles[iStat]]}>
                    <Text>{statistic}</Text>
                </View>
            )
        });
        stats.push(
            <View key="Row" style={[styles.rowView,styles.totalRowView]}>
                {row}
            </View>
        );

        return stats;
    }


  render() {
      let stats = this.getStats()

    return (
        <View style={styles.statsContainer}>
            <View style={styles.headerTitlesRowView}>
                <View style={styles.groupNameView}></View>
                <View style={styles.headerTitleView}>
                    <Text style={styles.headerTitleText}>Partits</Text>
                </View>
                <View style={styles.headerTitleView}>
                    <Text style={styles.headerTitleText}>Jocs</Text>
                </View>
            </View>
            {stats}
        </View>
    );
  }
}

const styles = StyleSheet.create({
    statsContainer:{
        justifyContent:"center",
        alignItems:"center",
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#ffffffA6",
        borderRadius: 5,
    },
    headerTitlesRowView:{
        flexDirection:"row",
        paddingTop: 10,
        justifyContent:"center",
        alignItems:"center",
    },
    rowView: {
        flexDirection:"row",
        paddingVertical: 10,
        justifyContent:"center",
        alignItems:"center",
    },
    headerRowView: {
        borderBottomWidth: 2,
        borderColor: "gray"
    },
    totalRowView:{
        borderTopWidth: 2,
        borderColor: "gray",
        backgroundColor:"#cccccc",
        borderBottomLeftRadius: 3,
        borderBottomRightRadius: 3,
    },
    headerTitleView: {
        flex: 3,
        justifyContent:"center",
        alignItems:"center",
    },
    headerTitleText:{
        fontFamily: "bold",
        fontSize: 15
    },
    groupNameView:{
        flex:2,
        justifyContent:"center",
        alignItems:"center",
    },
    groupNameText:{
        fontFamily: "bold",
        fontSize: 15,
    },
    dataCellView:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
    },
    firstCellView:{
        borderLeftWidth: 2,
        borderColor: "gray"
    },
    thirdCellView: {
        borderRightWidth: 2,
        borderColor: "gray"  
    }
});