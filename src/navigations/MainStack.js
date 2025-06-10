import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabNavigator from "./BottomTabBar";
import SeeAllDoctors from "../Screens/MainStack/SeeAllDoctors";
import { SCREENS } from "../Constants/Screens";
import Details from "../Screens/MainStack/Details";
import NewAppointment from "../Screens/MainStack/NewAppointment";
import Notifications from "../Screens/MainStack/Notifications";
import Chat from "../Screens/MainStack/Chat";
import UpdateProfile from "../Screens/MainStack/UpdateProfile";
import Favourites from "../Screens/MainStack/Favourites";
import PaymentOptions from "../Screens/MainStack/PaymentOptions";
import PasswordManager from "../Screens/MainStack/PasswordManager";
import HelpCenter from "../Screens/MainStack/HelpCenter";
import NotificationSettings from "../Screens/MainStack/AppPrefrences";
import MyAppointment from "../Screens/MainStack/MyAppointment";
import CancelAppointment from "../Screens/MainStack/CancelAppointment";
import Filters from "../Screens/MainStack/Filters";
import AddCard from "../Screens/MainStack/AddCard";
import ReviewSummary from "../Screens/MainStack/ReviewSummary";
import PaymentSuccess from "../Screens/MainStack/PaymentSuccess";
import ThemeSetting from "../Screens/MainStack/ThemeSetting";
import DetailsScreen from "../Screens/MainStack/DetailsScreen";


const Stack = createNativeStackNavigator()


const MainStack = () =>{
    return (
        <Stack.Navigator screenOptions={{
            // tabBarHideOnKeyboard: true,
            headerShown: false,
           
        }}>   
                    <Stack.Screen name={SCREENS.TABS} component={BottomTabNavigator} />
                    <Stack.Screen name={SCREENS.SEEALLDOCTORS} component={SeeAllDoctors} />
                    <Stack.Screen name={SCREENS.DETAILS} component={DetailsScreen} />
                    <Stack.Screen name={SCREENS.NEWAPPOINTMENT} component={NewAppointment} />
                    <Stack.Screen name={SCREENS.NOTIFICATONS} component={Notifications} />
                    <Stack.Screen name={SCREENS.CHAT} component={Chat} />
                    <Stack.Screen name={SCREENS.UPDATEPROFILE} component={UpdateProfile} />
                    <Stack.Screen name={SCREENS.FAVORITES} component={Favourites} />
                    <Stack.Screen name={SCREENS.PAYMENTOPTION} component={PaymentOptions} />
                    <Stack.Screen name={SCREENS.PASSWORDMANAGER} component={PasswordManager} />
                    <Stack.Screen name={SCREENS.HELPCENTER} component={HelpCenter} />
                    <Stack.Screen name={SCREENS.NOTIFICATIONSETTINGS} component={NotificationSettings} />
                    <Stack.Screen name={SCREENS.THEMESETTINGS} component={ThemeSetting} />
                    <Stack.Screen name={SCREENS.MYAPPOINTMENT} component={MyAppointment} />
                    <Stack.Screen name={SCREENS.CANCELAPPOINTMENT} component={CancelAppointment} />
                    <Stack.Screen name={SCREENS.FILTERS} component={Filters} />
                    <Stack.Screen name={SCREENS.ADDCARD} component={AddCard} />
                    <Stack.Screen name={SCREENS.REVIEWSUMMARY} component={ReviewSummary} />
                    <Stack.Screen name={SCREENS.PAYMENTSUCCESS} component={PaymentSuccess} />

        </Stack.Navigator>
    )
}

export default MainStack;