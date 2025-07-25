import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CustomRating = ({
  count = 5,
  defaultRating = 0,
  size = 20,
  onFinishRating = () => {},
  readonly = false,
  starColor = '#FFD700',
  emptyStarColor = '#C0C0C0',
}) => {
  const [rating, setRating] = React.useState(defaultRating);

  const handleStarPress = (selectedRating) => {
    if (!readonly) {
      setRating(selectedRating);
      onFinishRating(selectedRating);
    }
  };

  const renderStar = (index) => {
    const filled = index < rating;
    const StarComponent = readonly ? View : TouchableOpacity;
    
    return (
      <StarComponent
        key={index}
        onPress={() => handleStarPress(index + 1)}
        disabled={readonly}
        style={{ marginRight: 2 }}
      >
        <Icon
          name={filled ? 'star' : 'star-border'}
          size={size}
          color={filled ? starColor : emptyStarColor}
        />
      </StarComponent>
    );
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {Array.from({ length: count }, (_, index) => renderStar(index))}
    </View>
  );
};

export default CustomRating;
