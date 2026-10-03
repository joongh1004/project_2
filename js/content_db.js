/**
 * LISTEN - Recommended Content Metadata Database Manager Module
 */

const ContentDB = (function() {
  const STORAGE_KEY = 'listen_contents_metadata_db';
  let dbCache = null;

  // Initial fallback DB
  const defaultDB = {
    version: "1.0.0",
    updatedAt: new Date().toISOString(),
    contents: []
  };

  /**
   * Load metadata DB from LocalStorage, Server API, or local JSON file
   */
  async function loadDB() {
    // 1. Try LocalStorage first (for admin updates offline)
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      try {
        dbCache = JSON.parse(localData);
        return dbCache;
      } catch (e) {
        console.warn('LocalStorage JSON parse error, fetching fresh contents_db.json', e);
      }
    }

    // 2. Fetch from server API or local static json file
    try {
      const response = await fetch('js/contents_db.json?t=' + Date.now());
      if (response.ok) {
        dbCache = await response.json();
        saveToLocalStorage(dbCache);
        return dbCache;
      }
    } catch (err) {
      console.warn('Failed to fetch js/contents_db.json:', err);
    }

    // 3. Fallback to default empty DB
    dbCache = defaultDB;
    return dbCache;
  }

  function saveToLocalStorage(data) {
    dbCache = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Get all active content items
   */
  async function getAllContents(includeInactive = false) {
    if (!dbCache) await loadDB();
    if (!dbCache || !dbCache.contents) return [];
    return includeInactive ? dbCache.contents : dbCache.contents.filter(item => item.isActive !== false);
  }

  /**
   * Filter content items by Enneagram Wing/Type & State
   */
  async function getRecommendations(wingType, userQuery = '', stateTag = '') {
    const all = await getAllContents(false);
    if (!all || all.length === 0) return [];

    // Parse main type from wing (e.g., '1w9' -> main type 1, wing '1w9')
    let mainType = null;
    if (wingType) {
      const match = wingType.match(/^(\d+)/);
      if (match) mainType = parseInt(match[1], 10);
    }

    // Calculate score for each content item
    const scored = all.map(item => {
      let score = 0;

      // 1. Enneagram Wing Match (+5 points)
      if (wingType && item.targetEnneagram?.wings?.includes(wingType)) {
        score += 5;
      }

      // 2. Primary Type Match (+3 points)
      if (mainType && item.targetEnneagram?.primaryTypes?.includes(mainType)) {
        score += 3;
      }

      // 3. State Tag Match (+4 points)
      if (stateTag && item.recommendedState?.some(s => s.includes(stateTag) || stateTag.includes(s))) {
        score += 4;
      }

      // 4. Keyword Query Match (+2 points per hit)
      if (userQuery) {
        const queryLower = userQuery.toLowerCase();
        if (item.title?.toLowerCase().includes(queryLower)) score += 3;
        if (item.summary?.toLowerCase().includes(queryLower)) score += 2;
        if (item.bibleVerse?.toLowerCase().includes(queryLower)) score += 2;
        if (item.tags?.some(t => t.toLowerCase().includes(queryLower))) score += 2.5;
        if (item.recommendedState?.some(s => s.toLowerCase().includes(queryLower))) score += 2.5;
      }

      return { item, score };
    });

    // Filter out items with 0 score if query or type was provided
    let filtered = scored;
    if (wingType || userQuery || stateTag) {
      filtered = scored.filter(s => s.score > 0);
    }

    // Sort by score descending
    filtered.sort((a, b) => b.score - a.score);

    // Return items
    return filtered.map(s => s.item);
  }

  /**
   * Admin: Add or Update a Content Metadata item
   */
  async function saveContentItem(contentItem) {
    if (!dbCache) await loadDB();

    if (!contentItem.id) {
      contentItem.id = 'content_' + Date.now();
    }
    contentItem.updatedAt = new Date().toISOString();
    if (!contentItem.createdAt) {
      contentItem.createdAt = new Date().toISOString().split('T')[0];
    }

    const index = dbCache.contents.findIndex(c => c.id === contentItem.id);
    if (index >= 0) {
      dbCache.contents[index] = contentItem;
    } else {
      dbCache.contents.unshift(contentItem);
    }

    dbCache.updatedAt = new Date().toISOString();
    saveToLocalStorage(dbCache);

    // Try posting to PowerShell backend server API if running
    try {
      await fetch('/api/contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentItem)
      });
    } catch (e) {
      // Offline mode or static hosting
    }

    return contentItem;
  }

  /**
   * Admin: Delete a Content Metadata item
   */
  async function deleteContentItem(id) {
    if (!dbCache) await loadDB();
    dbCache.contents = dbCache.contents.filter(c => c.id !== id);
    dbCache.updatedAt = new Date().toISOString();
    saveToLocalStorage(dbCache);

    try {
      await fetch(`/api/contents/${id}`, { method: 'DELETE' });
    } catch (e) {}

    return true;
  }

  /**
   * Import entire DB JSON
   */
  function importDB(jsonData) {
    if (jsonData && Array.isArray(jsonData.contents)) {
      dbCache = jsonData;
      saveToLocalStorage(dbCache);
      return true;
    }
    return false;
  }

  /**
   * Export JSON Blob for download
   */
  function exportDB() {
    return JSON.stringify(dbCache || defaultDB, null, 2);
  }

  return {
    loadDB,
    getAllContents,
    getRecommendations,
    saveContentItem,
    deleteContentItem,
    importDB,
    exportDB
  };
})();

window.ContentDB = ContentDB;
