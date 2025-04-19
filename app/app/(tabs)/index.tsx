import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const TableStructure = () => {
  return (
    <View className="flex-1 justify-center items-center p-5 bg-gray-100">
  <TouchableOpacity className="p-3 relative">
    {/* Container Principal */}
    <View className="relative h-32 w-32 flex justify-center items-center">
      
      {/* Caixa Principal */}
      <View
        className="bg-white w-[90px] h-[90px] rounded-xl flex justify-center items-center"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 5,
        }}
      >
        {/* Círculo Central */}
        <View
          className="bg-red-500 w-[70px] h-[70px] rounded-full flex justify-center items-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          <Text
            className="text-white font-bold text-xl"
            style={{
              textShadowColor: '#000',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            Mesa
          </Text>
          <Text
            className="text-white font-bold text-2xl"
            style={{
              textShadowColor: '#000',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            1
          </Text>
        </View>
      </View>

      {/* Quadrado Superior */}
      <View
        className="absolute top-0 left-1/2 -translate-x-1/2 -mt-[23px] w-[45px] h-[30px] bg-white rounded-t-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 5,
        }}
      />

      {/* Quadrado Inferior */}
      <View
        className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-[23px] w-[45px] h-[30px] bg-white rounded-b-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 5,
        }}
      />

      {/* Quadrado Esquerdo */}
      <View
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-[23px] w-[30px] h-[40px] bg-white rounded-l-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 5,
        }}
      />

      {/* Quadrado Direito */}
      <View
        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-[23px] w-[30px] h-[40px] bg-white rounded-r-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 5,
        }}
      />
    </View>
  </TouchableOpacity>
</View>

  );
};

export default TableStructure;