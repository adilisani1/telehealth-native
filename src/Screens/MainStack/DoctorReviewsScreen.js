import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import { Fonts } from '../../Constants/Fonts';
import StackHeader from '../../components/Header/StackHeader';
import ReviewCard from '../../components/Review/ReviewCard';
import StarRating from '../../components/Rating/StarRating';
import reviewApi from '../../services/reviewApi';
import { useAlert } from '../../Providers/AlertContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DoctorReviewsScreen = ({ route, navigation }) => {
  const { doctorId, doctorName = 'Doctor' } = route.params;
  const { isDarkMode } = useSelector(store => store.theme);
  const { userType } = useSelector(store => store.auth);
  const { showAlert } = useAlert();

  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
    },
    statsContainer: {
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,
      padding: wp(4),
      marginHorizontal: wp(2),
      marginVertical: hp(1),
      borderRadius: wp(3),
      borderWidth: 1,
      borderColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
    },
    statsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(2),
    },
    averageRating: {
      fontSize: RFPercentage(3.5),
      fontFamily: Fonts.Bold,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginRight: wp(3),
    },
    ratingInfo: {
      flex: 1,
    },
    totalReviews: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Medium,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(0.5),
    },
    ratingStars: {
      marginBottom: hp(0.5),
    },
    distributionContainer: {
      marginTop: hp(1),
    },
    distributionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: hp(0.3),
    },
    distributionLabel: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      width: wp(8),
    },
    distributionBar: {
      flex: 1,
      height: hp(0.8),
      backgroundColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
      borderRadius: wp(0.4),
      marginHorizontal: wp(2),
      overflow: 'hidden',
    },
    distributionFill: {
      height: '100%',
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
    },
    distributionCount: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
      width: wp(8),
      textAlign: 'right',
    },
    sectionTitle: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Medium,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginHorizontal: wp(4),
      marginVertical: hp(1),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: hp(10),
    },
    emptyIcon: {
      marginBottom: hp(2),
    },
    emptyTitle: {
      fontSize: RFPercentage(2.5),
      fontFamily: Fonts.Medium,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(1),
      textAlign: 'center',
    },
    emptyMessage: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
      textAlign: 'center',
      paddingHorizontal: wp(8),
    },
    loadingMore: {
      paddingVertical: hp(2),
      alignItems: 'center',
    },
    loadingMoreText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
    },
  });

  const fetchReviews = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (pageNum === 1) {
        isRefresh ? setRefreshing(true) : setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await reviewApi.getDoctorReviews(doctorId, {
        page: pageNum,
        limit: 10
      });

      if (response.data.success) {
        const { reviews: newReviews, ratingStats: newStats, pagination } = response.data.data;
        
        if (pageNum === 1) {
          setReviews(newReviews);
        } else {
          setReviews(prev => [...prev, ...newReviews]);
        }
        
        setRatingStats(newStats);
        setHasMore(pagination.hasNext);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showAlert('Failed to load reviews', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [doctorId, showAlert]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleRefresh = () => {
    fetchReviews(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchReviews(page + 1);
    }
  };

  const renderRatingDistribution = () => {
    const maxCount = Math.max(...Object.values(ratingStats.distribution));
    
    return (
      <View style={styles.distributionContainer}>
        {[5, 4, 3, 2, 1].map(rating => {
          const count = ratingStats.distribution[rating] || 0;
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
          
          return (
            <View key={rating} style={styles.distributionRow}>
              <Text style={styles.distributionLabel}>{rating}</Text>
              <Icon 
                name="star" 
                size={16} 
                color={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor} 
              />
              <View style={styles.distributionBar}>
                <View 
                  style={[
                    styles.distributionFill, 
                    { width: `${percentage}%` }
                  ]} 
                />
              </View>
              <Text style={styles.distributionCount}>{count}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderReview = ({ item }) => (
    <ReviewCard 
      review={item}
      showPatientInfo={true}
      showDoctorInfo={false}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon 
        name="rate-review" 
        size={60} 
        color={isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.BorderGrayColor}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>No Reviews Yet</Text>
      <Text style={styles.emptyMessage}>
        This doctor hasn't received any reviews yet. Be the first to share your experience!
      </Text>
    </View>
  );

  const renderLoadingMore = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingMore}>
        <Text style={styles.loadingMoreText}>Loading more reviews...</Text>
      </View>
    );
  };

  const ListHeaderComponent = () => (
    <>
      {/* Rating Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statsHeader}>
          <Text style={styles.averageRating}>
            {ratingStats.averageRating.toFixed(1)}
          </Text>
          <View style={styles.ratingInfo}>
            <Text style={styles.totalReviews}>
              {ratingStats.totalReviews} review{ratingStats.totalReviews !== 1 ? 's' : ''}
            </Text>
            <View style={styles.ratingStars}>
              <StarRating 
                rating={Math.round(ratingStats.averageRating)} 
                size={20} 
                disabled={true}
              />
            </View>
          </View>
        </View>
        
        {ratingStats.totalReviews > 0 && renderRatingDistribution()}
      </View>

      {/* Section Title */}
      {reviews.length > 0 && (
        <Text style={styles.sectionTitle}>
          All Reviews ({ratingStats.totalReviews})
        </Text>
      )}
    </>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StackHeader title={`${doctorName} - Reviews`} />
        <View style={styles.emptyContainer}>
          <Text style={styles.loadingMoreText}>Loading reviews...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StackHeader title={`${doctorName} - Reviews`} />
      
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderLoadingMore}
        contentContainerStyle={reviews.length === 0 ? { flex: 1 } : undefined}
      />
    </View>
  );
};

export default DoctorReviewsScreen;
