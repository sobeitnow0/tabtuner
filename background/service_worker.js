chrome.runtime.onInstalled.addListener(() => {
  console.log("TabTuner installed.");
});

chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  
  if (command === 'volume-up' || command === 'volume-down') {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: (cmd) => {
          const media = document.querySelectorAll('video, audio');
          if (media.length === 0) return;
          
          let currentVol = media[0].volume;
          let newVol = currentVol;
          
          if (cmd === 'volume-up') {
            newVol = Math.min(1.0, currentVol + 0.05);
          } else if (cmd === 'volume-down') {
            newVol = Math.max(0.0, currentVol - 0.05);
          }
          
          media.forEach(m => m.volume = newVol);
        },
        args: [command]
      });
    } catch (e) {
      console.log('Failed to execute shortcut on tab:', e);
    }
  }
});

// --- Smart Auto-Ducking Feature ---

// Track which tabs are ducked (just IDs, volumes saved per-frame in the page)
async function getDuckedTabs() {
  const data = await chrome.storage.session.get('duckedTabs');
  return data.duckedTabs || {};
}

async function setDuckedTabs(data) {
  await chrome.storage.session.set({ duckedTabs: data });
}

async function restoreAllDuckedTabs() {
  const duckedTabs = await getDuckedTabs();
  const ids = Object.keys(duckedTabs);
  if (ids.length === 0) return;

  for (const tabIdStr of ids) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: parseInt(tabIdStr), allFrames: true },
        func: () => {
          // Each frame restores from its own saved state
          if (!window.__tabtuner_originals) return;
          const media = document.querySelectorAll('video, audio');
          media.forEach((m, i) => {
            if (i < window.__tabtuner_originals.length) {
              m.volume = window.__tabtuner_originals[i];
            }
          });
          delete window.__tabtuner_originals;
        }
      });
    } catch (e) {}
  }
  await setDuckedTabs({});
}

async function isDuckingEnabled() {
  const data = await chrome.storage.local.get({ autoDuckingEnabled: true });
  return data.autoDuckingEnabled;
}

async function evaluateDucking() {
  if (!(await isDuckingEnabled())) return;

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab) return;

  const duckedTabs = await getDuckedTabs();

  if (activeTab.audible) {
    const allAudible = await chrome.tabs.query({ audible: true });
    let changed = false;

    for (const t of allAudible) {
      if (t.id === activeTab.id) continue;
      if (t.id in duckedTabs) continue;

      try {
        const res = await chrome.scripting.executeScript({
          target: { tabId: t.id, allFrames: true },
          func: () => {
            // Each frame saves its own volumes, then ducks by 50%
            const media = document.querySelectorAll('video, audio');
            if (media.length === 0) return false;
            window.__tabtuner_originals = [];
            media.forEach(m => {
              window.__tabtuner_originals.push(m.volume);
              m.volume = m.volume * 0.5;
            });
            return true;
          }
        });
        const didDuck = res.some(r => r.result === true);
        if (didDuck) {
          duckedTabs[t.id] = true;
          changed = true;
        }
      } catch (e) {}
    }
    if (changed) await setDuckedTabs(duckedTabs);
  } else {
    await restoreAllDuckedTabs();
  }
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.autoDuckingEnabled) {
    if (changes.autoDuckingEnabled.newValue === false) {
      restoreAllDuckedTabs();
    } else {
      evaluateDucking();
    }
  }
});

chrome.tabs.onActivated.addListener(() => {
  evaluateDucking();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.audible !== undefined) {
    evaluateDucking();
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const duckedTabs = await getDuckedTabs();
  if (tabId in duckedTabs) {
    delete duckedTabs[tabId];
    await setDuckedTabs(duckedTabs);
  }
});
