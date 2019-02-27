import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, TouchableWithoutFeedback} from 'react-native';
import {Permissions, ImagePicker} from "expo"
import {Entypo, MaterialIcons} from "@expo/vector-icons"

export default class PlayerCard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      imgSrc: require("../assets/blank-profile.png"),
      prevPlayerName: props.playerName,
      modalVisible: false
    }
  }

  componentDidUpdate () {
    if(!this.state.lookedForUrl){
      this.props.playersRef.where("playerName","==",this.props.playerName).get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const {profileImage} = doc.data()
        
        if (profileImage){
          this.setState({
            imgSrc: {
              uri: profileImage
            },
            lookedForUrl:true
          });
        } else {
          this.setState({
            imgSrc: require("../assets/blank-profile.png"),
            lookedForUrl:true
          });
        }
        
      })
        
      }).catch(error => {
        alert("Hi ha problemes per carregar la imatge del jugador\nError:"+error.message)
        this.setState({
          imgSrc: require("../assets/blank-profile.png"),
          lookedForUrl:true
        });
      })
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.playerName !== state.prevPlayerName){
      return {
        prevPlayerName: props.playerName,
        lookedForUrl: false,
        modalVisible: false,
      }
    }
    return null;
  }

  pickImage = async (fromWhere) => {

    let permAsk;
    if (fromWhere == "camera") {
      permAsk = await Permissions.askAsync(Permissions.CAMERA,Permissions.CAMERA_ROLL);
    } else {
      permAsk = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    }
    
    if (permAsk.status === 'granted') {

      let result;

      if (fromWhere == "camera") {
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1,1],
          quality: 0.5,
          base64:true
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1,1],
          quality: 0.5,
          base64:true
        });
      }

      if (!result.cancelled){

        this.uploadImage("data:image/jpeg;base64,"+result.base64)
        .then(() => {
          this.setState({modalVisible:false})
        })
        .catch((error) => {
          alert("No s'ha pogut actualitzar la imatge.\nError: "+error.message)
        });
      }

    } else {
      alert('No has donat permís per accedir a les teves imatges');
    }
  }

  uploadImage = async (file) => {

    const uploadImg = this.props.userRef.set({
      profileImage: file
    },{merge:true});

    this.setState({
      imgSrc: {
        uri: file
      }
    })
    return uploadImg;
  }

  render() {
    const playerName = this.props.playerName;
    let nameAndSurname = playerName ? playerName.split(" ") : ["",""];
    nameAndSurname[1] = nameAndSurname[2] ? nameAndSurname[1] + " " + nameAndSurname[2] : nameAndSurname[1];
    let imageBox = this.props.currentUserName == this.props.playerName ? (
      <TouchableOpacity style={styles.picView} onPress={() => {this.setState({modalVisible:true})}}>
        <Image source={this.state.imgSrc} style={styles.profileImage} resizeMode="cover"/>
      </TouchableOpacity>
    ) : (
      <View style={styles.picView}>
        <Image source={this.state.imgSrc} style={styles.profileImage} resizeMode="cover"/>
      </View>
    )
    let galleryOrCamera = this.state.modalVisible ? (
      <View style={styles.modalContainer} onPress={() => {this.setState({modalVisible: false})}}>
          <View style={styles.modalView}>
            <View style={styles.optionsRow}>
              <TouchableOpacity style={styles.optionView} onPress={() => {this.pickImage("gallery")}}>
                <Entypo name="images" size={30} color="darkblue"/>
                <Text style={styles.optionsText}>Galeria</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionView} onPress={() => {this.pickImage("camera")}}>
                <MaterialIcons name="camera-alt" size={30} color="darkblue"/>
                <Text style={styles.optionsText}>Càmera</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.dontChangeView} onPress={() => {this.setState({modalVisible: false})}}>
              <Text style={styles.dontChangeText}>No vull canviar la meva foto</Text>
            </TouchableOpacity>
          </View>
      </View>
    ) : null;
    return (
        <View style={styles.picAndNameView}>
            {imageBox}
            <View style={styles.nameView}>
            <View style={styles.namePieceView}><Text style={styles.nameText}>{nameAndSurname[0]}</Text></View>
            <View style={styles.namePieceView}><Text style={styles.nameText}>{nameAndSurname[1]}</Text></View>        
            </View>
            {galleryOrCamera}
        </View>
    );
  }
}

const styles = StyleSheet.create({
  picAndNameView: {
    height:125,
    flexDirection: "row",
  },
  picView: {
    flexDirection:"row",
    alignItems: 'center', 
    justifyContent: 'center',
  },
  profileImage: {
    width: 125,
    height:125,
    borderRadius:5
  },
  nameView: {
    flexGrow:1,
    paddingLeft: 20,
    marginVertical: 7.5,
    backgroundColor: "#ffffffA6",
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5
  },
  namePieceView: {
    flex:1,
    alignItems: "flex-start",
    justifyContent: 'center',
  },
  nameText: {
    color: "black",
    fontSize: 30
  },
  modalContainer: {
    position: "absolute",
    top: -30,
    left:-20,
    right:-20,
    bottom:-500,
    backgroundColor: "#00000080"
  },
  modalView: {
    marginHorizontal: 20,
    marginTop: 22,
    paddingVertical: 25,
    paddingHorizontal: 20,
    backgroundColor: "white",
    borderRadius: 5,
  },
  optionsRow: {
    flexDirection: "row"
  },
  optionView: {
    flex:1,
    justifyContent: "center",
    alignItems: "center"
  },
  optionsText: {
    color:"darkblue"
  },
  dontChangeView: {
    paddingTop: 10,
    justifyContent:"center",
    alignItems: "center"
  },
  dontChangeText: {
    color:"darkred",
    fontSize: 15
  },
});