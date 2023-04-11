/*
 *   Copyright (c) 2023 Wynter Jones
 *   All rights reserved.
 */

const midgpt_get_messages = {
  run: async () => {
    const allChatMessages = document.querySelectorAll(
      '[data-list-id="chat-messages"] li'
    )
    const timestamp = localStorage.getItem('midgpt-timestamp')
    let splitIndex = null
    let chatMessages = []

    allChatMessages.forEach((message, index) => {
      if (message.innerText.includes(timestamp)) {
        splitIndex = index
      }
    })

    if (splitIndex !== null) {
      const chatMessagesArray = Array.from(allChatMessages)
      const messagesAfterSplit = chatMessagesArray.slice(splitIndex + 1)

      chatMessages = messagesAfterSplit
    } else {
      return []
    }

    return chatMessages
  },
}
