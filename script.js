// Supabase client
const SUPABASE_URL = 'https://dpamfspimthzevqmnspe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYW1mc3BpbXRoemV2cW1uc3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjg4NTUsImV4cCI6MjA3MjY0NDg1NX0.i6710Ugj_g6KjXoukeuLXm4TWmUaijRaTRB-BbbqYQ';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elemanları
const productsEl = document.getElementById('productsContainer');
const productSearch = document.getElementById('productSearch');
const filterLinks = document.querySelectorAll('.list-group-item[data-category]');

let allProducts = [];
let currentCat = new URLSearchParams(window.location.search).get('category') || 'all';

// Sidebar aktif class
function updateSidebarActive(cat) {
  filterLinks.forEach(l => l.classList.toggle('active', l.dataset.category === cat));
}

// Ürün kartı
function productCard(p) {
  const imgUrl = p.image_path
    ? supabase.storage.from('product-images').getPublicUrl(p.image_path).data.publicUrl || 'placeholder.jpg'
    : 'placeholder.jpg';

  return `
    <div class="col-md-6 col-lg-4 product-card" data-category="${p.category}">
      <div class="card h-100">
        <img src="${imgUrl}" class="card-img-top" alt="${p.name}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${p.name}</h5>
          <p class="card-text">${(p.description || '').slice(0,120)}${(p.description||'').length>120?'…':''}</p>
          <a href="urun.html?slug=${encodeURIComponent(p.slug)}" class="btn btn-gradient mt-auto">Detay</a>
        </div>
      </div>
    </div>
  `;
}

// Ürünleri yükleme
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

  allProducts = data || [];
  renderProducts(allProducts);
}

// Ürünleri render
function renderProducts(list) {
  if (!list || list.length === 0) {
    productsEl.innerHTML = `<div class="alert alert-warning">Ürün bulunamadı.</div>`;
    return;
  }
  productsEl.innerHTML = list.map(productCard).join('');
}

// Sidebar tıklamaları
filterLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const selectedCat = link.dataset.category;
    currentCat = selectedCat;
    updateSidebarActive(selectedCat);
    loadProducts(selectedCat);
    window.history.replaceState({}, '', `?category=${selectedCat}`);
    productSearch.value = '';
  });
});

// Arama inputu
productSearch.addEventListener('input', e => {
  const keyword = e.target.value.toLowerCase();
  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(keyword) ||
    (p.description || '').toLowerCase().includes(keyword)
  );
  renderProducts(filtered);
});

// İlk yükleme
updateSidebarActive(currentCat);
loadProducts(currentCat);
