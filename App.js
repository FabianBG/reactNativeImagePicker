import React from 'react'
import { View, Text, Image, Button, FlatList, StyleSheet, Dimensions } from 'react-native'
import { WebView } from 'react-native-webview';
import ImagePicker from 'react-native-image-picker'

export default class App extends React.Component {
  state = {
    photo: null,
    text: [],
    mostrar: 'res'
  }

  render() {
    const { photo, text, mostrar } = this.state
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
              style={{ width: 200, height: 200 }}
            />
            
            <Button title="ENVIAR" onPress={this.handleUploadPhoto} />
          </React.Fragment>
        )}
        <Button title="ESCOJE UNA IMAGEN" onPress={this.handleChoosePhoto} style={styles.container}/>
        <Button title={mostrar == 'web'? 'RESULTADOS': 'WEB'} onPress={this.handleChangeView} style={styles.container}/>
        { mostrar == 'res' && (<FlatList
          data={text}
          renderItem={({item}) => <Text>{item[0]} - {item[1]}</Text>}
        />)}
        { mostrar == 'web' && this.renderWebView()}
        
      </View>
    )
  }

  renderWebView() {
    let jsCode = `window.scrollTo(10, 200)`;
    var {height, width} = Dimensions.get('window');
    const { text } = this.state
    const label1 = text[0][1]
    const label2 = text[1][1]
    const uri = `https://www.google.com/search?source=lnms&tbm=isch&sa=X&ved=0ahUKEwjts_PtsMnjAhVSs1kKHe2SCXEQ_AUIESgB&biw=1402&bih=858&q=${label1}+${label2}`
    console.info("VISIT", uri)
    return <WebView
    style={{
      maxHeight: 400,
      width: width,
      flex: 1
    }}
    //Loading URL
    source={{ uri }}
    injectedJavaScript={jsCode}
    //Enable Javascript support
    javaScriptEnabled={true}
    //For the Cache
    domStorageEnabled={true}
    onLoadStart={() => console.info("CARGANDO PAGINA")}
    onLoad={() => console.info("CARGADA PAGINA")}/>
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
        this.setState({ photo: response, text: [], mostar: "res" })
      }
    })
  }

  handleUploadPhoto = () => {
    console.info("Enviadno data....");
    this.setState({ ...this.state, text: [["1", "Analisando data"]]});
    fetch("https://up-company.dev/dev-parca/api", {
      method: "POST",
      body: this.createFormData(this.state.photo, { model: "fashion-color.pb:predict" })
    })
      .then(response => response.json())
      .then(response => {
        console.log("upload success", response);
        alert("Analisis finalizado ...");
        this.setState({ ...this.state, text: response.predictions, mostar: "web"});
      })
      .catch(error => {
        console.log("upload error", error);
        alert("Upload failed!" + error);
      });
  };

  handleChangeView = () => {
    this.setState({
      ...this.state,
      mostrar: this.state.mostrar == "web" ? "res":"web"
    })
  }
}