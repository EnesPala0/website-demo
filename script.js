document.addEventListener('DOMContentLoaded', function () {
  // Sadece geniş ekranlarda hover ile dropdown açma
  if (!window.matchMedia('(min-width: 992px)').matches) return;

  document.querySelectorAll('.navbar .dropdown').forEach(function (dropdownEl) {
    const toggle = dropdownEl.querySelector('.dropdown-toggle');
    const bsDropdown = new bootstrap.Dropdown(toggle);

    dropdownEl.addEventListener('mouseenter', function () {
      bsDropdown.show();
    });
    dropdownEl.addEventListener('mouseleave', function () {
      bsDropdown.hide();
    });
  });
});

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://dpamfspimthzevqmnspe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYW1mc3BpbXRoemV2cW1uc3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjg4NTUsImV4cCI6MjA3MjY0NDg1NX0.i6710Ugj_g6KjXoukeuLXm4TWmUaijRaTRB-BbbqYQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const productsEl = document.getElementById('productsContainer');
const filterLinks = document.querySelectorAll('.list-group-item[data-category]');

// URL parametresini oku
const params = new URLSearchParams(window.location.search);
let currentCat = params.get('category') || 'all';

// Sidebar aktif class
function updateSidebarActive(cat) {
  filterLinks.forEach(l => {
    l.classList.toggle('active', l.dataset.category === cat);
  });
}

// Ürün kartı HTML
function productCard(p) {
  const imgUrl = p.image_path
    ? supabase.storage.from('product-images').getPublicUrl(p.image_path)?.data?.publicUrl || 'placeholder.jpg'
    : 'placeholder.jpg';

  return `
    <div class="product-card mb-4" data-category="${p.category}">
      <a href="urun.html?slug=${encodeURIComponent(p.slug)}" class="stretched-link">
        <div class="card h-100 position-relative">
          <img src="${imgUrl}" class="card-img-top" alt="${p.name}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${p.name}</h5>
            <p class="card-text">${(p.description || '').slice(0, 120)}${(p.description || '').length > 120 ? '…' : ''}</p>
            <span class="btn btn-gradient mt-auto w-100 text-center">Detay</span>
          </div>
        </div>
      </a>
    </div>
  `;
}



// Ürünleri yükleme fonksiyonu
async function loadProducts(category = currentCat) {
  let q = supabase
    .from('products')
    .select('id,name,slug,category,image_path,description,order_index')
    .order('order_index', { ascending: true })
    .order('name', { ascending: true });

  if (category && category !== 'all') q = q.eq('category', category);

  const { data, error } = await q;
  if (error) {
    console.error(error);
    productsEl.innerHTML = `<div class="alert alert-danger">Ürünler yüklenemedi.</div>`;
    return;
  }

  if (!data || data.length === 0) {
    productsEl.innerHTML = `<div class="alert alert-warning">Bu kategoride ürün yok.</div>`;
    return;
  }

  productsEl.innerHTML = data.map(productCard).join('');
}

// Sidebar tıklamaları
filterLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const selectedCat = link.dataset.category;
    currentCat = selectedCat;
    updateSidebarActive(selectedCat);
    loadProducts(selectedCat);
    // URL’i güncelle (isteğe bağlı, tarayıcıyı yenilemeden)
    window.history.replaceState({}, '', `?category=${selectedCat}`);
  });
});

// Sayfa açıldığında ürünleri yükle
updateSidebarActive(currentCat);
loadProducts(currentCat);

document.querySelectorAll('.navbar .dropdown').forEach(dropdown => {
  dropdown.addEventListener('mouseenter', () => {
    const menu = dropdown.querySelector('.dropdown-menu');
    const bsDropdown = bootstrap.Dropdown.getOrCreateInstance(dropdown.querySelector('.dropdown-toggle'));
    bsDropdown.show();
  });
  dropdown.addEventListener('mouseleave', () => {
    const menu = dropdown.querySelector('.dropdown-menu');
    const bsDropdown = bootstrap.Dropdown.getOrCreateInstance(dropdown.querySelector('.dropdown-toggle'));
    bsDropdown.hide();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  if(document.body.classList.contains('products-page')){
    document.querySelectorAll('.btn-gradient').forEach(btn => {
      btn.style.transition = 'none';
      btn.style.transform = 'none';
    });
  }
});
