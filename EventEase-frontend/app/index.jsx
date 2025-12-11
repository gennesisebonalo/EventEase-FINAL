import { ScrollView, View, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../constants/images.js'; 

export default function App() {
  const logo1Size = { width: 500, height: 300 }; 
  const backgroundImageUrl = 'https://i.pinimg.com/736x/73/24/aa/7324aa0142aed97c5eb8b8f64c7d2937.jpg'; 

  return (
    <ImageBackground
      source={{ uri: backgroundImageUrl }} 
      style={{ flex: 1 }}
      resizeMode="cover" 
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <View style={{ width: '100%', alignItems: 'center', paddingHorizontal: 16 }}>
            {/* Logo as Button */}
            <TouchableOpacity onPress={() => router.push('/role-selection')}>
              <Image
                source={images.logo} 
                style={{ width: logo1Size.width, height: logo1Size.height, marginTop: 40 }} 
                resizeMode='contain'
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
