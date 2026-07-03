import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  SlidersHorizontal, X, ChevronDown, ChevronRight,
  Tag, LayoutGrid, Search,
} from "lucide-react";
import { useGetPublicProductsQuery, useGetPublicCategoriesQuery, useGetPublicStorefrontSubcategoriesQuery } from "../api/storefrontApi";
import ProductCard from "../components/ProductCard";

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden animate-pulse">
      <div className="aspect-square bg-neutral-100" />
      <div className="p-3 space-y-2">
        <div className="h-2.5 w-1/3 rounded-full bg-neutral-100" />
        <div className="h-3.5 rounded bg-neutral-100" />
        <div className="h-4 w-1/2 rounded bg-neutral-100 mt-1" />
      </div>
    </div>
  );
}

// ── Filter sidebar content ─────────────────────────────────────────────────────
function FilterSidebar({ categories, filters, onCategoryChange, onSubcategoryChange, onPriceApply, onClear }) {
  const { categoryId, subcategoryId, minPrice, maxPrice } = filters;
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);
  const [expandedCat, setExpandedCat] = useState(categoryId || null);

  useEffect(() => { setLocalMin(minPrice); }, [minPrice]);
  useEffect(() => { setLocalMax(maxPrice); }, [maxPrice]);

  const handleCategoryClick = (id) => {
    if (id === categoryId) {
      onCategoryChange("");
      setExpandedCat(null);
    } else {
      onCategoryChange(id);
      setExpandedCat(id);
    }
  };

  return (
    <div className="space-y-6">
      {(categoryId || subcategoryId || minPrice || maxPrice) && (
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-semibold transition-colors"
        >
          <X size={12} />
          Clear all filters
        </button>
      )}

      {/* Categories */}
      <div>
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
          <LayoutGrid size={12} />
          Categories
        </p>
        {!categories ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 rounded-xl bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-xs text-neutral-400">No categories</p>
        ) : (
          <ul className="space-y-0.5">
            {categories.map((cat) => {
              const isSelected = String(cat.id) === String(categoryId);
              const isExpanded = String(cat.id) === String(expandedCat);
              const hasSubs = cat.Subcategories?.length > 0;
              return (
                <li key={cat.id}>
                  <button
                    onClick={() => handleCategoryClick(String(cat.id))}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm transition-colors text-left ${
                      isSelected
                        ? "bg-primary-50 text-primary-700 font-semibold"
                        : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {isSelected && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
                      )}
                      <span className="truncate">{cat.name}</span>
                    </span>
                    {hasSubs && (
                      <ChevronDown
                        size={13}
                        className={`shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>
                  {hasSubs && isExpanded && (
                    <ul className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-primary-100 pl-3">
                      {cat.Subcategories.map((sub) => {
                        const isSubSel = String(sub.id) === String(subcategoryId);
                        return (
                          <li key={sub.id}>
                            <button
                              onClick={() => onSubcategoryChange(isSubSel ? "" : String(sub.id))}
                              className={`w-full text-left px-2 py-1.5 rounded-lg text-[13px] transition-colors ${
                                isSubSel
                                  ? "text-primary-700 font-semibold bg-primary-50"
                                  : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
                              }`}
                            >
                              {sub.name}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Price Range */}
      <div>
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
          <Tag size={12} />
          Price Range
        </p>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-[10px] text-neutral-400 mb-1">Min (₦)</label>
              <input
                type="number"
                min="0"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-50 transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] text-neutral-400 mb-1">Max (₦)</label>
              <input
                type="number"
                min="0"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                placeholder="Any"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-50 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPriceApply(localMin, localMax)}
              className="flex-1 rounded-xl bg-primary-600 py-2 text-xs font-bold text-white hover:bg-primary-700 transition-colors"
            >
              Apply
            </button>
            {(localMin || localMax) && (
              <button
                onClick={() => { setLocalMin(""); setLocalMax(""); onPriceApply("", ""); }}
                className="px-3 rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
          {(minPrice || maxPrice) && (
            <p className="text-[11px] text-primary-600 font-medium">
              ₦{Number(minPrice || 0).toLocaleString()} – {maxPrice ? `₦${Number(maxPrice).toLocaleString()}` : "Any"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Active filter chips ────────────────────────────────────────────────────────
function FilterChips({ search, categoryId, subcategoryId, minPrice, maxPrice, categories, onClear }) {
  const chips = [];
  if (search) chips.push({ label: `"${search}"`, key: "search" });
  const cat = categories?.find((c) => String(c.id) === String(categoryId));
  if (cat) chips.push({ label: cat.name, key: "cat" });
  const sub = cat?.Subcategories?.find((s) => String(s.id) === String(subcategoryId));
  if (sub) chips.push({ label: sub.name, key: "sub" });
  if (minPrice || maxPrice) {
    chips.push({
      label: `₦${Number(minPrice || 0).toLocaleString()} – ${maxPrice ? `₦${Number(maxPrice).toLocaleString()}` : "Any"}`,
      key: "price",
    });
  }
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs text-neutral-400 font-medium">Active:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-primary-100"
        >
          {chip.label}
          <button
            onClick={() => onClear(chip.key)}
            className="text-primary-400 hover:text-primary-700 transition-colors"
          >
            <X size={11} />
          </button>
        </span>
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);

  const urlSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);

  const [categoryId, setCategoryId] = useState(searchParams.get("category") ?? "");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  const { data: categoriesData } = useGetPublicCategoriesQuery();
  const { data: subcategoriesData } = useGetPublicStorefrontSubcategoriesQuery();
  const categories = (categoriesData ?? []).map((cat) => ({
    ...cat,
    Subcategories: (subcategoriesData ?? []).filter(
      (sub) => String(sub.categoryId) === String(cat.id)
    ),
  }));

  useEffect(() => {
    setSearch(urlSearch);
    setDebouncedSearch(urlSearch);
    setPage(1);
  }, [urlSearch]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
      const params = {};
      if (search) params.search = search;
      setSearchParams(params, { replace: true });
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [categoryId, subcategoryId, minPrice, maxPrice]);

  useEffect(() => {
    const handler = (e) => {
      if (drawerOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [drawerOpen]);

  const queryParams = {
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(categoryId && { categoryId }),
    ...(subcategoryId && { subcategoryId }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
    page,
    limit: 24,
  };

  const { data, isLoading, isFetching } = useGetPublicProductsQuery(queryParams);
  const products = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 24);
  const hasFilters = !!(categoryId || subcategoryId || minPrice || maxPrice || debouncedSearch);

  const handleClearChip = (key) => {
    if (key === "search") setSearch("");
    if (key === "cat") { setCategoryId(""); setSubcategoryId(""); }
    if (key === "sub") setSubcategoryId("");
    if (key === "price") { setMinPrice(""); setMaxPrice(""); }
  };

  const handleClearAll = () => {
    setSearch("");
    setCategoryId("");
    setSubcategoryId("");
    setMinPrice("");
    setMaxPrice("");
  };

  const filterProps = {
    categories,
    filters: { categoryId, subcategoryId, minPrice, maxPrice },
    onCategoryChange: (id) => { setCategoryId(id); setSubcategoryId(""); },
    onSubcategoryChange: setSubcategoryId,
    onPriceApply: (mn, mx) => { setMinPrice(mn); setMaxPrice(mx); },
    onClear: handleClearAll,
  };

  const activeFilterCount = [categoryId, subcategoryId, (minPrice || maxPrice) ? "price" : "", debouncedSearch].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-xs text-neutral-400 mb-5 flex items-center gap-1">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <ChevronRight size={11} />
        <span className="text-neutral-600">Products</span>
        {debouncedSearch && (
          <>
            <ChevronRight size={11} />
            <span className="text-neutral-600">"{debouncedSearch}"</span>
          </>
        )}
      </div>

      <div className="flex gap-7">
        {/* ── Desktop sidebar ─────────────────────────────────────────── */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-28 bg-white rounded-2xl border border-neutral-200 p-5">
            <p className="text-sm font-bold text-neutral-800 mb-5 flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-neutral-400" />
              Filters
            </p>
            <FilterSidebar {...filterProps} />
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl font-bold text-neutral-800">All Products</h1>
              {!isLoading && (
                <p className="text-sm text-neutral-400 mt-0.5">
                  {total} product{total !== 1 ? "s" : ""}
                  {debouncedSearch && ` for "${debouncedSearch}"`}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="rounded-xl border border-neutral-200 bg-white pl-8 pr-8 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-50 transition-all w-48 sm:w-56"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="h-4 w-4 rounded-full bg-primary-600 text-[9px] text-white font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          <FilterChips
            search={debouncedSearch}
            categoryId={categoryId}
            subcategoryId={subcategoryId}
            minPrice={minPrice}
            maxPrice={maxPrice}
            categories={categories}
            onClear={handleClearChip}
          />

          {/* Product grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border border-neutral-200">
              <span className="text-5xl">🛍️</span>
              <p className="text-neutral-500 font-medium">
                {hasFilters ? "No products match your filters" : "No products found"}
              </p>
              {hasFilters && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-primary-600 hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pg = page <= 3 ? i + 1 : page - 2 + i;
                if (pg < 1 || pg > totalPages) return null;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                      pg === page
                        ? "bg-primary-600 border-primary-600 text-white"
                        : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile filter drawer ─────────────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div
            ref={drawerRef}
            className="relative ml-auto w-72 max-w-full h-full bg-white shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <p className="text-sm font-bold text-neutral-800">Filters</p>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <FilterSidebar {...filterProps} />
            </div>
            <div className="p-4 border-t border-neutral-100">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full rounded-xl bg-primary-600 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-colors"
              >
                Show Results ({total})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
