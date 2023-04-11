/*
 *   Copyright (c) 2023 Wynter Jones
 *   All rights reserved.
 */

const midgpt_save_image = {
  run: async prompt => {
    await midgpt_save_image.checker(prompt)
    await midgpt_save_image.downloadAll(prompt)
  },

  downloadAll: prompt => {
    return new Promise(async resolve => {
      const chatMessages = await midgpt_get_messages.run()
      let imageCounter = 1

      for (const message of chatMessages) {
        if (
          message.innerText.includes(prompt) &&
          message.innerText.includes(`Image #${imageCounter}`)
        ) {
          const url = midgpt_save_image.findImageLink(message)
          await midgpt_save_image.download(url)
          imageCounter++

          if (imageCounter > 4) {
            resolve('completed')
            break
          }
        }
      }
    })
  },

  checker: prompt => {
    return new Promise(resolve => {
      const checkInterval = setInterval(async () => {
        const chatMessages = await midgpt_get_messages.run()
        let imageCounter = 1

        for (const message of chatMessages) {
          if (
            message.innerText.includes(prompt) &&
            message.innerText.includes(`Image #${imageCounter}`)
          ) {
            imageCounter++
            if (imageCounter > 4) {
              clearInterval(checkInterval)
              resolve('completed')
              break
            }
          }
        }
      }, midgpt_automation.randomActionDelay())
    })
  },

  download: async url => {
    return new Promise(resolve => {
      setTimeout(() => {
        chrome.runtime.sendMessage({
          action: 'downloadImage',
          url: url,
        })
        resolve()
      }, midgpt_automation.randomActionDelay())
    })
  },

  findImageLink: dom => {
    const allElements = dom.querySelectorAll('*')

    for (const element of allElements) {
      const classNames = Array.from(element.classList)
      const originalLinkClass = classNames.find(className =>
        className.startsWith('originalLink-')
      )

      if (originalLinkClass) {
        return element.href
      }
    }

    return null
  },
}
