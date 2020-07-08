import React, { Component } from 'react'
import { sideMenu } from '../configs/menu/sideMenu'
import { connect } from 'react-redux'
import { fcmService } from '../configs/notification/FCMService'
import { localNotificationService } from '../configs/notification/LocalNotificationService'
import * as Actions from '../redux/appRedux/actions'
import { changeLocation } from '../redux/optionsRedux/actions'
import { PermissionsAndroid, Animated, View } from 'react-native'
import Geolocation from 'react-native-geolocation-service'
import Geocoder from 'react-native-geocoder'
import { fetchNotifications } from '../redux/notifyRedux/actions'
import { fetchOrders } from '../redux/orderRedux/actions'
import Navigator from '../utils/Navigator'

//
import Swiper from 'react-native-web-swiper'
import SwiperItem from '../components/Splash/SwiperItem'
import { swipers } from '../data/swipers'
//

import SplashScreen from 'react-native-splash-screen'

class GetStartedScreen extends Component {

  constructor(props) {
    super(props)
    this.state = {
      isNavigated: false
    }
  }

  componentDidMount = async () => {
    // Register FCM Service
    fcmService.register(this.onRegister, this.onNotification, this.onOpenNotification)
    // Configure notification options
    localNotificationService.configure(this.onOpenNotification)

    // Check permission: true/false
    const locationPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
    const { isStarted } = this.props.app
    if (!locationPermission && isStarted) {
      await this.checkLocationPermission()
    }
    await this.getCurrentLocation()
    setTimeout(SplashScreen.hide, 4000)
  }

  getCurrentLocation = async () => {
    await Geolocation.getCurrentPosition(async position => {
      await Geocoder.geocodePosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
        .then(res => {
          const location = {
            address: res[0].formattedAddress.replace('Unnamed Road, ', ''),
            coords: res[0].position
          }
          this.props.onChangeLocation(location)
        })
        .catch(err => console.log(err))
    }, error => {
      console.log(error)
    })
  }

  checkLocationPermission = async () => {
    let locationPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
    if (!locationPermission) {
      locationPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
      if (locationPermission !== 'granted') {
        Navigator.showOverlay({ message: 'Để ứng dụng biết được vị trí chính xác, vui lòng cho phép ứng dụng truy cập vị trí của bạn' })
        return false
      }
    }
    return true
  }

  // NOTIFICATION SETUP
  onRegister = (token) => {
    this.props.onChangeDeviceToken(token)
  }

  onNotification = (notify) => {
    const options = {
      playSound: false
    }
    localNotificationService.showNotification(
      0,
      notify.title,
      notify.body,
      notify,
      options
    )
  }

  onOpenNotification = (data) => {
    const notifyId = data?.id
    if (notifyId) {
      // SHOW POP-UP HERE
      this.props.onFetchOrders()
      this.props.onFetchNotifications()
    } else {
      Navigator.dismissAllModals()
      Navigator.showModal('NotificationScreen')
    }
  }
  // END NOTIFICATION SETUP

  componentWillUnmount() {
    // fcmService.unregister()
    // localNotificationService.unregister()
  }

  handleStartBtnPressed = async () => {
    const granted = await this.checkLocationPermission()
    if (granted) {
      await this.getCurrentLocation()
      this.props.onGetStarted()
    }
  }

  render() {
    const { app: { isStarted }, auth: { authenticated } } = this.props
    const { isNavigated } = this.state
    if (isStarted) {
      if (!isNavigated) {
        if (authenticated) {
          Navigator.setRoot({
            sideMenu
          })
          this.setState({ isNavigated: true })
        } else {
          Navigator.setRoot({
            component: {
              name: 'AuthScreen'
            }
          })
        }
      }
      return <></>
    }
    return (
      <Swiper
        controlsProps={{
          prevPos: false,
          nextPos: false,
          dotsWrapperStyle: {
            bottom: 130,
          },
        }}>
        {
          swipers.map((item, index) => {
            return (
              <SwiperItem
                key={index}
                item={item}
                onButtonStartPressed={this.handleStartBtnPressed}
              />
            );
          })
        }
      </Swiper >
      // <>
      //   <View style={{ flex: 1 }}>
      //     <Animated.View>
            
      //     </Animated.View>
      //     <Animated.View>
            
      //     </Animated.View>
      //   </View>
      // </>
    )
  }
}

const mapStateToProps = state => {
  return {
    auth: state.auth,
    app: state.app,
    options: state.options
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onChangeLocation: location => dispatch(changeLocation(location)),
    onChangeDeviceToken: token => dispatch(Actions.changeDeviceToken(token)),
    onGetStarted: () => dispatch(Actions.getStarted()),
    onFetchNotifications: pageIndex => dispatch(fetchNotifications(pageIndex)),
    onFetchOrders: pageIndex => dispatch(fetchOrders(pageIndex))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GetStartedScreen)