
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TableStructure = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.tableButton}>
        <View style={styles.mainBox}>
          {/* Círculo central */}
          <View style={styles.circle}>
            <Text style={styles.text}>Mesa</Text>
            <Text style={styles.numberText}>1</Text>
          </View>
          
          {/* Quadrados */}
          <View style={[styles.square, styles.topSquare]} />
          <View style={[styles.square, styles.bottomSquare]} />
          <View style={[styles.square, styles.leftSquare]} />
          <View style={[styles.square, styles.rightSquare]} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tableButton: {
    padding: 10,
  },
  mainBox: {
    position: 'relative',
    width: 90,
    height: 90,
    backgroundColor: 'white',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
    margin: 30,
  },
  circle: {
    width: 70,
    height: 70,
    backgroundColor: 'red',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
  numberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 30,
  },
  square: {
    position: 'absolute',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
  },
  topSquare: {
    width: 45,
    height: 30,
    top: -35,
    left: '50%',
    transform: [{ translateX: -22.5 }],
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  bottomSquare: {
    width: 45,
    height: 30,
    bottom: -35,
    left: '50%',
    transform: [{ translateX: -22.5 }],
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  leftSquare: {
    width: 30,
    height: 40,
    left: -35,
    top: '50%',
    transform: [{ translateY: -20 }],
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  rightSquare: {
    width: 30,
    height: 40,
    right: -35,
    top: '50%',
    transform: [{ translateY: -20 }],
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
});

export default TableStructure;
