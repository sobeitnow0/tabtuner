document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('mixer-container');
  
  // i18n: translate all elements with data-i18n attributes
  const t = (key) => chrome.i18n.getMessage(key) || key;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
  
  // Feature: Theme Toggle
  const themeBtn = document.getElementById('theme-toggle-btn');
  chrome.storage.local.get({theme: 'auto'}, (data) => {
    if (data.theme !== 'auto') {
      document.documentElement.setAttribute('data-theme', data.theme);
      themeBtn.textContent = data.theme === 'light' ? '🌙' : '☀️';
    }
  });
  
  themeBtn.addEventListener('click', () => {
    let current = document.documentElement.getAttribute('data-theme');
    if (!current) {
      current = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    chrome.storage.local.set({theme: next});
    themeBtn.textContent = next === 'light' ? '🌙' : '☀️';
  });
  
  // Find tabs with media
  const allTabs = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });
  const tabsWithMedia = [];
  
  const promises = allTabs.map(async (tab) => {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: () => {
          const media = document.querySelectorAll('video, audio');
          if (media.length > 0) return media[0].volume;
          return null;
        }
      });
      const valid = results.find(r => r.result !== null);
      if (valid) return { tab, currentVolume: valid.result };
    } catch (e) {}
    return null;
  });
  
  const results = await Promise.all(promises);
  results.forEach(r => { if (r) tabsWithMedia.push(r); });
  
  if (tabsWithMedia.length === 0) {
    container.replaceChildren();
    const msg = document.createElement('div');
    msg.className = 'state-msg';
    msg.textContent = t('noTabs');
    container.appendChild(msg);
    return;
  }
  
  container.replaceChildren();
  
  for (const { tab, currentVolume } of tabsWithMedia) {
    const item = document.createElement('div');
    item.className = 'tab-item';
    
    // Header (favicon + title)
    const header = document.createElement('div');
    header.className = 'tab-header';
    
    const fav = document.createElement('img');
    fav.className = 'tab-favicon';
    fav.src = tab.favIconUrl || '../icons/icon16.png';
    fav.onerror = () => fav.src = '../icons/icon16.png';
    
    const name = document.createElement('span');
    name.className = 'tab-name';
    name.textContent = tab.title;
    
    header.appendChild(fav);
    header.appendChild(name);
    
    header.addEventListener('click', async () => {
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
    });
    
    // Slider row
    const row = document.createElement('div');
    row.className = 'slider-row';
    
    const icon = document.createElement('span');
    icon.className = 'vol-icon';
    icon.textContent = currentVolume === 0 ? '🔇' : (currentVolume > 0.5 ? '🔊' : '🔉');
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.value = Math.round(currentVolume * 100);
    
    const label = document.createElement('span');
    label.className = 'vol-value';
    label.textContent = slider.value + '%';
    
    item._slider = slider;
    
    const updateVolume = (vol) => {
      label.textContent = vol + '%';
      icon.textContent = vol === 0 ? '🔇' : (vol > 50 ? '🔊' : '🔉');
      chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: (v) => {
          document.querySelectorAll('video, audio').forEach(m => m.volume = v);
        },
        args: [vol / 100]
      }).catch(() => {});
    };
    
    slider.addEventListener('input', (e) => {
      updateVolume(parseInt(e.target.value, 10));
      syncMasterFromChildren();
    });
    
    row.appendChild(icon);
    row.appendChild(slider);
    row.appendChild(label);
    
    item.appendChild(header);
    item.appendChild(row);
    container.appendChild(item);
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const first = container.querySelector('.tab-item');
    if (!first || !first._slider) return;
    const s = first._slider;
    let v = parseInt(s.value, 10);
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { v = Math.min(100, v + 5); e.preventDefault(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { v = Math.max(0, v - 5); e.preventDefault(); }
    else return;
    s.value = v;
    s.dispatchEvent(new Event('input'));
  });

  // Panic Mute
  document.getElementById('mute-all-btn').addEventListener('click', () => {
    const ms = document.getElementById('master-slider');
    if (ms) { ms.value = 0; ms.dispatchEvent(new Event('input')); }
    else {
      container.querySelectorAll('input[type=range]').forEach(s => {
        s.value = 0; s.dispatchEvent(new Event('input'));
      });
    }
  });

  // Master Volume (bidirectional)
  const masterSlider = document.getElementById('master-slider');
  const masterLabel = document.getElementById('master-label');
  const masterIcon = document.getElementById('master-icon');
  let masterDriving = false;

  function updateMasterUI(vol) {
    masterLabel.textContent = vol + '%';
    masterIcon.textContent = vol === 0 ? '🔇' : (vol > 50 ? '🔊' : '🔉');
  }

  function syncMasterFromChildren() {
    if (masterDriving || !masterSlider) return;
    const sliders = container.querySelectorAll('input[type=range]');
    if (!sliders.length) return;
    let max = 0;
    sliders.forEach(s => { const v = parseInt(s.value); if (v > max) max = v; });
    masterSlider.value = max;
    updateMasterUI(max);
  }

  if (masterSlider) {
    syncMasterFromChildren();
    masterSlider.addEventListener('input', (e) => {
      masterDriving = true;
      const vol = parseInt(e.target.value, 10);
      updateMasterUI(vol);
      container.querySelectorAll('input[type=range]').forEach(s => {
        s.value = vol; s.dispatchEvent(new Event('input'));
      });
      masterDriving = false;
    });
  }

  // Smart Ducking Toggle
  const duckToggle = document.getElementById('ducking-toggle');
  chrome.storage.local.get({autoDuckingEnabled: true}, (d) => {
    duckToggle.checked = d.autoDuckingEnabled;
  });
  duckToggle.addEventListener('change', (e) => {
    chrome.storage.local.set({autoDuckingEnabled: e.target.checked});
  });
});
