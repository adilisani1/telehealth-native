import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useSelector } from 'react-redux';
import { getDoctorOwnReviews } from '../../services/doctorService';
import { getToken } from '../../utils/tokenStorage';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../Constants/themeColors';
import { Fonts } from '../../Constants/Fonts';
import { SafeAreaView } from 'react-native';

const DoctorReviews = ({ navigation }) => {
  const { isDarkMode } = useSelector(store => store.theme);
  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;

  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        setPage(1);
      } else {
        setLoading(true);
      }

      const token = await getToken();
      const response = await getDoctorOwnReviews(token, pageNum, 10);

      if (response.success) {
        const newReviews = response.data.reviews;
        
        if (refresh || pageNum === 1) {
          setReviews(newReviews);
        } else {
          setReviews(prev => [...prev, ...newReviews]);
        }

        setRatingStats(response.data.ratingStats);
        setHasMore(pageNum < response.data.pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchReviews(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchReviews(page + 1);
    }
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={RFPercentage(2)}
            color={star <= rating ? Colors.warning : theme.secondryTextColor}
          />
        ))}
      </View>
    );
  };

  const renderRatingDistribution = () => {
    const maxCount = Math.max(...Object.values(ratingStats.ratingDistribution));
    
    return (
      <View style={styles.distributionContainer}>
        <Text style={[styles.distributionTitle, { color: theme.primaryTextColor }]}>
          Rating Distribution
        </Text>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingStats.ratingDistribution[rating];
          const percentage = ratingStats.totalReviews > 0 ? (count / ratingStats.totalReviews) * 100 : 0;
          
          return (
            <View key={rating} style={styles.distributionRow}>
              <Text style={[styles.ratingNumber, { color: theme.primaryTextColor }]}>
                {rating}
              </Text>
              <Icon name="star" size={RFPercentage(2)} color={Colors.warning} />
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.distributionBar,
                    {
                      width: `${percentage}%`,
                      backgroundColor: theme.primaryColor,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.countText, { color: theme.secondryTextColor }]}>
                {count}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderReviewItem = ({ item }) => (
    <View style={[styles.reviewCard, { backgroundColor: theme.secondryColor }]}>
      <View style={styles.reviewHeader}>
        <View>
          <Text style={[styles.patientName, { color: theme.primaryTextColor }]}>
            {item.patient?.name || 'Anonymous Patient'}
          </Text>
          <Text style={[styles.appointmentDate, { color: theme.secondryTextColor }]}>
            Appointment: {new Date(item.appointment?.date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          {renderStars(item.rating)}
          <Text style={[styles.ratingText, { color: theme.primaryTextColor }]}>
            {item.rating}/5
          </Text>
        </View>
      </View>
      
      {item.comment && (
        <Text style={[styles.reviewComment, { color: theme.primaryTextColor }]}>
          "{item.comment}"
        </Text>
      )}
      
      <Text style={[styles.reviewDate, { color: theme.secondryTextColor }]}>
        Reviewed on {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.secondryColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={RFPercentage(3)} color={theme.primaryColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primaryTextColor }]}>
          My Reviews
        </Text>
        <View style={{ width: RFPercentage(3) }} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Rating Overview */}
        <View style={[styles.overviewCard, { backgroundColor: theme.secondryColor }]}>
          <View style={styles.overviewHeader}>
            <View style={styles.ratingOverview}>
              <Text style={[styles.averageRating, { color: theme.primaryColor }]}>
                {ratingStats.averageRating}
              </Text>
              {renderStars(Math.round(ratingStats.averageRating))}
              <Text style={[styles.totalReviews, { color: theme.secondryTextColor }]}>
                Based on {ratingStats.totalReviews} reviews
              </Text>
            </View>
          </View>
          
          {renderRatingDistribution()}
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsSection}>
          <Text style={[styles.sectionTitle, { color: theme.primaryTextColor }]}>
            Patient Reviews
          </Text>
          
          {reviews.length > 0 ? (
            <FlatList
              data={reviews}
              renderItem={renderReviewItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              onEndReached={loadMore}
              onEndReachedThreshold={0.1}
            />
          ) : (
            <View style={styles.emptyState}>
              <Icon name="star-outline" size={RFPercentage(8)} color={theme.secondryTextColor} />
              <Text style={[styles.emptyText, { color: theme.secondryTextColor }]}>
                No reviews yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.secondryTextColor }]}>
                Complete appointments to receive patient reviews
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: RFPercentage(2.5),
    fontFamily: Fonts.SemiBold,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: wp(5),
  },
  overviewCard: {
    marginTop: hp(2),
    padding: wp(5),
    borderRadius: wp(3),
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overviewHeader: {
    alignItems: 'center',
    marginBottom: hp(3),
  },
  ratingOverview: {
    alignItems: 'center',
  },
  averageRating: {
    fontSize: RFPercentage(4),
    fontFamily: Fonts.Bold,
    marginBottom: hp(1),
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: hp(1),
  },
  totalReviews: {
    fontSize: RFPercentage(1.8),
    fontFamily: Fonts.Regular,
  },
  distributionContainer: {
    width: '100%',
  },
  distributionTitle: {
    fontSize: RFPercentage(2),
    fontFamily: Fonts.SemiBold,
    marginBottom: hp(1),
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  ratingNumber: {
    width: wp(5),
    fontSize: RFPercentage(1.8),
    fontFamily: Fonts.Medium,
  },
  barContainer: {
    flex: 1,
    height: hp(1),
    backgroundColor: Colors.lightGray,
    borderRadius: wp(1),
    marginHorizontal: wp(2),
  },
  distributionBar: {
    height: '100%',
    borderRadius: wp(1),
  },
  countText: {
    width: wp(8),
    textAlign: 'right',
    fontSize: RFPercentage(1.6),
    fontFamily: Fonts.Regular,
  },
  reviewsSection: {
    marginTop: hp(3),
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: RFPercentage(2.2),
    fontFamily: Fonts.SemiBold,
    marginBottom: hp(2),
  },
  reviewCard: {
    padding: wp(4),
    borderRadius: wp(3),
    marginBottom: hp(2),
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(2),
  },
  patientName: {
    fontSize: RFPercentage(2),
    fontFamily: Fonts.SemiBold,
  },
  appointmentDate: {
    fontSize: RFPercentage(1.6),
    fontFamily: Fonts.Regular,
    marginTop: hp(0.5),
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: RFPercentage(1.8),
    fontFamily: Fonts.Medium,
    marginTop: hp(0.5),
  },
  reviewComment: {
    fontSize: RFPercentage(1.8),
    fontFamily: Fonts.Regular,
    fontStyle: 'italic',
    marginBottom: hp(1),
    lineHeight: RFPercentage(2.5),
  },
  reviewDate: {
    fontSize: RFPercentage(1.5),
    fontFamily: Fonts.Regular,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: hp(8),
  },
  emptyText: {
    fontSize: RFPercentage(2.2),
    fontFamily: Fonts.SemiBold,
    marginTop: hp(2),
  },
  emptySubtext: {
    fontSize: RFPercentage(1.8),
    fontFamily: Fonts.Regular,
    marginTop: hp(1),
    textAlign: 'center',
  },
});

export default DoctorReviews;
