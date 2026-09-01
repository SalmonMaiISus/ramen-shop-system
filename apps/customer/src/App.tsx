import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingCart, UtensilsCrossed } from "lucide-react";
import { api } from "./api/client";
import { useTheme } from "./hooks/useTheme";
import { ThemeToggle } from "./components/ThemeToggle";
import { ProductCard } from "./components/ProductCard";
import { OrderOptionsModal } from "./components/OrderOptionsModal";
import { CartDrawer } from "./components/CartDrawer";
import { MyOrders } from "./components/MyOrders";
import type { MenuItem, CartItem } from "./type";

function useQueryParam(key: string): string | null {
  return useMemo(() => new URLSearchParams(window.location.search).get(key), [key]);
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const qrToken = useQueryParam("token");

  const [sessionToken, setSessionToken] = useState<string | null>(localStorage.getItem("sessionToken"));
  const [tableNumber, setTableNumber] = useState<string | null>(localStorage.getItem("tableNumber"));
  const [scanError, setScanError] = useState("");

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("ทั้งหมด");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectingItem, setSelectingItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<"menu" | "orders">("menu");

  // Scan QR from URL on first load
  useEffect(() => {
    if (sessionToken) return;
    if (!qrToken) {
      setScanError("ไม่พบข้อมูลโต๊ะ กรุณาสแกน QR ที่โต๊ะของคุณอีกครั้ง");
      return;
    }
    api
      .post("/sessions/scan", { qrCodeToken: qrToken })
      .then((res) => {
        const { sessionToken: st, tableNumber: tn } = res.data.data;
        localStorage.setItem("sessionToken", st);
        localStorage.setItem("tableNumber", tn);
        setSessionToken(st);
        setTableNumber(tn);
      })
      .catch(() => setScanError("QR ไม่ถูกต้องหรือหมดอายุ กรุณาลองสแกนใหม่"));
  }, [qrToken, sessionToken]);

  useEffect(() => {
    api.get("/menu").then((res) => setMenu(res.data.data ?? []));
  }, []);

  const categories = useMemo(() => {
    const names = Array.from(new Set(menu.map((m) => m.category.name)));
    return ["ทั้งหมด", ...names];
  }, [menu]);

  const filteredItems = menu.filter((item) => {
    const matchCategory = activeCategory === "ทั้งหมด" || item.category.name === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  function handleAdd(item: MenuItem) {
    if (item.optionGroups.length > 0) {
      setSelectingItem(item);
      return;
    }
    addToCart(item, [], "", "");
  }

  function addToCart(item: MenuItem, optionIds: number[], optionsLabel: string, notes: string) {
    const extraPrice = item.optionGroups
      .flatMap((g) => g.options)
      .filter((o) => optionIds.includes(o.id))
      .reduce((sum, o) => sum + Number(o.extraPrice), 0);

    const key = `${item.id}-${optionIds.sort().join(",")}-${notes}`;
    setCart((prev) => {
      const existing = prev.find((c) => c.key === key);
      if (existing) {
        return prev.map((c) => (c.key === key ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [
        ...prev,
        {
          key,
          menuItemId: item.id,
          name: item.name,
          unitPrice: Number(item.basePrice) + extraPrice,
          quantity: 1,
          selectedOptionIds: optionIds,
          optionsLabel,
          specialNotes: notes || undefined,
        },
      ];
    });
    setSelectingItem(null);
  }

  function updateQty(key: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => (c.key === key ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  }

  function removeItem(key: string) {
    setCart((prev) => prev.filter((c) => c.key !== key));
  }

  async function handleSubmitOrder() {
    setSubmitting(true);
    try {
      await api.post("/me/order-items", {
        items: cart.map((c) => ({
          menuItemId: c.menuItemId,
          quantity: c.quantity,
          selectedOptionIds: c.selectedOptionIds,
          specialNotes: c.specialNotes,
        })),
      });
      setCart([]);
      setCartOpen(false);
      setTab("orders");
    } catch {
      alert("สั่งอาหารไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const cartTotal = cart.reduce((sum, c) => sum + c.unitPrice * c.quantity, 0);

  if (!sessionToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="text-white" size={28} />
          </div>
          <p className="text-ink font-semibold mb-1">ยังไม่พร้อมสั่งอาหาร</p>
          <p className="text-muted text-sm">{scanError || "กำลังเชื่อมต่อ..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-canvas/90 backdrop-blur px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <UtensilsCrossed className="text-white" size={18} />
            </div>
            <div>
              <p className="text-xs text-muted leading-none">โต๊ะ {tableNumber}</p>
              <p className="text-sm font-semibold leading-tight">Ramen Order</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button className="icon-btn relative" onClick={() => setCartOpen(true)}>
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <button
            className={`pill flex-1 ${tab === "menu" ? "pill-active" : "pill-inactive"}`}
            onClick={() => setTab("menu")}
          >
            สั่งอาหาร
          </button>
          <button
            className={`pill flex-1 ${tab === "orders" ? "pill-active" : "pill-inactive"}`}
            onClick={() => setTab("orders")}
          >
            ออเดอร์ของฉัน
          </button>
        </div>

        {tab === "menu" && (
          <>
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                className="input"
                placeholder="ค้นหาเมนู"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`pill ${activeCategory === cat ? "pill-active" : "pill-inactive"}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </>
        )}
      </header>

      {tab === "menu" ? (
        <div className="px-4 grid grid-cols-2 gap-3 mt-2">
          {filteredItems.map((item) => (
            <ProductCard key={item.id} item={item} onAdd={handleAdd} />
          ))}
          {filteredItems.length === 0 && (
            <p className="col-span-2 text-center text-muted text-sm py-10">ไม่พบเมนูที่ค้นหา</p>
          )}
        </div>
      ) : (
        <MyOrders sessionToken={sessionToken} />
      )}

      {cartCount > 0 && tab === "menu" && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-4 left-4 right-4 bg-accent text-white rounded-full py-3.5 px-5 flex justify-between items-center font-semibold shadow-lg"
        >
          <span>ตะกร้า ({cartCount})</span>
          <span>฿{cartTotal.toFixed(2)}</span>
        </button>
      )}

      {selectingItem && (
        <OrderOptionsModal
          menuItem={selectingItem}
          onCancel={() => setSelectingItem(null)}
          onConfirm={(ids, label, notes) => addToCart(selectingItem, ids, label, notes)}
        />
      )}

      {cartOpen && (
        <CartDrawer
          items={cart}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onClose={() => setCartOpen(false)}
          onSubmit={handleSubmitOrder}
          submitting={submitting}
        />
      )}
    </div>
  );
}