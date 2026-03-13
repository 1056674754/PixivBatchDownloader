import { lang } from "../Lang"
import { settings } from "./Settings"

// 在适当的位置添加新的设置UI
export function createServerSettingsUI() {
  const serverSettings = document.createElement('div')
  serverSettings.classList.add('settingCategoryWrap')

  const title = document.createElement('div')
  title.classList.add('settingCategoryTitle')
  title.textContent = lang.transl('_服务器设置')
  serverSettings.appendChild(title)

  // 使用服务器下载
  const useServerDownloadWrap = document.createElement('div')
  useServerDownloadWrap.classList.add('settingItem')
  
  const useServerDownloadLabel = document.createElement('span')
  useServerDownloadLabel.textContent = lang.transl('_使用服务器下载')
  useServerDownloadWrap.appendChild(useServerDownloadLabel)
  
  const useServerDownloadInput = document.createElement('input')
  useServerDownloadInput.type = 'checkbox'
  useServerDownloadInput.checked = settings.useServerDownload
  useServerDownloadInput.addEventListener('change', () => {
    settings.useServerDownload = useServerDownloadInput.checked
  })
  useServerDownloadWrap.appendChild(useServerDownloadInput)
  
  serverSettings.appendChild(useServerDownloadWrap)

  // 服务器URL
  const serverURLWrap = document.createElement('div')
  serverURLWrap.classList.add('settingItem')
  
  const serverURLLabel = document.createElement('span')
  serverURLLabel.textContent = lang.transl('_服务器URL')
  serverURLWrap.appendChild(serverURLLabel)
  
  const serverURLInput = document.createElement('input')
  serverURLInput.type = 'text'
  serverURLInput.value = settings.serverURL
  serverURLInput.addEventListener('change', () => {
    settings.serverURL = serverURLInput.value
  })
  serverURLWrap.appendChild(serverURLInput)
  
  serverSettings.appendChild(serverURLWrap)

  // 跳过已下载的作品
  const skipDownloadedWrap = document.createElement('div')
  skipDownloadedWrap.classList.add('settingItem')
  
  const skipDownloadedLabel = document.createElement('span')
  skipDownloadedLabel.textContent = lang.transl('_跳过已下载的作品')
  skipDownloadedWrap.appendChild(skipDownloadedLabel)
  
  const skipDownloadedInput = document.createElement('input')
  skipDownloadedInput.type = 'checkbox'
  skipDownloadedInput.checked = settings.skipDownloaded
  skipDownloadedInput.addEventListener('change', () => {
    settings.skipDownloaded = skipDownloadedInput.checked
  })
  skipDownloadedWrap.appendChild(skipDownloadedInput)
  
  serverSettings.appendChild(skipDownloadedWrap)

  return serverSettings
}

// 在createSettingPanel函数中添加服务器设置UI
export function createSettingPanel() {
  // ... existing code ...
  
  // 在适当的位置添加服务器设置
  const serverSettings = createServerSettingsUI()
  settingPanel.appendChild(serverSettings)
  
  // ... existing code ...
} 