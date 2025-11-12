export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('✅ Service Worker registered:', registration)
      return registration
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error)
    }
  }
}

export async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    console.log('🔔 Notification permission:', permission)
    return permission === 'granted'
  }
  return false
}

export async function subscribeToPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
    })
    
    console.log('✅ Push subscription:', subscription)
    return subscription
  } catch (error) {
    console.error('❌ Push subscription failed:', error)
    return null
  }
}

export async function showLocalNotification(title: string, body: string) {
  if (!('Notification' in window)) {
    console.error('❌ Notifications not supported')
    return
  }
  
  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.error('❌ Permission denied')
      return
    }
  }
  
  try {
    const registration = await navigator.serviceWorker.ready
    await registration.showNotification(title, {
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'payment-notification',
      requireInteraction: false,
      vibrate: [200, 100, 200],
    })
    console.log('✅ Notification shown')
  } catch (error) {
    console.error('❌ Notification error:', error)
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
