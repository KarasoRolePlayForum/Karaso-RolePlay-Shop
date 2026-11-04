const SUPPORT = "https://rubika.ir/Id_Etebarr";

const products = [
  { id: "d50", name: "50 Donate", price: 30, unit: "هزار تومان", category: "donate", desc: "پکیج دونیت برای شروع", symbol: "50" },
  { id: "d100", name: "100 Donate", price: 50, unit: "هزار تومان", category: "donate", desc: "دونیت بیشتر، امکانات بیشتر", symbol: "100" },
  { id: "d300", name: "300 Donate", price: 100, unit: "هزار تومان", category: "donate", desc: "پکیج ویژه بازیکنان", symbol: "300" },
  { id: "d500", name: "500 Donate", price: 150, unit: "هزار تومان", category: "donate", desc: "پکیج دونیت حرفه‌ای", symbol: "500" },

  { id: "m500", name: "500K", price: 20, unit: "هزار تومان", category: "money", desc: "دارایی داخل بازی", symbol: "500K" },
  { id: "m1", name: "1KK", price: 30, unit: "هزار تومان", category: "money", desc: "دارایی برای پیشرفت", symbol: "1KK" },
  { id: "m10", name: "10KK", price: 80, unit: "هزار تومان", category: "money", desc: "پکیج دارایی بیشتر", symbol: "10KK" },
  { id: "m20", name: "20KK", price: 110, unit: "هزار تومان", category: "money", desc: "پکیج ویژه دارایی", symbol: "20KK" },
  { id: "m30", name: "30KK", price: 150, unit: "هزار تومان", category: "money", desc: "پکیج برتر دارایی", symbol: "30KK" }
];

const vehicles = [
  { id: "v-mercedes", name: "Mercedes-Benz 320", price: 320000, category: "car", desc: "سدان کلاسیک و خوش‌استایل", image: "./images/mercedes-320.jpg" },
  { id: "v-bmw", name: "BMW 330", price: 330000, category: "car", desc: "BMW سری 3 نسل E46", image: "./images/bmw-330.jpg" },
  { id: "v-ninja", name: "Kawasaki Ninja", price: 140000, category: "bike", desc: "موتور اسپرت نینجا", image: "./images/kawasaki-ninja.jpg" },
  { id: "v-125", name: "125 Motorcycle", price: 80000, category: "bike", desc: "موتورسیکلت شهری 125", image: "./images/motorcycle-125.jpg" },
  { id: "v-ferrari", name: "Ferrari VIP", price: 300000, category: "vip", desc: "سوپر اسپرت ویژه VIP", image: "./images/ferrari-vip.jpg" },
  { id: "v-camper", name: "Mercedes-Benz Camper", price: 70000, category: "car", desc: "ون مناسب سفر و کار", image: "./images/camper.jpg" },
  { id: "v-rancher", name: "Rancher", price: 250000, category: "car", desc: "خودروی آفرود", image: "./images/rancher.jpg" },
  { id: "v-audi", name: "Audi", price: 220000, category: "car", desc: "سدان لوکس آلمانی", image: "./images/audi.jpg" },
  { id: "v-fcr", name: "FCR-900", price: 90000, category: "bike", desc: "موتور اسپرت قدرتمند", image: "./images/fcr-900.jpg" },
  { id: "v-sadler", name: "Sadler", price: 180000, category: "car", desc: "پیکاپ کاربردی", image: "./images/sadler.jpg" }
];

const sb = window.supabase.createClient(
  window.KARASO_SUPABASE_URL,
  window.KARASO_SUPABASE_PUBLISHABLE_KEY,
  window.KARASO_SUPABASE_AUTH_OPTIONS || {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    }
  }
);

let selected = null;
let authMode = "login";
let currentSession = null;

const $ = selector => document.querySelector(selector);

const fmt = number =>
  Number(number).toLocaleString("en-US");

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function getUnit(product) {
  if (product.unit) return product.unit;

  if (["car", "bike", "vip"].includes(product.category)) {
    return "تومان";
  }

  return "هزار تومان";
}

function card(product, vehicle = false) {
  const image = vehicle
    ? `<img src="${escapeHTML(product.image)}"
         alt="${escapeHTML(product.name)}"
         loading="lazy"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <span class="placeholder image-fallback" style="display:none">PHOTO</span>`
    : `<span class="placeholder">${escapeHTML(product.symbol)}</span>`;

  return `
    <article class="item">
      <div class="item-art">
        ${image}
      </div>

      <div class="item-body">
        <h3>${escapeHTML(product.name)}</h3>
        <p>${escapeHTML(product.desc)}</p>

        <div class="price">
          ${fmt(product.price)}
          <small>${escapeHTML(getUnit(product))}</small>
        </div>

        <button class="buy" data-id="${escapeHTML(product.id)}" type="button">
          درخواست خرید ←
        </button>
      </div>
    </article>
  `;
}

function renderProducts(filter = "all") {
  const container = $("#products");
  if (!container) return;

  container.innerHTML = products
    .filter(product => filter === "all" || product.category === filter)
    .map(product => card(product))
    .join("");

  container.querySelectorAll(".buy").forEach(button => {
    button.addEventListener("click", () => {
      const product = products.find(item => item.id === button.dataset.id);
      if (product) openOrder(product);
    });
  });
}

function renderVehicles(filter = "all") {
  const container = $("#vehiclesGrid");
  if (!container) return;

  container.innerHTML = vehicles
    .filter(product =>
      filter === "all" ||
      product.category === filter ||
      (filter === "car" && product.category === "vip")
    )
    .map(product => card(product, true))
    .join("");

  container.querySelectorAll(".buy").forEach(button => {
    button.addEventListener("click", () => {
      const vehicle = vehicles.find(item => item.id === button.dataset.id);
      if (vehicle) openOrder(vehicle);
    });
  });
}

function bindTabs(id, callback) {
  const container = document.getElementById(id);
  if (!container) return;

  container.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      container.querySelectorAll("button").forEach(item => {
        item.classList.remove("active");
      });

      button.classList.add("active");
      callback(button.dataset.filter || "all");
    });
  });
}

async function updateAuth(session) {
  currentSession = session || null;

  const user = currentSession?.user;

  const authState = $("#authState");
  const authOpen = $("#authOpen");
  const authLogout = $("#authLogout");
  const adminLink = $("#adminLink");

  if (authState) {
    authState.textContent = user
      ? `وارد شده: ${user.email || "کاربر"}`
      : "برای ثبت سفارش وارد حساب شو";
  }

  authOpen?.classList.toggle("hidden", Boolean(user));
  authLogout?.classList.toggle("hidden", !user);

  if (adminLink) {
    adminLink.classList.add("hidden");
  }

  if (!user || !adminLink) return;

  try {
    const { data, error } = await sb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Role lookup error:", error.message);
      return;
    }

    const role = String(data?.role || "").toLowerCase();

    if (role === "owner" || role === "admin") {
      adminLink.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Admin access check failed:", error);
  }
}

function openOrder(product) {
  selected = product;

  $("#selectedProduct").textContent =
    `${product.name} — ${fmt(product.price)} ${getUnit(product)}`;

  $("#orderForm").reset();
  $("#formError").textContent = "";

  if (!currentSession) {
    $("#orderOverlay").classList.remove("show");
    openAuth();
    $("#authError").textContent =
      "برای ثبت سفارش ابتدا وارد حساب کاربری شو.";
    return;
  }

  $("#orderOverlay").classList.add("show");
}

function openAuth() {
  authMode = "login";

  $("#authTitle").textContent = "ورود به حساب";
  $("#authSubmit").textContent = "ورود";
  $("#authToggle").textContent = "حساب ندارم؛ ثبت‌نام";
  $("#authError").textContent = "";

  $("#authOverlay").classList.add("show");
}

$("#authOpen")?.addEventListener("click", openAuth);

$("#authClose")?.addEventListener("click", () => {
  $("#authOverlay").classList.remove("show");
});

$("#authToggle")?.addEventListener("click", () => {
  authMode = authMode === "login" ? "signup" : "login";

  $("#authTitle").textContent =
    authMode === "login" ? "ورود به حساب" : "ساخت حساب جدید";

  $("#authSubmit").textContent =
    authMode === "login" ? "ورود" : "ثبت‌نام";

  $("#authToggle").textContent =
    authMode === "login"
      ? "حساب ندارم؛ ثبت‌نام"
      : "قبلاً حساب ساخته‌ام؛ ورود";

  $("#authError").textContent = "";
});

$("#authForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const button = $("#authSubmit");

  button.disabled = true;
  button.textContent = "در حال بررسی...";
  $("#authError").textContent = "";

  try {
    let result;

    if (authMode === "signup") {
      result = await sb.auth.signUp({
        email,
        password
      });
    } else {
      result = await sb.auth.signInWithPassword({
        email,
        password
      });
    }

    if (result.error) throw result.error;

    if (authMode === "signup" && !result.data.session) {
      $("#authError").textContent =
        "حساب ساخته شد. اگر تأیید ایمیل فعال است، ایمیل خود را تأیید کنید و سپس وارد شوید.";
      return;
    }

    await updateAuth(result.data.session);

    $("#authOverlay").classList.remove("show");

    if (selected) {
      $("#orderOverlay").classList.add("show");
    }
  } catch (error) {
    $("#authError").textContent =
      error.message || "ورود یا ثبت‌نام ناموفق بود.";
  } finally {
    button.disabled = false;
    button.textContent = authMode === "login" ? "ورود" : "ثبت‌نام";
  }
});

$("#authLogout")?.addEventListener("click", async () => {
  const { error } = await sb.auth.signOut();

  if (error) {
    alert("خروج انجام نشد: " + error.message);
    return;
  }

  await updateAuth(null);
});

sb.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("Session error:", error.message);
    return;
  }

  updateAuth(data.session);
});

sb.auth.onAuthStateChange((_event, session) => {
  currentSession = session || null;
  updateAuth(session);
});

if (new URLSearchParams(location.search).get("admin") === "login") {
  setTimeout(openAuth, 250);
}

$("#closeModal")?.addEventListener("click", () => {
  $("#orderOverlay").classList.remove("show");
});

$("#doneBtn")?.addEventListener("click", () => {
  $("#successOverlay").classList.remove("show");
});

$("#orderForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  if (!selected) return;

  if (!currentSession) {
    openAuth();
    return;
  }

  const button = $("#submitOrder");

  button.disabled = true;
  button.textContent = "در حال ثبت سفارش...";
  $("#formError").textContent = "";

  const formData = new FormData(event.currentTarget);

  try {
    const orderNo =
      "KR-" +
      Date.now().toString().slice(-8) +
      "-" +
      Math.random().toString(16).slice(2, 6).toUpperCase();

    const { data, error } = await sb
      .from("orders")
      .insert({
        order_no: orderNo,
        product_id: selected.id,
        product_name: selected.name,
        price: selected.price,
        unit: getUnit(selected),
        game_username: formData.get("gameUsername"),
        contact: formData.get("contact"),
        note: formData.get("note"),
        status: "pending",
        user_id: currentSession.user.id
      })
      .select("order_no")
      .single();

    if (error) throw error;

    $("#orderOverlay").classList.remove("show");

    $("#successText").textContent =
      `شماره سفارش شما: ${data.order_no} — سفارش با موفقیت ثبت شد.`;

    $("#successOverlay").classList.add("show");
  } catch (error) {
    $("#formError").textContent =
      error.message ||
      "ثبت سفارش ناموفق بود. تنظیمات Supabase و RLS را بررسی کنید.";
  } finally {
    button.disabled = false;
    button.textContent = "ثبت سفارش";
  }
});

bindTabs("productTabs", renderProducts);
bindTabs("vehicleTabs", renderVehicles);

renderProducts();
renderVehicles();
