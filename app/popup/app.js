/*
 *   Copyright (c) 2023 Wynter Jones
 *   All rights reserved.
 */

document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.local.get(['midjourneyautopilot_folder']).then(result => {
    document.getElementById('folder').value =
      result.midjourneyautopilot_folder || ''
  })

  chrome.storage.local.get(['midjourneyautopilot_closed']).then(result => {
    document.getElementById('toggle').value =
      result.midjourneyautopilot_closed || 'open'
  })

  chrome.storage.local.get(['midjourneyautopilot_promptMin']).then(result => {
    document.getElementById('promptMin').value =
      result.midjourneyautopilot_promptMin || '30'
  })

  chrome.storage.local.get(['midjourneyautopilot_promptMax']).then(result => {
    document.getElementById('promptMax').value =
      result.midjourneyautopilot_promptMax || '2'
  })

  document.getElementById('folder').addEventListener('change', event => {
    const value = event.target.value
    chrome.storage.local.set({ midjourneyautopilot_folder: value })
    updateMessage()
  })

  document.getElementById('promptMin').addEventListener('change', event => {
    const value = event.target.value
    chrome.storage.local.set({ midjourneyautopilot_promptMin: value })
    updateMessage()
  })

  document.getElementById('promptMax').addEventListener('change', event => {
    const value = event.target.value
    chrome.storage.local.set({ midjourneyautopilot_promptMax: value })
    updateMessage()
  })

  document.getElementById('toggle').addEventListener('change', e => {
    const value = e.target.value
    chrome.storage.local.set({ midjourneyautopilot_closed: value })
    updateMessage()
  })

  function updateMessage() {
    alert('You will need to reload the discord page for this to take effect.')
  }
})
