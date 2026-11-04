(() => {
  "use strict";

  const SUPABASE_URL = window.KARASO_SUPABASE_URL;
  const SUPABASE_KEY = window.KARASO_SUPABASE_PUBLISHABLE_KEY;
  const AUTH_OPTIONS = window.KARASO_SUPABASE_AUTH_OPTIONS || {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    }
  };

  if (!window.supabase || !SUPABASE_URL || !SUPABASE_KEY) {
    showError("اتصال Supabase برقرار نیست. فایل supabase-config.js را بررسی کنید.");
    return;
  }

  const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    AUTH_OPTIONS
  );

  const $ = (id) => document.getElementById(id);

  const loginView = $("loginView");
  const dashboard = $("dashboard");
  const loginError = $("loginError");
  const logoutButton = $("logout");
  const refreshButton = $("refresh");
  const ordersContainer = $("orders");
  const searchInput = $("search");
  const statusFilter = $("statusFilter");

  let currentUser = null;
  let currentRole = null;
  let allOrders = [];
  let loading = false;

  const STATUS_LABELS = {
    pending: "در انتظار بررسی",
    approved: "تأیید شده",
    rejected: "رد شده",
    completed: "تکمیل شده"
  };

  const STATUS_CLASSES = {
    pending: "pending",
    approved: "approved",
    rejected: "rejected",
    completed: "completed"
  };

  function showError(message) {
    if (loginError) {
      loginError.textContent = message;
      loginError.style.display = "block";
    }
  }

  function hideError() {
    if (loginError) {
      loginError.textContent = "";
      loginError.style.display = "none";
    }
  }

  function showLogin() {
    loginView?.classList.remove("hidden");
    dashboard?.classList.add("hidden");
    logoutButton?.classList.add("hidden");
  }

  function showDashboard() {
    loginView?.classList.add("hidden");
    dashboard?.classList.remove("hidden");
    logoutButton?.classList.remove("hidden");
  }

  function goToStore() {
    window.location.href = "./index.html";
  }

  function formatPrice(price) {
    const number = Number(price);

    if (!Number.isFinite(number)) {
      return price ?? "—";
    }

    return number.toLocaleString("fa-IR");
  }

  function formatDate(dateValue) {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleString("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return entities[character];
    });
  }

  async function checkAdminAccess() {
    showLogin();
    hideError();

    const {
      data: { session },
      error: sessionError
    } = await db.auth.getSession();

    if (sessionError) {
      showError("خطا در بررسی نشست کاربر: " + sessionError.message);
      return;
    }

    if (!session?.user) {
      showError("ابتدا از صفحه فروشگاه وارد حساب کاربری شوید.");
      setTimeout(goToStore, 1800);
      return;
    }

    currentUser = session.user;

    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (profileError) {
      showError(
        "بررسی سطح دسترسی ناموفق بود. دسترسی جدول profiles و RLS را بررسی کنید. " +
        profileError.message
      );
      return;
    }

    currentRole = String(profile?.role || "").toLowerCase();

    if (!["owner", "admin"].includes(currentRole)) {
      showError("این حساب دسترسی Owner یا Admin ندارد.");
      setTimeout(goToStore, 2500);
      return;
    }

    $("who").textContent =
      `حساب: ${currentUser.email || currentUser.id} | سطح دسترسی: ${currentRole.toUpperCase()}`;

    showDashboard();

    await loadOrders();
  }

  async function loadOrders() {
    if (loading) return;

    loading = true;

    if (refreshButton) {
      refreshButton.disabled = true;
      refreshButton.textContent = "در حال دریافت...";
    }

    if (ordersContainer) {
      ordersContainer.innerHTML = `
        <div class="empty">
          در حال دریافت سفارش‌ها...
        </div>
      `;
    }

    const { data, error } = await db
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    loading = false;

    if (refreshButton) {
      refreshButton.disabled = false;
      refreshButton.textContent = "بروزرسانی";
    }

    if (error) {
      ordersContainer.innerHTML = `
        <div class="error">
          دریافت سفارش‌ها ناموفق بود:<br>
          ${escapeHTML(error.message)}
        </div>
      `;
      return;
    }

    allOrders = data || [];

    updateStats();
    renderOrders();
  }

  function updateStats() {
    const total = allOrders.length;
    const pending = allOrders.filter(
      order => order.status === "pending"
    ).length;

    const approved = allOrders.filter(
      order => order.status === "approved"
    ).length;

    const completed = allOrders.filter(
      order => order.status === "completed"
    ).length;

    $("total").textContent = total.toLocaleString("fa-IR");
    $("pending").textContent = pending.toLocaleString("fa-IR");
    $("approved").textContent = approved.toLocaleString("fa-IR");
    $("done").textContent = completed.toLocaleString("fa-IR");
  }

  function renderOrders() {
    const query = (searchInput?.value || "").trim().toLowerCase();
    const selectedStatus = statusFilter?.value || "all";

    const filteredOrders = allOrders.filter((order) => {
      const matchesStatus =
        selectedStatus === "all" || order.status === selectedStatus;

      const searchableText = [
        order.order_no,
        order.product_name,
        order.game_username,
        order.contact,
        order.note,
        order.user_id,
        order.id
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(query);

      return matchesStatus && matchesSearch;
    });

    if (!filteredOrders.length) {
      ordersContainer.innerHTML = `
        <div class="empty">
          سفارش موردنظری پیدا نشد.
        </div>
      `;
      return;
    }

    ordersContainer.innerHTML = filteredOrders
      .map(renderOrderCard)
      .join("");

    ordersContainer
      .querySelectorAll("[data-order-status]")
      .forEach((select) => {
        select.addEventListener("change", async () => {
          const orderId = select.dataset.orderId;
          const newStatus = select.value;

          await updateOrderStatus(orderId, newStatus);
        });
      });
  }

  function renderOrderCard(order) {
    const status = order.status || "pending";
    const statusLabel = STATUS_LABELS[status] || status;
    const statusClass = STATUS_CLASSES[status] || "pending";

    const orderNumber = order.order_no || order.id || "—";
    const productName = order.product_name || "محصول نامشخص";
    const gameUsername = order.game_username || "—";
    const contact = order.contact || "—";
    const note = order.note || "—";
    const userId = order.user_id || "—";
    const price = formatPrice(order.price);
    const unit = order.unit || "تومان";
    const createdAt = formatDate(order.created_at);

    return `
      <article class="order-card">
        <div class="order-top">
          <div>
            <small>شماره سفارش</small>
            <h3>#${escapeHTML(orderNumber)}</h3>
          </div>

          <span class="status ${escapeHTML(statusClass)}">
            ${escapeHTML(statusLabel)}
          </span>
        </div>

        <div class="order-details">
          <p>
            <strong>محصول:</strong>
            ${escapeHTML(productName)}
          </p>

          <p>
            <strong>قیمت:</strong>
            ${escapeHTML(price)} ${escapeHTML(unit)}
          </p>

          <p>
            <strong>نام کاربری بازی:</strong>
            ${escapeHTML(gameUsername)}
          </p>

          <p>
            <strong>راه ارتباطی:</strong>
            ${escapeHTML(contact)}
          </p>

          <p>
            <strong>یادداشت:</strong>
            ${escapeHTML(note)}
          </p>

          <p>
            <strong>شناسه کاربر:</strong>
            ${escapeHTML(userId)}
          </p>

          <p>
            <strong>تاریخ ثبت:</strong>
            ${escapeHTML(createdAt)}
          </p>
        </div>

        <div class="order-actions">
          <label>
            وضعیت سفارش:
            <select
              data-order-status
              data-order-id="${escapeHTML(order.id)}"
            >
              <option value="pending" ${status === "pending" ? "selected" : ""}>
                در انتظار بررسی
              </option>

              <option value="approved" ${status === "approved" ? "selected" : ""}>
                تأیید شده
              </option>

              <option value="rejected" ${status === "rejected" ? "selected" : ""}>
                رد شده
              </option>

              <option value="completed" ${status === "completed" ? "selected" : ""}>
                تکمیل شده
              </option>
            </select>
          </label>
        </div>
      </article>
    `;
  }

  async function updateOrderStatus(orderId, newStatus) {
    const allowedStatuses = [
      "pending",
      "approved",
      "rejected",
      "completed"
    ];

    if (!allowedStatuses.includes(newStatus)) {
      alert("وضعیت انتخاب‌شده معتبر نیست.");
      return;
    }

    if (!["owner", "admin"].includes(currentRole)) {
      alert("شما اجازه تغییر سفارش را ندارید.");
      return;
    }

    const confirmed = confirm(
      `وضعیت سفارش به «${STATUS_LABELS[newStatus]}» تغییر کند؟`
    );

    if (!confirmed) {
      renderOrders();
      return;
    }

    const { error } = await db
      .from("orders")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (error) {
      alert("تغییر وضعیت ناموفق بود:\n" + error.message);
      renderOrders();
      return;
    }

    const order = allOrders.find(
      item => String(item.id) === String(orderId)
    );

    if (order) {
      order.status = newStatus;
      order.updated_at = new Date().toISOString();
    }

    updateStats();
    renderOrders();

    alert("وضعیت سفارش با موفقیت تغییر کرد.");
  }

  refreshButton?.addEventListener("click", loadOrders);

  searchInput?.addEventListener("input", renderOrders);

  statusFilter?.addEventListener("change", renderOrders);

  logoutButton?.addEventListener("click", () => {
    // فقط به فروشگاه برمی‌گردد؛ نشست Supabase را حذف نمی‌کند.
    goToStore();
  });

  db.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT" || !session) {
      goToStore();
    }
  });

  checkAdminAccess();
})();
