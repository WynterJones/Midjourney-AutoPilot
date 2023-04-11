/*
 *   Copyright (c) 2023 Wynter Jones
 *   All rights reserved.
 */

const midgpt_upscale = {
  run: async prompt => {
    const upscaleBatch = async (prompt, index) => {
      return new Promise(resolve => {
        const interval = setInterval(async () => {
          const chatMessages = await midgpt_get_messages.run()
          const chatMessage = Array.from(chatMessages).find(element =>
            element.innerText.includes(prompt)
          )

          if (chatMessage) {
            const upscaleButtons = chatMessage.querySelectorAll(
              'button[role="button"]'
            )

            if (upscaleButtons.length > 0) {
              upscaleButtons.forEach(button => {
                if (
                  button.innerText.trim() === 'U' + index &&
                  !button.getAttribute('class').includes('colorBrand')
                ) {
                  button.click()
                  clearInterval(interval)
                  setTimeout(() => {
                    resolve(true)
                  }, midgpt_automation.randomActionDelay())
                }
              })
            }
          }
        }, midgpt_automation.randomActionDelay())
      })
    }

    const runUpscaleBatches = async (count, prompt) => {
      for (let i = 0; i < count; i++) {
        await upscaleBatch(prompt, i + 1)
      }
    }

    await runUpscaleBatches(4, prompt)
  },
}
