/*
 * 山丘茶舖 POS 點餐系統
 * 資料放在陣列裡，畫面一律依照陣列重畫，所以不用重新整理網頁。
 */

// 菜單是固定資料：陣列中的每個物件代表一種飲料。
const menu = [
	{ id: 1, name: "珍珠奶茶", price: 55, category: "奶茶" },
	{ id: 2, name: "鮮奶茶", price: 60, category: "奶茶" },
	{ id: 3, name: "烏龍奶茶", price: 55, category: "奶茶" },
	{ id: 4, name: "四季春茶", price: 35, category: "純茶" },
	{ id: 5, name: "高山青茶", price: 40, category: "純茶" },
	{ id: 6, name: "蜜香紅茶", price: 40, category: "純茶" },
	{ id: 7, name: "檸檬紅茶", price: 45, category: "特調" },
	{ id: 8, name: "芒果綠茶", price: 65, category: "特調" }
];

const categories = ["全部", "奶茶", "純茶", "特調"];

// 訂單一開始是空陣列。每一筆長得像 { id, name, price, qty }。
let order = [];
let keyword = "";
let currentCategory = "全部";
let nextCustomId = 100;

const menuListEl = document.querySelector("#menu-list");
const orderListEl = document.querySelector("#order-list");
const totalPriceEl = document.querySelector("#total-price");
const itemCountEl = document.querySelector("#item-count");
const clearBtn = document.querySelector("#clear-btn");
const searchInput = document.querySelector("#search-input");
const categoryBar = document.querySelector("#category-bar");
const messageEl = document.querySelector("#message");
const customForm = document.querySelector("#custom-form");
const customNameInput = document.querySelector("#custom-name");
const customPriceInput = document.querySelector("#custom-price");

// 把提示文字顯示在畫面上，避免只靠 alert，使用者也看得到原因。
function showMessage(text) {
	messageEl.textContent = text;
	if (text) {
		messageEl.classList.add("show");
	} else {
		messageEl.classList.remove("show");
	}
}

// 依照目前的分類與關鍵字，從菜單陣列篩出要顯示的飲料。
function getVisibleMenu() {
	return menu.filter(function (drink) {
		const sameCategory = currentCategory === "全部" || drink.category === currentCategory;
		const nameHit = drink.name.includes(keyword);
		return sameCategory && nameHit;
	});
}

// 畫出分類按鈕。被選中的分類會加上 active。
function renderCategories() {
	categoryBar.innerHTML = "";
	categories.forEach(function (name) {
		const button = document.createElement("button");
		button.type = "button";
		button.textContent = name;
		button.dataset.category = name;
		if (name === currentCategory) {
			button.classList.add("active");
		}
		categoryBar.append(button);
	});
}

// 依照篩選後的菜單陣列，重新產生左側飲料列表。
function renderMenu() {
	menuListEl.innerHTML = "";
	const visible = getVisibleMenu();

	if (visible.length === 0) {
		const empty = document.createElement("p");
		empty.className = "empty";
		empty.textContent = "目前沒有符合的飲料";
		menuListEl.append(empty);
		return;
	}

	visible.forEach(function (drink) {
		const row = document.createElement("div");
		row.className = "item";

		const info = document.createElement("div");
		const name = document.createElement("p");
		name.className = "name";
		name.textContent = drink.name;
		const meta = document.createElement("p");
		meta.className = "meta";
		meta.textContent = drink.category + " · " + drink.price + " 元";
		info.append(name, meta);

		const button = document.createElement("button");
		button.type = "button";
		button.className = "add-btn";
		button.dataset.id = String(drink.id);
		button.textContent = "點餐";

		row.append(info, button);
		menuListEl.append(row);
	});
}

// 訂單改完後呼叫這個函式，右側清單與總金額會立刻跟著更新。
function renderOrder() {
	orderListEl.innerHTML = "";

	if (order.length === 0) {
		const empty = document.createElement("p");
		empty.className = "empty";
		empty.textContent = "目前沒有資料";
		orderListEl.append(empty);
	} else {
		order.forEach(function (item) {
			const row = document.createElement("div");
			row.className = "item";

			const info = document.createElement("div");
			const name = document.createElement("p");
			name.className = "name";
			name.textContent = item.name;
			const meta = document.createElement("p");
			meta.className = "meta";
			meta.textContent = item.price + " 元 × " + item.qty + " = " + item.price * item.qty + " 元";
			info.append(name, meta);

			const controls = document.createElement("div");
			controls.className = "qty-box";

			const minus = document.createElement("button");
			minus.type = "button";
			minus.dataset.action = "minus";
			minus.dataset.id = String(item.id);
			minus.textContent = "−";

			const qty = document.createElement("span");
			qty.textContent = String(item.qty);

			const plus = document.createElement("button");
			plus.type = "button";
			plus.dataset.action = "add";
			plus.dataset.id = String(item.id);
			plus.textContent = "+";

			const remove = document.createElement("button");
			remove.type = "button";
			remove.className = "delete-btn";
			remove.dataset.action = "delete";
			remove.dataset.id = String(item.id);
			remove.textContent = "刪除";

			controls.append(minus, qty, plus, remove);
			row.append(info, controls);
			orderListEl.append(row);
		});
	}

	calculateTotal();
}

// 用 reduce 把每一項的單價乘上數量加總，再寫回畫面上的總金額。
function calculateTotal() {
	const total = order.reduce(function (sum, item) {
		return sum + item.price * item.qty;
	}, 0);
	totalPriceEl.textContent = String(total);
	itemCountEl.textContent = String(order.length);
}

// 把品項放進訂單。同一種飲料已經存在時只把數量加 1，不新增重複的一列。
function addItem(item) {
	const existing = order.find(function (row) {
		return row.id === item.id;
	});

	if (existing) {
		existing.qty += 1;
		showMessage("「" + item.name + "」已經在訂單裡，數量已加 1。");
	} else {
		order.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
		showMessage("已加入「" + item.name + "」。");
	}

	renderOrder();
}

// 點左側「點餐」時，用 data-id 找出是哪一杯，再加入訂單。
function addToOrder(event) {
	const button = event.target.closest(".add-btn");
	if (!button) return;

	const drinkId = Number(button.dataset.id);
	const drink = menu.find(function (item) {
		return item.id === drinkId;
	});
	if (!drink) return;

	addItem(drink);
}

// 點右側的加、減、刪除。數量不允許變成 0 或負數，刪除前要先確認。
function handleOrderAction(event) {
	const button = event.target.closest("button[data-action]");
	if (!button) return;

	const action = button.dataset.action;
	const drinkId = Number(button.dataset.id);
	const index = order.findIndex(function (item) {
		return item.id === drinkId;
	});
	if (index === -1) return;

	if (action === "add") {
		order[index].qty += 1;
		showMessage("");
	} else if (action === "minus") {
		// 數量最少是 1。再減就會變成 0 或負數，所以改成提示，不直接改資料。
		if (order[index].qty <= 1) {
			showMessage("數量不能小於 1。若要拿掉這個品項，請按刪除。");
			return;
		}
		order[index].qty -= 1;
		showMessage("");
	} else if (action === "delete") {
		const sure = confirm("確定要刪除「" + order[index].name + "」嗎？刪除後無法復原。");
		if (!sure) return;
		order.splice(index, 1);
		showMessage("已刪除該品項。");
	}

	renderOrder();
}

// 清空前先看訂單是不是空的；有資料才跳出確認視窗。
function clearOrder() {
	if (order.length === 0) {
		showMessage("目前沒有資料可以清空。");
		alert("目前沒有資料可以清空。");
		return;
	}

	const sure = confirm("確定要清空整筆訂單嗎？此操作無法復原。");
	if (!sure) return;

	order = [];
	showMessage("訂單已清空。");
	renderOrder();
}

// 搜尋框每次輸入都會更新關鍵字，並立刻重畫菜單。
function searchMenu(event) {
	keyword = event.target.value.trim();
	renderMenu();
}

// 切換分類也是先改狀態，再依照陣列重畫。
function changeCategory(event) {
	const button = event.target.closest("button[data-category]");
	if (!button) return;
	currentCategory = button.dataset.category;
	renderCategories();
	renderMenu();
}

// 臨時加點要擋掉空白名稱、非整數，以及負數價格。
function addCustomItem(event) {
	event.preventDefault();

	const name = customNameInput.value.trim();
	const rawPrice = customPriceInput.value.trim();

	if (name === "") {
		showMessage("品項名稱不能空白。");
		customNameInput.focus();
		return;
	}

	if (rawPrice === "" || !/^\d+$/.test(rawPrice)) {
		showMessage("價格必須是 0 以上的整數，不能空白、小數或負數。");
		customPriceInput.focus();
		return;
	}

	const price = Number(rawPrice);
	if (price < 0) {
		showMessage("價格不能是負數。");
		return;
	}

	const duplicated = order.find(function (item) {
		return item.name === name;
	});
	if (duplicated) {
		showMessage("訂單裡已經有「" + name + "」，請直接用 + 調整數量，不要重複新增。");
		return;
	}

	order.push({ id: nextCustomId, name: name, price: price, qty: 1 });
	nextCustomId += 1;
	customForm.reset();
	showMessage("已加入臨時品項「" + name + "」。");
	renderOrder();
}

// 頁面載入後抓元素、綁事件，並畫出第一個畫面。
function init() {
	if (!menuListEl || !orderListEl || !totalPriceEl || !clearBtn) {
		console.error("找不到必要的 HTML 元素，請檢查 id 是否被改掉。");
		return;
	}

	renderCategories();
	renderMenu();
	renderOrder();

	// 按鈕是每次重畫時才產生的，所以事件綁在不會被清掉的父元素上。
	menuListEl.addEventListener("click", addToOrder);
	orderListEl.addEventListener("click", handleOrderAction);
	categoryBar.addEventListener("click", changeCategory);
	clearBtn.addEventListener("click", clearOrder);
	searchInput.addEventListener("input", searchMenu);
	customForm.addEventListener("submit", addCustomItem);
}

document.addEventListener("DOMContentLoaded", init);
