import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Star
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { api } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
const AdminMenu = () => {
  const { success, error } = useNotification();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ingredients: "",
    price: "",
    category: "Starters",
    isVeg: true,
    image: "",
    preparationTimeMinutes: "15",
    isPopular: false,
    isAvailable: true
  });
  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      const [menuRes, catRes] = await Promise.all([
        api.getMenu({
          category: selectedCategory === "All" ? void 0 : selectedCategory,
          search: searchQuery
        }),
        api.getCategories()
      ]);
      if (menuRes.success && menuRes.data) {
        setFoods(menuRes.data);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.warn("Failed to fetch menu:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchMenu();
  }, [selectedCategory, searchQuery]);
  const handleOpenAdd = () => {
    setEditingFood(null);
    setFormData({
      name: "",
      description: "",
      ingredients: "",
      price: "",
      category: categories[0]?.name || "Starters",
      isVeg: true,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
      preparationTimeMinutes: "15",
      isPopular: false,
      isAvailable: true
    });
    setIsModalOpen(true);
  };
  const handleOpenEdit = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      description: food.description,
      ingredients: food.ingredients ? food.ingredients.join(", ") : "",
      price: String(food.price),
      category: food.category,
      isVeg: food.isVeg,
      image: food.image,
      preparationTimeMinutes: String(food.preparationTimeMinutes || 15),
      isPopular: food.isPopular,
      isAvailable: food.isAvailable
    });
    setIsModalOpen(true);
  };
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      error("Name and Price are required.");
      return;
    }
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        ingredients: formData.ingredients.split(",").map((s) => s.trim()).filter(Boolean),
        price: Number(formData.price) || 0,
        category: formData.category,
        isVeg: formData.isVeg,
        image: formData.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
        preparationTimeMinutes: Number(formData.preparationTimeMinutes) || 15,
        isPopular: formData.isPopular,
        isAvailable: formData.isAvailable
      };
      if (editingFood) {
        const id = editingFood.id || editingFood._id;
        await api.updateFood(id, payload);
        success(`Updated dish "${formData.name}"`);
      } else {
        await api.createFood(payload);
        success(`Added new dish "${formData.name}"`);
      }
      setIsModalOpen(false);
      fetchMenu();
    } catch (err) {
      error(err.message || "Operation failed");
    }
  };
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the menu?`)) return;
    try {
      await api.deleteFood(id);
      success(`Removed "${name}" from menu`);
      fetchMenu();
    } catch (err) {
      error(err.message || "Failed to delete");
    }
  };
  const handleToggleAvailable = async (food) => {
    const id = food.id || food._id;
    try {
      await api.updateFood(id, { isAvailable: !food.isAvailable });
      setFoods(
        (prev) => prev.map((f) => (f.id || f._id) === id ? { ...f, isAvailable: !food.isAvailable } : f)
      );
      success(`${food.name} marked as ${!food.isAvailable ? "In Stock" : "Sold Out"}`);
    } catch (err) {
      error(err.message || "Update failed");
    }
  };
  return <AdminLayout>
      <div className="space-y-6">
        {
    /* Header */
  }
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
              Culinary Menu Catalog ({foods.length} Dishes)
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Add new dishes, adjust pricing, manage out-of-stock items, and update ingredients.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
    onClick={handleOpenAdd}
    id="btn-add-new-dish"
    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm transition-colors shadow-md shadow-amber-500/20"
  >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          </div>
        </div>

        {
    /* Search & Category Pills */
  }
        <div className="space-y-3">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
    type="text"
    placeholder="Search by dish name, category, or ingredients..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500 text-zinc-100 placeholder:text-zinc-500"
  />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
    onClick={() => setSelectedCategory("All")}
    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${selectedCategory === "All" ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800"}`}
  >
              All Categories
            </button>
            {categories.map((c) => <button
    key={c.name}
    onClick={() => setSelectedCategory(c.name)}
    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${selectedCategory === c.name ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800"}`}
  >
                {c.name}
              </button>)}
          </div>
        </div>

        {
    /* Table of Foods */
  }
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Dish</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Prep Time</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {foods.map((food) => {
    const id = food.id || food._id;
    return <tr key={id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
      src={food.image}
      alt={food.name}
      className="w-11 h-11 rounded-lg object-cover bg-zinc-950 shrink-0"
    />
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                              <span>{food.name}</span>
                              <span className={`w-2 h-2 rounded-full ${food.isVeg ? "bg-emerald-500" : "bg-rose-500"}`} />
                              {food.isPopular && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                                  Popular
                                </span>}
                            </div>
                            <div className="text-[11px] text-zinc-500 truncate max-w-xs">
                              {food.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-zinc-300">{food.category}</td>
                      <td className="py-3 px-4 font-extrabold text-amber-400 text-sm">₹{food.price}</td>
                      <td className="py-3 px-4 text-zinc-400">{food.preparationTimeMinutes || 15}m</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{food.rating || 4.8}</span>
                          <span className="text-[10px] text-zinc-500">({food.ratingsCount || 1})</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
      onClick={() => handleToggleAvailable(food)}
      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${food.isAvailable ? "bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900" : "bg-rose-950 text-rose-400 border border-rose-800 hover:bg-rose-900"}`}
    >
                          {food.isAvailable ? "In Stock" : "Sold Out"}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
      onClick={() => handleOpenEdit(food)}
      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
      title="Edit Dish"
    >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
      onClick={() => handleDelete(id, food.name)}
      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/60 text-zinc-400 hover:text-rose-400 transition-colors"
      title="Delete Dish"
    >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>;
  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {
    /* Add / Edit Modal */
  }
      {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="font-bold text-lg text-white">
                {editingFood ? "Edit Dish Details" : "Add New Culinary Dish"}
              </h3>
              <button
    onClick={() => setIsModalOpen(false)}
    className="icon-btn p-1.5 text-zinc-400 hover:text-white rounded-lg"
  >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Dish Name <span className="text-rose-400">*</span>
                  </label>
                  <input
    type="text"
    required
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
    placeholder="e.g. Kashmiri Rogan Josh"
  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
    value={formData.category}
    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  >
                    {categories.map((c) => <option key={c.name} value={c.name}>
                        {c.name}
                      </option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Price in INR (₹) <span className="text-rose-400">*</span>
                  </label>
                  <input
    type="number"
    required
    value={formData.price}
    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
    placeholder="340"
  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Prep Time (Minutes)
                  </label>
                  <input
    type="number"
    value={formData.preparationTimeMinutes}
    onChange={(e) => setFormData({ ...formData, preparationTimeMinutes: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
    placeholder="15"
  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
    rows={2}
    value={formData.description}
    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all resize-none"
    placeholder="Rich, slow-simmered Kashmiri gravy with tender spices..."
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Ingredients (Comma separated)
                </label>
                <input
    type="text"
    value={formData.ingredients}
    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
    placeholder="Paneer, Cream, Butter, Cashews, Saffron"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Photo URL
                </label>
                <input
    type="url"
    value={formData.image}
    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
    placeholder="https://images.unsplash.com/..."
  />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
                  <input
    type="checkbox"
    checked={formData.isVeg}
    onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-zinc-950 border-zinc-800"
  />
                  <span>Pure Vegetarian (Veg)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
                  <input
    type="checkbox"
    checked={formData.isPopular}
    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-zinc-950 border-zinc-800"
  />
                  <span>Mark as Chef Pick / Popular</span>
                </label>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-2">
                <button
    type="button"
    onClick={() => setIsModalOpen(false)}
    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20"
  >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>}
    </AdminLayout>;
};
export {
  AdminMenu
};
