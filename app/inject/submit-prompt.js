/*
 *   Copyright (c) 2023 Wynter Jones
 *   All rights reserved.
 */

const midgpt_send_message = {
  run: prompt => {
    return new Promise(async resolve => {
      midgpt_send_message.sendInteraction(prompt)

      const interval = setInterval(async () => {
        const chatMessages = await midgpt_get_messages.run()

        chatMessages.forEach(message => {
          if (
            message.innerText.includes(prompt) &&
            message.innerText.includes('U1') &&
            message.innerText.includes('U2') &&
            message.innerText.includes('U3') &&
            message.innerText.includes('U4')
          ) {
            clearInterval(interval)
            resolve(true)
          }
        })
      }, midgpt_automation.randomActionDelay())
    })
  },

  sendMessageToDiscord: async message => {
    const channel_id = midgpt_send_message.extractChannelId()
    const channel_url = `https://discord.com/api/v8/channels/${channel_id}/messages`
    const token = await midgpt_send_message.getToken()
    const useragent = await midgpt_send_message.getUserAgent()
    const request = new XMLHttpRequest()
    request.withCredentials = true
    request.open('POST', channel_url)
    request.setRequestHeader('authorization', token)
    request.setRequestHeader('accept', '/')
    request.setRequestHeader('authority', 'discordapp.com')
    request.setRequestHeader('content-type', 'application/json')
    request.setRequestHeader('user-agent', useragent)
    request.send(JSON.stringify({ content: message }))
  },

  sendInteraction: async prompt => {
    const token = await midgpt_send_message.getToken()
    const channel_id = midgpt_send_message.extractChannelId()
    const guild_id = midgpt_send_message.extractGuildId()
    const session_id = await midgpt_send_message.getSessionId()
    const useragent = await midgpt_send_message.getUserAgent()
    const request = new XMLHttpRequest()
    request.withCredentials = true
    request.open('POST', 'https://discord.com/api/v9/interactions')
    request.setRequestHeader('authorization', token)
    request.setRequestHeader('accept', '/')
    request.setRequestHeader('authority', 'discordapp.com')
    request.setRequestHeader('content-type', 'application/json')
    request.setRequestHeader('user-agent', useragent)
    request.send(
      JSON.stringify({
        type: 2,
        application_id: '936929561302675456',
        guild_id: guild_id,
        channel_id: channel_id,
        session_id: session_id,
        data: {
          version: '1077969938624553050',
          id: '938956540159881230',
          name: 'imagine',
          type: 1,
          options: [{ type: 3, name: 'prompt', value: prompt }],
          application_command: {
            id: '938956540159881230',
            application_id: '936929561302675456',
            version: '1077969938624553050',
            default_member_permissions: null,
            type: 1,
            nsfw: false,
            name: 'imagine',
            description: 'Create images with Midjourney',
            dm_permission: true,
            options: [
              {
                type: 3,
                name: 'prompt',
                description: 'The prompt to imagine',
                required: true,
              },
            ],
          },
          attachments: [],
        },
      })
    )
  },

  getToken: async () => {
    const token = await chrome.storage.local.get(['midjourneyautopilot_token'])
    return token.midjourneyautopilot_token
  },

  getUserAgent: async () => {
    const useragent = await chrome.storage.local.get([
      'midjourneyautopilot_useragent',
    ])
    return useragent.midjourneyautopilot_useragent
  },

  getSessionId: async () => {
    const sessionid = await chrome.storage.local.get([
      'midjourneyautopilot_sessionid',
    ])
    return sessionid.midjourneyautopilot_sessionid
  },

  extractChannelId: () => {
    const url = window.location.href
    const discordUrlPattern = /https:\/\/discord\.com\/channels\/\d+\/(\d+)/
    const match = url.match(discordUrlPattern)

    if (match && match[1]) {
      return match[1]
    } else {
      return null
    }
  },

  extractGuildId: () => {
    const url = window.location.href
    const discordUrlPattern = /https:\/\/discord\.com\/channels\/(\d+)\/\d+/
    const match = url.match(discordUrlPattern)

    if (match && match[1]) {
      return match[1]
    } else {
      return null
    }
  },
}
