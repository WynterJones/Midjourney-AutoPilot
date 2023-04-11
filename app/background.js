chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'downloadImage') {
    const url = request.url
    const fileName = url.substring(url.lastIndexOf('/') + 1)
    let path = fileName

    chrome.storage.local.get(['midjourneyautopilot_folder']).then(result => {
      if (!result.midjourneyautopilot_folder) {
        path = `MidjourneyAutoPilot/${fileName}`
      } else {
        path = `${result.midjourneyautopilot_folder}/${fileName}`
      }

      chrome.downloads.download({
        url: url,
        filename: path,
      })
    })
  }

  if (request.action === 'close') {
    chrome.storage.local.set({
      midjourneyautopilot_closed: 'closed',
    })
  }
})

chrome.webRequest.onSendHeaders.addListener(
  function (details) {
    const userAgentHeader = details.requestHeaders.find(
      header => header.name.toLowerCase() === 'user-agent'
    )
    const authorizationHeader = details.requestHeaders.find(
      header => header.name.toLowerCase() === 'authorization'
    )

    if (userAgentHeader) {
      chrome.storage.local.set({
        midjourneyautopilot_useragent: userAgentHeader.value,
      })
    }

    if (authorizationHeader) {
      chrome.storage.local.set({
        midjourneyautopilot_token: authorizationHeader.value,
      })

      chrome.storage.local.set({
        midjourneyautopilot_sessionid: generateSessionId(),
      })
    }
  },
  { urls: ['https://discord.com/api/*/messages*'] },
  ['requestHeaders']
)

function generateSessionId() {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const sessionIdLength = 16
  let sessionId = ''

  for (let i = 0; i < sessionIdLength; i++) {
    sessionId += characters[Math.floor(Math.random() * characters.length)]
  }

  return sessionId
}
