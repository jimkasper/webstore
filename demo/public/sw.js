self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url || '/autogenes/contacts'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus()
      }
      return clients.openWindow(url)
    })
  )
})
