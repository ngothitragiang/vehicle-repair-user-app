import PushNotification from 'react-native-push-notification'
import { APP_COLOR } from '../../utils/AppSettings'

class LocalNotificationService {

  configure = (onOpenNotification) => {
    PushNotification.configure({
      onRegister: (token) => { },
      onNotification: (notification) => {
        // Foreground notification https://rnfirebase.io/messaging/usage#notifications
        if (!notification?.data || Object.keys(notification?.data).length < 1) {
          return
        }
        notification.userInteraction = true
        onOpenNotification(notification.data)
      },
      popInitialNotification: true,
    })
  }

  unregister = () => {
    PushNotification.unregister()
  }

  showNotification = (id, title, message, data = {}, options = {}) => {
    PushNotification.localNotification({
      id: id,
      title: title || '',
      message: message || '',
      autoCancel: true,
      largeIcon: options.largeIcon || 'ic_launcher',
      smallIcon: options.smallIcon || 'ic_launcher',
      bigText: message || '',
      subText: title || '',
      color: APP_COLOR,
      vibrate: options.vibrate || true,
      vibration: options.vibration || 1000,
      playSound: options.playSound || false,
      soundName: options.soundName || "default",
      priority: options.priority || 'high',
      importance: options.importance || 'high',
      data: data,
      userInteraction: false
    })
  }

  cancelAllLocalNotifications = () => {
    PushNotification.cancelAllLocalNotifications()
  }

  removeDeliveredNotificationByID = (notificationId) => {
    PushNotification.removeDeliveredNotificationByID(notificationId)
  }
}

export const localNotificationService = new LocalNotificationService()