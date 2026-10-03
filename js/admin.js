/**
 * LISTEN - Admin Dashboard Controller Module
 */

const AdminController = (function() {
  let isAuthenticated = false;
  let allContents = [];
  let editingId = null;

  const DEFAULT_PIN = "1234";

  async function init() {
    checkAuth();
  }

  function checkAuth() {
    const authStatus = sessionStorage.getItem('listen_admin_authenticated');
    if (authStatus === 'true') {
      isAuthenticated = true;
      document.getElementById('admin-auth-overlay')?.classList.add('hidden');
      loadAdminData();
    } else {
      document.getElementById('admin-auth-overlay')?.classList.remove('hidden');
    }
  }

  function verifyPin() {
    const inputPin = document.getElementById('admin-pin-input')?.value;
    if (inputPin === DEFAULT_PIN) {
      isAuthenticated = true;
      sessionStorage.setItem('listen_admin_authenticated', 'true');
      document.getElementById('admin-auth-overlay').classList.add('hidden');
      loadAdminData();
    } else {
      alert('비밀번호가 올바르지 않습니다. (기본 비밀번호: 1234)');
    }
  }

  async function loadAdminData() {
    allContents = await ContentDB.getAllContents(true);
    renderTable();
  }

  function renderTable() {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;

    const filterCategory = document.getElementById('filter-category')?.value || 'all';
    const filterType = document.getElementById('filter-type')?.value || 'all';
    const searchQuery = document.getElementById('filter-search')?.value.toLowerCase() || '';

    const filtered = allContents.filter(item => {
      if (filterCategory !== 'all' && item.category !== filterCategory) return false;
      if (filterType !== 'all') {
        const typeNum = parseInt(filterType, 10);
        if (!item.targetEnneagram?.primaryTypes?.includes(typeNum)) return false;
      }
      if (searchQuery) {
        const matchesTitle = item.title?.toLowerCase().includes(searchQuery);
        const matchesSummary = item.summary?.toLowerCase().includes(searchQuery);
        const matchesTag = item.tags?.some(t => t.toLowerCase().includes(searchQuery));
        if (!matchesTitle && !matchesSummary && !matchesTag) return false;
      }
      return true;
    });

    tbody.innerHTML = filtered.map(item => `
      <tr class="${item.isActive === false ? 'inactive-row' : ''}">
        <td>
          <img src="${item.thumbnailUrl || 'images/default_thumb.jpg'}" class="table-thumb" alt="${item.title}"/>
        </td>
        <td>
          <div class="item-title">${item.title}</div>
          <div class="item-url"><a href="${item.url}" target="_blank">${item.url}</a></div>
        </td>
        <td><span class="badge ${item.category}">${getCategoryLabel(item.category)}</span></td>
        <td>
          <div class="type-chips">
            ${(item.targetEnneagram?.wings || []).map(w => `<span class="wing-chip">${w}</span>`).join(' ')}
          </div>
        </td>
        <td>
          <label class="switch">
            <input type="checkbox" ${item.isActive !== false ? 'checked' : ''} onchange="AdminController.toggleActive('${item.id}', this.checked)">
            <span class="slider round"></span>
          </label>
        </td>
        <td>
          <div class="action-btns">
            <button class="btn-sm btn-edit" onclick="AdminController.openEditModal('${item.id}')">수정</button>
            <button class="btn-sm btn-delete" onclick="AdminController.deleteItem('${item.id}')">삭제</button>
          </div>
        </td>
      </tr>
    `).join('');

    document.getElementById('total-count').textContent = filtered.length;
  }

  async function toggleActive(id, isActive) {
    const item = allContents.find(c => c.id === id);
    if (item) {
      item.isActive = isActive;
      await ContentDB.saveContentItem(item);
      renderTable();
    }
  }

  function openCreateModal() {
    editingId = null;
    document.getElementById('modal-title').textContent = "새 컨텐츠 메타데이터 추가";
    document.getElementById('form-id').value = "";
    document.getElementById('form-title').value = "";
    document.getElementById('form-category').value = "music";
    document.getElementById('form-url').value = "";
    document.getElementById('form-thumb').value = "";
    document.getElementById('form-summary').value = "";
    document.getElementById('form-verse').value = "";
    document.getElementById('form-tags').value = "";
    document.getElementById('form-states').value = "";
    document.getElementById('form-active').checked = true;

    // Clear Enneagram checkboxes
    document.querySelectorAll('.enneagram-checkbox').forEach(cb => cb.checked = false);

    updateLivePreview();
    document.getElementById('edit-modal').classList.remove('hidden');
  }

  function openEditModal(id) {
    editingId = id;
    const item = allContents.find(c => c.id === id);
    if (!item) return;

    document.getElementById('modal-title').textContent = "컨텐츠 메타데이터 수정";
    document.getElementById('form-id').value = item.id;
    document.getElementById('form-title').value = item.title || "";
    document.getElementById('form-category').value = item.category || "music";
    document.getElementById('form-url').value = item.url || "";
    document.getElementById('form-thumb').value = item.thumbnailUrl || "";
    document.getElementById('form-summary').value = item.summary || "";
    document.getElementById('form-verse').value = item.bibleVerse || "";
    document.getElementById('form-tags').value = (item.tags || []).join(', ');
    document.getElementById('form-states').value = (item.recommendedState || []).join(', ');
    document.getElementById('form-active').checked = item.isActive !== false;

    // Check Enneagram type checkboxes
    const targetWings = item.targetEnneagram?.wings || [];
    document.querySelectorAll('.enneagram-checkbox').forEach(cb => {
      cb.checked = targetWings.includes(cb.value);
    });

    updateLivePreview();
    document.getElementById('edit-modal').classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('edit-modal').classList.add('hidden');
  }

  /**
   * Auto-parse YouTube URL for Thumbnail
   */
  function handleUrlInput(url) {
    if (!url) return;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      const videoId = match[2];
      const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      document.getElementById('form-thumb').value = thumbUrl;
    }
    updateLivePreview();
  }

  /**
   * Live Preview of card
   */
  function updateLivePreview() {
    const title = document.getElementById('form-title')?.value || "컨텐츠 제목 미리보기";
    const category = document.getElementById('form-category')?.value || "music";
    const thumb = document.getElementById('form-thumb')?.value || "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop";
    const summary = document.getElementById('form-summary')?.value || "컨텐츠 요약 설명이 이곳에 표시됩니다.";
    const verse = document.getElementById('form-verse')?.value || "수고하고 짐 진 자들아 다 내게로 오라 (마 11:28)";
    const tags = (document.getElementById('form-tags')?.value || "평안, 은혜").split(',').map(t => t.trim()).filter(Boolean);

    const previewContainer = document.getElementById('live-preview-card');
    if (!previewContainer) return;

    previewContainer.innerHTML = `
      <div class="content-card">
        <div class="card-thumb" style="background-image: url('${thumb}')">
          <span class="badge ${category}">${getCategoryLabel(category)}</span>
        </div>
        <div class="card-body">
          <h4 class="card-title">${title}</h4>
          <p class="card-summary">${summary}</p>
          <div class="card-verse">📖 ${verse}</div>
          <div class="card-tags">
            ${tags.map(t => `<span class="tag">#${t}</span>`).join('')}
          </div>
          <div class="card-btn"><span>미리보기</span> ↗</div>
        </div>
      </div>
    `;
  }

  /**
   * Save Item Form
   */
  async function saveItemForm(event) {
    if (event) event.preventDefault();

    const selectedWings = Array.from(document.querySelectorAll('.enneagram-checkbox:checked')).map(cb => cb.value);
    
    // Primary types extracted from wings
    const primaryTypes = Array.from(new Set(selectedWings.map(w => parseInt(w.match(/^(\d+)/)[1], 10))));

    const itemData = {
      id: document.getElementById('form-id').value || ('content_' + Date.now()),
      title: document.getElementById('form-title').value,
      category: document.getElementById('form-category').value,
      contentType: document.getElementById('form-category').value,
      url: document.getElementById('form-url').value,
      thumbnailUrl: document.getElementById('form-thumb').value,
      summary: document.getElementById('form-summary').value,
      bibleVerse: document.getElementById('form-verse').value,
      targetEnneagram: {
        primaryTypes: primaryTypes.length > 0 ? primaryTypes : [1],
        wings: selectedWings.length > 0 ? selectedWings : ["1w9"]
      },
      tags: document.getElementById('form-tags').value.split(',').map(t => t.trim()).filter(Boolean),
      recommendedState: document.getElementById('form-states').value.split(',').map(s => s.trim()).filter(Boolean),
      isActive: document.getElementById('form-active').checked
    };

    await ContentDB.saveContentItem(itemData);
    closeModal();
    await loadAdminData();
    alert('성공적으로 저장되었습니다!');
  }

  async function deleteItem(id) {
    if (confirm('정말로 이 메타데이터를 삭제하시겠습니까?')) {
      await ContentDB.deleteContentItem(id);
      await loadAdminData();
    }
  }

  function exportJSON() {
    const jsonStr = ContentDB.exportDB();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contents_db_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function triggerImportJSON() {
    document.getElementById('import-file-input').click();
  }

  function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        const parsed = JSON.parse(e.target.result);
        if (ContentDB.importDB(parsed)) {
          alert('메타데이터 DB가 성공적으로 동기화되었습니다!');
          await loadAdminData();
        } else {
          alert('유효하지 않은 JSON 데이터 포맷입니다.');
        }
      } catch (err) {
        alert('JSON 파일 파싱 실패: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function getCategoryLabel(cat) {
    const map = {
      music: '🎵 찬양/CCM',
      video: '🎬 설교/영상',
      article: '📝 영성칼럼',
      book: '📚 묵상집',
      podcast: '🎙️ 팟캐스트'
    };
    return map[cat] || '✨ 묵상';
  }

  return {
    init,
    verifyPin,
    renderTable,
    openCreateModal,
    openEditModal,
    closeModal,
    handleUrlInput,
    updateLivePreview,
    saveItemForm,
    deleteItem,
    toggleActive,
    exportJSON,
    triggerImportJSON,
    handleImportFile
  };
})();

window.AdminController = AdminController;
