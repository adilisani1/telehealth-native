import React from 'react';
import {Dimensions, StyleSheet, Text, View, Image} from 'react-native';
import {Fonts} from '../../Constants/Fonts';
import {COLORS, FONTS, SIZES} from '../../Constants/themes';

const {width: screenWidth} = Dimensions.get('window');

export default function CategoryTab({content, imgUrl, clickHandler, style}) {
  return (
    <View style={[styles.container, style]} onTouchEnd={clickHandler}>
      <View style={{alignItems: 'center', justifyContent: 'center'}}>
        <View
          style={[
            styles.imgContainer,
            // {borderRadius: 80, backgroundColor: '#fff'},
          ]}>
          <Image style={styles.img} source={imgUrl} />
        </View>
        <View>
          <Text style={[styles.footerText, Fonts.secondaryFam]}>{content}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // width: screenWidth / 2 - 20,
    height: 'auto',
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    marginBottom: 10,

    position: 'relative',
    // shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    // elevation: 5,
    // shadowOpacity: 0.26,
    // shadowRadius: 3.5,
  },


  
  imgContainer: {
    borderRadius: 100,
    marginBottom: 5,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    width: '60%',
    height: '60%',
  },
  footerText: {
    color: COLORS.primary[500],
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 12,
    width: SIZES.width / 4,
    textAlign: 'center',
  },
});
