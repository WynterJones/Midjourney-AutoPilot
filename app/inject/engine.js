/*
 *   Copyright (c) 2023 Wynter Jones
 *   All rights reserved.
 */

setTimeout(() => {
  midgpt_engine.appendFloatingToolbar()
  midgpt_engine.addEventListeners()
  midgpt_engine.makeDraggable()
  midgpt_engine.setDelays()
}, 2000)

const midgpt_engine = {
  promptList: [],
  running: false,
  minPromptSeconds: 30,
  maxPromptMinutes: 2,
  promptTotal: 0,
  promptCurrent: 0,
  timer: null,

  checkVisibility: async () => {
    const isClosed = await chrome.storage.local.get([
      'midjourneyautopilot_closed',
    ])

    if (isClosed.midjourneyautopilot_closed !== 'closed') {
      document.querySelector('#midgpt-floating-toolbar').style.display = 'block'
    }
  },

  setDelays: async () => {
    const promptMin = await chrome.storage.local.get([
      'midjourneyautopilot_promptMin',
    ])
    const promptMax = await chrome.storage.local.get([
      'midjourneyautopilot_promptMax',
    ])

    if (promptMin.midjourneyautopilot_promptMin) {
      midgpt_engine.minPromptSeconds = promptMin.midjourneyautopilot_promptMin
    }

    if (promptMax.midjourneyautopilot_promptMax) {
      midgpt_engine.maxPromptMinutes = promptMax.midjourneyautopilot_promptMax
    }
  },

  appendFloatingToolbar: () => {
    const toolbar = document.createElement('div')
    toolbar.id = 'midgpt-floating-toolbar'
    toolbar.style.display = 'none'
    toolbar.innerHTML = `
    <div class="midgpt-body">
      <div id="midgpt-custom-prompt-wrapper">
        <textarea type="text" id="midgpt-custom-prompt" placeholder="Write or paste your prompts here..."></textarea>
      </div>

      <div class="midgpt-estimate">
        Paste your prompt list above and click "Run Automation" to begin.
      </div>
    </div>

    <div class="midgpt-footer">
      <button class="midgpt-button disabled" id="midGPT-auto-run">Run Automation</button>
      <button class="midgpt-button-small" id="midgpt-close" style="margin-top: 5px;">Close Window</button>
    </div>

    <div class="midgpt-progress" style="display: none">
      <div class="midgpt-progress-header">
        <div class="midgpt-progress-text">Processing...</div>
        <div class="midgpt-progress-text">
          <span id="midgpt-current">1</span> / <span id="midgpt-total">10</span>
        </div>
      </div>
      <div id="midgpt-progress-container">
        <div class="midgpt-progress-timer">1h 1m 2s</div>
        <div id="midgpt-progress-bar"></div>
      </div>
      <button class="midgpt-button-stop" id="midgpt-stop" style="margin-top: 15px;">Stop</button>
    </div>

    <div style="text-align: center">
      <a id="midgpt-wynter" href="https://wynter.ai" target="_blank">
        Find More AI Tools @ Wynter.ai
      </a>
    </div>`
    document.body.appendChild(toolbar)
    midgpt_engine.checkVisibility()
  },

  addEventListeners: () => {
    document
      .querySelector('#midGPT-auto-run')
      .addEventListener('click', midgpt_automation.run)

    document
      .querySelector('#midgpt-custom-prompt')
      .addEventListener('input', midgpt_engine.loadPrompts)

    document
      .querySelector('#midgpt-close')
      .addEventListener('click', midgpt_engine.close)

    document
      .querySelector('#midgpt-stop')
      .addEventListener('click', midgpt_engine.stop)
  },

  stop: () => {
    midgpt_engine.running = false
    document.querySelector('.midgpt-progress').style.display = 'none'
    document.querySelector('.midgpt-body').style.display = 'block'
    document.querySelector('.midgpt-footer').style.display = 'block'
  },

  close: () => {
    document.querySelector('#midgpt-floating-toolbar').style.display = 'none'
    chrome.runtime.sendMessage({
      action: 'close',
    })
  },

  loadPrompts: () => {
    const customPrompt = document.querySelector('#midgpt-custom-prompt')

    if (customPrompt.value) {
      midgpt_engine.promptList = customPrompt.value
        .split('\n')
        .filter(line => line.trim() !== '')
      const promptListCount = midgpt_engine.promptList.length

      document.querySelector(
        '.midgpt-estimate'
      ).innerHTML = `Please note it takes <strong>${parseInt(
        promptListCount * 1.3
      )}-${promptListCount * 3} minutes</strong> to generate <strong>${
        promptListCount * 4
      } images</strong>.`

      document.querySelector(
        '#midGPT-auto-run'
      ).innerText = `Run Automation (${promptListCount})`
      document.querySelector('#midGPT-auto-run').classList.remove('disabled')
      midgpt_engine.promptTotal = promptListCount
    }
  },

  makeDraggable: () => {
    function makeDraggable(element) {
      let offsetX, offsetY
      let mouseX, mouseY
      let isMouseDown = false

      function onMouseDown(e) {
        isMouseDown = true
        offsetX = e.clientX - element.getBoundingClientRect().left
        offsetY = e.clientY - element.getBoundingClientRect().top
      }

      function onMouseMove(e) {
        if (!isMouseDown) return
        mouseX = e.clientX - offsetX
        mouseY = e.clientY - offsetY
        element.style.left = mouseX + 'px'
        element.style.top = mouseY + 'px'

        localStorage.setItem('midGPT_X', mouseX)
        localStorage.setItem('midGPT_Y', mouseY)
      }

      function onMouseUp() {
        isMouseDown = false
      }

      element.addEventListener('mousedown', onMouseDown)
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    const div = document.getElementById('midgpt-floating-toolbar')
    makeDraggable(div)

    const storedX = localStorage.getItem('midGPT_X')
    const storedY = localStorage.getItem('midGPT_Y')

    if (storedX && storedY) {
      div.style.left = storedX + 'px'
      div.style.top = storedY + 'px'
    }
  },
}
