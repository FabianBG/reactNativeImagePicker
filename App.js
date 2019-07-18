import React from 'react'
import { View, Text, Image, Button, FlatList, StyleSheet } from 'react-native'
import ImagePicker from 'react-native-image-picker'

export default class App extends React.Component {
  state = {
    photo: null,
    text: []
  }

  render() {
    const { photo, text } = this.state
    const styles = StyleSheet.create({
      container: {
       flex: 1,
       paddingTop: 22
      },
    })
    
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {photo && (
          <React.Fragment>
            <Image
              source={{ uri: photo.uri }}
              style={{ width: 300, height: 300 }}
            />
            
            <Button title="ENVIAR" onPress={this.handleUploadPhoto} />
          </React.Fragment>
        )}
        <Button title="ESCOJE UNA IMAGEN" onPress={this.handleChoosePhoto} style={styles.container}/>
        <FlatList
          data={text}
          renderItem={({item}) => <Text>{item[0]} - {item[1]}</Text>}
        />
      </View>
    )
  }

  createFormData = (photo, body) => {
    const data = new FormData();
  
    data.append("file", {
      name: photo.fileName,
      type: photo.type,
      uri:
        Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", "")
    });
  
    Object.keys(body).forEach(key => {
      data.append(key, body[key]);
    });
  
    return data;
  };

  handleChoosePhoto = () => {
    const options = {
      noData: true,
    }
    console.info("Buscando data....");

    ImagePicker.launchImageLibrary(options, response => {
      if (response.uri) {
        this.setState({ photo: response, text: [] })
      }
    })
  }

  handleUploadPhoto = () => {
    console.info("Enviadno data....");
    this.setState({ ...this.state, text: [["1", "Analisando data"]]});
    fetch("https://7cb41cbf.ngrok.io/api", {
      method: "POST",
      body: this.createFormData(this.state.photo, { model: "fashion-color.pb:predict" })
    })
      .then(response => response.json())
      .then(response => {
        console.log("upload succes", response);
        alert("Analisis finalizado ...");
        this.setState({ ...this.state, text: response.predictions});
      })
      .catch(error => {
        console.log("upload error", error);
        alert("Upload failed!");
      });
  };
}