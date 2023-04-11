/*
 *   Copyright (c) 2023 Wynter Jones
 *   All rights reserved.
 */

const midgpt_automation = {
  run: async () => {
    midgpt_engine.running = true

    const prompts = midgpt_engine.promptList

    if (
      midgpt_automation.showAlert(
        prompts.length === 0,
        'You have no prompts loaded.'
      )
    ) {
      return
    }

    const progressBar = document.getElementById('midgpt-progress-bar')
    let progress = 0

    progressBar.style.width = `0%`

    const performance = {
      start: new Date().getTime(),
      end: null,
      duration: null,
    }

    midgpt_automation.startTimer()
    document.querySelector('#midgpt-total').innerHTML =
      midgpt_engine.promptTotal
    document.querySelector('#midgpt-current').innerHTML = 1

    document.querySelector('.midgpt-progress').style.display = 'block'
    document.querySelector('.midgpt-body').style.display = 'none'
    document.querySelector('.midgpt-footer').style.display = 'none'

    for (let i = 0; i < prompts.length; i++) {
      if (!midgpt_engine.running) return false
      document.querySelector('#midgpt-current').innerHTML = i + 1

      const prompt = prompts[i]
      if (prompt !== '') {
        const timestamp = 'Batch Start: ' + Date.now()
        localStorage.setItem('midgpt-timestamp', timestamp)
        midgpt_send_message.sendMessageToDiscord(timestamp)
        await midgpt_send_message.run(prompt)

        if (!midgpt_engine.running) return false
        await midgpt_upscale.run(prompt)

        if (!midgpt_engine.running) return false
        await midgpt_save_image.run(prompt)

        if (!midgpt_engine.running) return false
        progress = (i + 1 / midgpt_engine.promptTotal) * 100
        progressBar.style.width = `${progress}%`

        await midgpt_automation.randomPromptDelay()
      }
    }

    performance.end = new Date().getTime()
    performance.duration = performance.end - performance.start

    midgpt_send_message.sendMessageToDiscord(
      'Batch Completed: ' +
        midgpt_automation.formatDuration(performance.duration)
    )

    document.querySelector('.midgpt-progress').style.display = 'none'
    document.querySelector('.midgpt-body').style.display = 'block'
    document.querySelector('.midgpt-footer').style.display = 'block'

    midgpt_automation.stopTimer()
    midgpt_engine.running = false
  },

  formatDuration: milliseconds => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  },

  randomPromptDelay: () => {
    const minSeconds = parseInt(midgpt_engine.minPromptSeconds)
    const maxMinutes = parseInt(midgpt_engine.minPromptMinutes)
    const minMilliseconds = minSeconds * 1000
    const maxMilliseconds = maxMinutes * 60 * 1000
    const waitTime = Math.floor(
      Math.random() * (maxMilliseconds - minMilliseconds + 1) + minMilliseconds
    )
    return new Promise(resolve => setTimeout(resolve, waitTime))
  },

  randomActionDelay: () => {
    const minSeconds = 1
    const minMilliseconds = minSeconds * 1000
    const maxMilliseconds = minSeconds * 5 * 1000
    const waitTime = Math.floor(
      Math.random() * (maxMilliseconds - minMilliseconds + 1) + minMilliseconds
    )
    return waitTime
  },

  startTimer: () => {
    midgpt_engine.timer = null

    function formatTime(seconds) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const remainingSeconds = seconds % 60

      const hourStr = hours > 0 ? `${hours}h ` : ''
      const minuteStr = minutes > 0 ? `${minutes}m ` : ''
      const secondStr = `${remainingSeconds}s`

      return hourStr + minuteStr + secondStr
    }

    function startCountUpTimer() {
      const timerElement = document.querySelector('.midgpt-progress-timer')
      let seconds = 0

      function updateTimer() {
        timerElement.textContent = formatTime(seconds)
        seconds += 1
      }

      document.querySelector('.midgpt-progress-timer').textContent = ''
      updateTimer()
      midgpt_engine.timer = setInterval(updateTimer, 1000)
    }

    startCountUpTimer()
  },

  stopTimer: () => {
    clearInterval(midgpt_engine.timer)
  },

  showAlert: (condition, message) => {
    if (condition) {
      alert(message)
      return true
    }
    return false
  },
}
